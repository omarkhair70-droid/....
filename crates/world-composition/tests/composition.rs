use world_composition::{
    Candidate, Engine, Error, Evidence, Feasibility, Knowledge, Polarity, Requirement, Role,
};
use world_language::Id;

fn id(n: u64) -> Id {
    Id::parse(&format!("00000000-0000-4000-8000-{n:012x}")).unwrap()
}

fn candidate(n: u64, claims: &[u64]) -> Candidate {
    Candidate {
        id: id(n),
        scope: id(1),
        work: id(2),
        work_revision: 1,
        intended_outcome: "تجربة مشتركة".into(),
        roles: vec![Role {
            participant: id(3),
            proposed_role: "Proposed implementation".into(),
        }],
        requirements: claims
            .iter()
            .map(|n| Requirement {
                claim: id(*n),
                hard: true,
            })
            .collect(),
    }
}

fn evidence(n: u64, claim: u64, polarity: Polarity) -> Evidence {
    Evidence {
        id: id(n),
        revision: 1,
        scope: id(1),
        claim: id(claim),
        source: id(n + 1000),
        source_revision: 1,
        polarity,
        valid_from_ms: 0,
        valid_until_ms: None,
        withdrawn: false,
    }
}

fn engine() -> Engine {
    Engine::new(id(1), 10).unwrap()
}

fn assert_consistent(engine: &Engine) {
    for (id, expected) in engine.recompute_all() {
        assert_eq!(engine.evaluation(&id), Some(&expected));
    }
}

#[test]
fn missing_and_conflicting_evidence_are_not_false() {
    let mut e = engine();
    e.register(candidate(10, &[100])).unwrap();
    assert_eq!(e.evaluation(&id(10)).unwrap().conditions[0].knowledge, Knowledge::Unknown);
    let yes = evidence(200, 100, Polarity::Supports);
    e.upsert(yes.clone()).unwrap();
    assert_eq!(e.evaluation(&id(10)).unwrap().feasibility, Feasibility::SupportedUnderEvidence);
    let no = evidence(201, 100, Polarity::Opposes);
    e.upsert(no).unwrap();
    let v = e.evaluation(&id(10)).unwrap();
    assert_eq!(v.conditions[0].knowledge, Knowledge::Contested);
    assert_eq!(v.feasibility, Feasibility::Conditional);
    assert_eq!(v.conditions[0].supporting[0].source_id, yes.source);
    let mut withdrawn = yes;
    withdrawn.revision = 2;
    withdrawn.withdrawn = true;
    e.upsert(withdrawn).unwrap();
    assert_eq!(e.evaluation(&id(10)).unwrap().feasibility, Feasibility::BlockedUnderEvidence);
    assert_consistent(&e);
}

#[test]
fn dependency_updates_touch_only_related_candidates() {
    let mut e = engine();
    e.register(candidate(10, &[100, 101])).unwrap();
    e.register(candidate(11, &[100])).unwrap();
    e.register(candidate(12, &[102])).unwrap();
    let old = e.evaluation(&id(12)).unwrap().clone();
    let source = evidence(200, 100, Polarity::Supports);
    let change = e.upsert(source.clone()).unwrap();
    assert_eq!(change.evaluated, vec![id(10), id(11)]);
    assert_eq!(change.changed, change.evaluated);
    assert_eq!(e.evaluation(&id(12)), Some(&old));
    assert!(e.upsert(source).unwrap().evaluated.is_empty());
    assert_consistent(&e);
}

#[test]
fn time_windows_activate_and_expire_without_new_evidence() {
    let mut e = engine();
    e.register(candidate(10, &[100])).unwrap();
    e.register(candidate(11, &[101])).unwrap();
    let mut dated = evidence(200, 100, Polarity::Supports);
    dated.valid_from_ms = 20;
    dated.valid_until_ms = Some(30);
    assert!(e.upsert(dated).unwrap().changed.is_empty());
    assert_eq!(e.advance_to(20).unwrap().changed, vec![id(10)]);
    assert_eq!(e.evaluation(&id(10)).unwrap().feasibility, Feasibility::SupportedUnderEvidence);
    assert!(e.advance_to(29).unwrap().evaluated.is_empty());
    assert_eq!(e.advance_to(30).unwrap().changed, vec![id(10)]);
    assert_eq!(e.evaluation(&id(10)).unwrap().conditions[0].knowledge, Knowledge::Unknown);
    assert_eq!(e.advance_to(29), Err(Error::InvalidValue));
    assert_consistent(&e);
}

#[test]
fn scope_version_and_identity_rejections_leave_state_unchanged() {
    let mut e = engine();
    e.register(candidate(10, &[100])).unwrap();
    let mut source = evidence(200, 100, Polarity::Supports);
    source.revision = 2;
    e.upsert(source.clone()).unwrap();
    let baseline = e.recompute_all();
    let mut other = source.clone();
    other.scope = id(99);
    assert_eq!(e.upsert(other), Err(Error::ScopeMismatch));
    let mut old = source.clone();
    old.revision = 1;
    assert_eq!(e.upsert(old), Err(Error::StaleEvidence));
    let mut collision = source.clone();
    collision.polarity = Polarity::Opposes;
    assert_eq!(e.upsert(collision), Err(Error::IdentityConflict));
    let mut renamed = source;
    renamed.revision = 3;
    renamed.claim = id(101);
    assert_eq!(e.upsert(renamed), Err(Error::IdentityConflict));
    let mut c = candidate(11, &[100]);
    c.scope = id(99);
    assert_eq!(e.register(c), Err(Error::ScopeMismatch));
    assert_eq!(e.register(candidate(10, &[101])), Err(Error::IdentityConflict));
    assert_eq!(e.recompute_all(), baseline);
    assert_consistent(&e);
}

#[test]
fn optional_opposition_does_not_block_and_empty_conditions_are_invalid() {
    let mut e = engine();
    assert_eq!(e.register(candidate(10, &[])), Err(Error::InvalidValue));
    assert_eq!(e.register(candidate(10, &[100, 100])), Err(Error::InvalidValue));
    let mut c = candidate(10, &[100, 101]);
    c.requirements[1].hard = false;
    e.register(c).unwrap();
    e.upsert(evidence(200, 100, Polarity::Supports)).unwrap();
    e.upsert(evidence(201, 101, Polarity::Opposes)).unwrap();
    assert_eq!(e.evaluation(&id(10)).unwrap().feasibility, Feasibility::Conditional);
    assert_consistent(&e);
}

#[test]
fn incremental_results_match_recomputation_over_fixed_sequence() {
    let mut e = engine();
    for n in 0..16 {
        e.register(candidate(10 + n, &[100 + n % 4])).unwrap();
    }
    let mut seed = 42_u64;
    for n in 0..96 {
        seed = seed.wrapping_mul(6364136223846793005).wrapping_add(1);
        let mut item = evidence(
            200 + n,
            100 + (seed >> 32) % 4,
            if seed & 1 == 0 { Polarity::Supports } else { Polarity::Opposes },
        );
        item.valid_from_ms = n;
        item.valid_until_ms = Some(n + 20);
        e.upsert(item.clone()).unwrap();
        e.advance_to(10 + n).unwrap();
        if n % 3 == 0 {
            item.revision = 2;
            item.withdrawn = true;
            e.upsert(item).unwrap();
        }
        assert_consistent(&e);
    }
}
