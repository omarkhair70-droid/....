mod research_fixture;

use world_composition::Feasibility;
use world_composition::archive::{Archive, ArchiveError};

#[test]
fn record_roundtrip_rebuilds_candidate_and_evidence() {
    let (archive, authority) = research_fixture::fixture();
    let raw = archive.encode().unwrap();
    let parsed = Archive::parse(&raw).unwrap();
    assert!(parsed == archive);
    let a = archive.restore(&authority).unwrap();
    let b = parsed.restore(&authority).unwrap();
    assert_eq!(a.formation, b.formation);
    assert_eq!(a.evaluations, b.evaluations);
    assert_eq!(
        b.evaluations.values().next().unwrap().feasibility,
        Feasibility::SupportedUnderEvidence
    );
    assert_eq!(b.work_revision, 1);
}

#[test]
fn restoration_requires_fresh_scope_and_source_review_grants() {
    let (archive, mut authority) = research_fixture::fixture();
    authority.source_versions.clear();
    assert!(matches!(
        archive.restore(&authority),
        Err(ArchiveError::Denied)
    ));
    let (_, mut authority) = research_fixture::fixture();
    authority.reviewers.clear();
    assert!(matches!(
        archive.restore(&authority),
        Err(ArchiveError::Denied)
    ));
}

#[test]
fn reconstructed_formation_rejects_forged_selection_and_citations() {
    let (mut archive, authority) = research_fixture::fixture();
    archive.selections[0].key.goal_revision = 99;
    assert!(matches!(
        archive.restore(&authority),
        Err(ArchiveError::Invalid)
    ));
    let (mut archive, authority) = research_fixture::fixture();
    archive.assertions[0].citation.excerpt = "invented".into();
    assert!(matches!(
        archive.restore(&authority),
        Err(ArchiveError::Admission)
    ));
}

#[test]
fn wire_rejects_unknown_version_and_duplicate_keys() {
    let (archive, _) = research_fixture::fixture();
    let raw = archive.encode().unwrap();
    let changed = raw.replacen("\"version\":\"0.1\"", "\"version\":\"9.9\"", 1);
    assert_ne!(changed, raw);
    assert!(Archive::parse(&changed).is_err());
    let duplicate = raw.replacen(
        "\"version\":\"0.1\"",
        "\"version\":\"0.1\",\"version\":\"0.1\"",
        1,
    );
    assert_ne!(duplicate, raw);
    assert!(Archive::parse(&duplicate).is_err());
}

#[test]
fn missing_claim_and_duplicate_selection_fail_closed() {
    let (mut archive, authority) = research_fixture::fixture();
    archive.claims.pop();
    assert!(matches!(
        archive.restore(&authority),
        Err(ArchiveError::Invalid)
    ));
    let (mut archive, authority) = research_fixture::fixture();
    archive.selections.push(archive.selections[0].clone());
    assert!(matches!(
        archive.restore(&authority),
        Err(ArchiveError::Invalid)
    ));
}
