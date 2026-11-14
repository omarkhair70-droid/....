use std::collections::BTreeSet;
use world_composition::knowledge::{AdmissionError, Assertion, Citation, Claim, Knowledge, Source};
use world_composition::{Candidate, Evidence, Knowledge as State, Polarity, Requirement, Role};
use world_language::Id;

fn id(n: u64) -> Id {
    Id::parse(&format!("00000000-0000-4000-8000-{n:012x}")).unwrap()
}

fn source() -> Source {
    Source {
        id: id(10),
        revision: 2,
        scope: id(1),
        locator: "synthetic:source".into(),
        acquired_at_ms: 10,
        text: "قدرة مثبتة / Synthetic capability".into(),
    }
}

fn claim() -> Claim {
    Claim {
        id: id(20),
        scope: id(1),
        proposition: "A contextual capability proposition".into(),
    }
}

fn assertion() -> Assertion {
    let excerpt = "قدرة مثبتة";
    Assertion {
        evidence: Evidence {
            id: id(30),
            revision: 1,
            scope: id(1),
            claim: id(20),
            source: id(10),
            source_revision: 2,
            polarity: Polarity::Supports,
            valid_from_ms: 0,
            valid_until_ms: None,
            withdrawn: false,
        },
        citation: Citation {
            source: id(10),
            source_revision: 2,
            start: 0,
            end: excerpt.len(),
            excerpt: excerpt.into(),
        },
        reviewer: id(40),
        reviewed_at_ms: 11,
    }
}

fn ledger() -> Knowledge {
    let mut k = Knowledge::new(id(1), 20, BTreeSet::from([id(40)])).unwrap();
    k.add_source(source()).unwrap();
    k.add_claim(claim()).unwrap();
    k
}

fn candidate() -> Candidate {
    Candidate {
        id: id(50),
        scope: id(1),
        work: id(2),
        work_revision: 1,
        intended_outcome: "Joint work".into(),
        roles: vec![Role {
            participant: id(3),
            proposed_role: "Proposed contributor".into(),
        }],
        requirements: vec![Requirement {
            claim: id(20),
            hard: true,
        }],
    }
}

#[test]
fn exact_arabic_excerpt_and_review_feed_the_existing_engine() {
    let mut k = ledger();
    k.admit(assertion()).unwrap();
    let mut e = k.build_engine().unwrap();
    e.register(candidate()).unwrap();
    let result = e.evaluation(&id(50)).unwrap();
    assert_eq!(result.conditions[0].knowledge, State::Supported);
    assert_eq!(result.conditions[0].supporting[0].source_revision, 2);
    assert_eq!(k.assertion(&id(30)).unwrap().citation.excerpt, "قدرة مثبتة");
}

#[test]
fn fabricated_text_and_broken_unicode_offsets_are_rejected() {
    let mut k = ledger();
    let mut a = assertion();
    a.citation.excerpt = "invented citation".into();
    assert_eq!(k.admit(a), Err(AdmissionError::CitationMismatch));
    let mut a = assertion();
    a.citation.start = 1;
    assert_eq!(k.admit(a), Err(AdmissionError::CitationMismatch));
    assert!(k.assertion(&id(30)).is_none());
}

#[test]
fn missing_review_and_mixed_scope_fail_closed() {
    let mut k = ledger();
    let mut a = assertion();
    a.reviewer = id(99);
    assert_eq!(k.admit(a), Err(AdmissionError::MissingReviewerGrant));
    let mut a = assertion();
    a.evidence.scope = id(99);
    assert_eq!(k.admit(a), Err(AdmissionError::Scope));
    let mut s = source();
    s.scope = id(99);
    assert_eq!(k.add_source(s), Err(AdmissionError::Scope));
    let mut c = claim();
    c.scope = id(99);
    assert_eq!(k.add_claim(c), Err(AdmissionError::Scope));
}

#[test]
fn source_version_and_review_time_must_match() {
    let mut k = ledger();
    let mut a = assertion();
    a.evidence.source_revision = 1;
    assert_eq!(k.admit(a), Err(AdmissionError::Invalid));
    let mut a = assertion();
    a.reviewed_at_ms = 9;
    assert_eq!(k.admit(a), Err(AdmissionError::Invalid));
    let mut a = assertion();
    a.reviewed_at_ms = 21;
    assert_eq!(k.admit(a), Err(AdmissionError::Invalid));
    let mut s = source();
    s.revision = 3;
    assert_eq!(k.add_source(s), Err(AdmissionError::DuplicateIdentity));
}

#[test]
fn snapshot_rebuild_excludes_withdrawn_scope_and_preserves_uncertainty() {
    let mut k = ledger();
    let a = assertion();
    k.admit(a.clone()).unwrap();
    k.admit(a).unwrap();
    let mut contrary = assertion();
    contrary.evidence.id = id(31);
    contrary.evidence.polarity = Polarity::Opposes;
    k.admit(contrary).unwrap();
    let mut e = k.build_engine().unwrap();
    e.register(candidate()).unwrap();
    assert_eq!(
        e.evaluation(&id(50)).unwrap().conditions[0].knowledge,
        State::Contested
    );
    let mut without_access = Knowledge::new(id(1), 20, BTreeSet::new())
        .unwrap()
        .build_engine()
        .unwrap();
    without_access.register(candidate()).unwrap();
    assert_eq!(
        without_access.evaluation(&id(50)).unwrap().conditions[0].knowledge,
        State::Unknown
    );
}

#[test]
fn absent_source_and_claim_cannot_be_synthesized_by_admission() {
    let mut k = Knowledge::new(id(1), 20, BTreeSet::from([id(40)])).unwrap();
    assert_eq!(k.admit(assertion()), Err(AdmissionError::MissingClaim));
    k.add_claim(claim()).unwrap();
    assert_eq!(k.admit(assertion()), Err(AdmissionError::MissingSource));
}
