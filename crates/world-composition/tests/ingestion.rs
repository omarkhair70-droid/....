use std::collections::BTreeSet;
use world_composition::ingestion::{Error, Extraction, ImportPermit, JobSpec, import_text};
use world_composition::knowledge::{Assertion, Claim, Knowledge};
use world_composition::retrieval::{Corpus, Grants};
use world_composition::{Evidence, Polarity};
use world_language::Id;

fn id(n: u64) -> Id {
    Id::parse(&format!("00000000-0000-4000-8000-{n:012x}")).unwrap()
}

fn grants() -> Grants {
    Grants { scope: id(1), versions: BTreeSet::from([(id(2), 1)]) }
}

fn permit() -> ImportPermit {
    ImportPermit {
        scope: id(1), source: id(2), revision: 1,
        locator: "manual:synthetic".into(), expires_at_ms: 100,
    }
}

fn job() -> JobSpec {
    JobSpec {
        job: id(5), scope: id(1), work_revision: 7, expires_at_ms: 50,
        max_hits: 4, max_proposals: 2,
    }
}

const TEXT: &str = "أعمال الهندسة / Engineering capability";
const PROPOSITION: &str = "Proposed capability";

fn fixture() -> (Grants, Corpus, Extraction) {
    let grants = grants();
    let source = import_text(&permit(), &grants, 10, TEXT.as_bytes()).unwrap();
    let corpus = Corpus::new(&grants, vec![source]).unwrap();
    let extraction = Extraction::prepare(job(), &grants, &corpus, "اعمال engineering", 11).unwrap();
    (grants, corpus, extraction)
}

fn response() -> String {
    serde_json::json!({
        "version":"0.1", "job":id(5),
        "proposals":[{"excerpt_index":0,"proposition":PROPOSITION,"polarity":"supports"}]
    }).to_string()
}

#[test]
fn exact_import_and_untrusted_extraction_then_separate_review() {
    let (grants, corpus, extraction) = fixture();
    let input = extraction.input_json(&grants, &corpus, 7, 12).unwrap();
    assert!(input.contains(TEXT));
    assert!(!input.contains("manual:synthetic"));
    let mut proposals = extraction.validate_output(&response(), &grants, &corpus, 7, 13).unwrap();
    let proposal = proposals.pop().unwrap();
    assert_eq!(proposal.citation.excerpt, TEXT);
    let mut knowledge = Knowledge::new(id(1), 30, BTreeSet::from([id(9)])).unwrap();
    knowledge.add_source(import_text(&permit(), &grants, 10, TEXT.as_bytes()).unwrap()).unwrap();
    knowledge.add_claim(Claim { id: id(3), scope: id(1), proposition: proposal.proposition }).unwrap();
    assert!(knowledge.assertion(&id(4)).is_none());
    // Synthetic human review. The authenticated boundary allocates IDs and
    // chooses whether the cited material actually supports the proposition.
    knowledge.admit(Assertion {
        evidence: Evidence {
            id: id(4), revision: 1, scope: id(1), claim: id(3),
            source: id(2), source_revision: 1, polarity: proposal.polarity,
            valid_from_ms: 10, valid_until_ms: None, withdrawn: false,
        },
        citation: proposal.citation, reviewer: id(9), reviewed_at_ms: 14,
    }).unwrap();
    assert_eq!(knowledge.polarity(&id(4)), Some(Polarity::Supports));
}

#[test]
fn import_is_limited_to_exact_grants_bytes_and_expiration() {
    let mut g = grants();
    let p = permit();
    assert_eq!(import_text(&p, &g, 100, b"expired"), Err(Error::Denied));
    assert_eq!(import_text(&p, &g, 10, &[0xff]), Err(Error::Invalid));
    assert_eq!(import_text(&p, &g, 10, &vec![b'x'; 128 * 1024 + 1]), Err(Error::Capacity));
    g.versions.clear();
    assert_eq!(import_text(&p, &g, 10, b"denied"), Err(Error::Denied));
}

#[test]
fn changed_work_expired_job_and_revoked_sources_block_results() {
    let (mut grants, corpus, extraction) = fixture();
    assert_eq!(extraction.input_json(&grants, &corpus, 8, 12), Err(Error::Denied));
    assert_eq!(extraction.validate_output(&response(), &grants, &corpus, 7, 50), Err(Error::Denied));
    grants.versions.clear();
    assert_eq!(extraction.input_json(&grants, &corpus, 7, 12), Err(Error::Denied));
    assert_eq!(extraction.validate_output(&response(), &grants, &corpus, 7, 13), Err(Error::Denied));
}

#[test]
fn invented_source_authority_or_job_binding_is_not_accepted() {
    let (grants, corpus, extraction) = fixture();
    let mut value: serde_json::Value = serde_json::from_str(&response()).unwrap();
    value["proposals"][0]["reviewer"] = serde_json::json!(id(9));
    assert_eq!(extraction.validate_output(&value.to_string(), &grants, &corpus, 7, 12), Err(Error::Shape));
    let mut value: serde_json::Value = serde_json::from_str(&response()).unwrap();
    value["proposals"][0]["excerpt_index"] = serde_json::json!(99);
    assert_eq!(extraction.validate_output(&value.to_string(), &grants, &corpus, 7, 12), Err(Error::Invalid));
    let mut value: serde_json::Value = serde_json::from_str(&response()).unwrap();
    value["job"] = serde_json::json!(id(6));
    assert_eq!(extraction.validate_output(&value.to_string(), &grants, &corpus, 7, 12), Err(Error::Invalid));
}

#[test]
fn limits_and_nonmatching_sources_cannot_create_evidence() {
    let (grants, corpus, extraction) = fixture();
    let mut value: serde_json::Value = serde_json::from_str(&response()).unwrap();
    let item = value["proposals"][0].clone();
    value["proposals"] = serde_json::json!([item.clone(), item.clone(), item]);
    assert_eq!(extraction.validate_output(&value.to_string(), &grants, &corpus, 7, 12), Err(Error::Capacity));
    let empty = Extraction::prepare(job(), &grants, &corpus, "unmatched", 11).unwrap();
    assert_eq!(empty.validate_output(&response(), &grants, &corpus, 7, 12), Err(Error::Invalid));
    let abstain = serde_json::json!({"version":"0.1","job":id(5),"proposals":[]});
    assert!(empty.validate_output(&abstain.to_string(), &grants, &corpus, 7, 12).unwrap().is_empty());
}
