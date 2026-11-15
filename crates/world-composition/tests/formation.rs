use world_composition::formation::{Budget, Goal, Offer, Slot, Window};
use world_composition::{Engine, Error, Evidence, Feasibility, Polarity, Requirement};
use world_language::Id;

fn id(n: u64) -> Id {
    Id::parse(&format!("00000000-0000-4000-8000-{n:012x}")).unwrap()
}

fn window(start_ms: u64, end_ms: u64) -> Window {
    Window { start_ms, end_ms }
}

fn goal() -> Goal {
    Goal {
        id: id(4),
        revision: 1,
        scope: id(1),
        work: id(2),
        work_revision: 3,
        intended_outcome: "تشغيل تجربة مشتركة".into(),
        place: id(5),
        window: window(10, 100),
        minimum_duration_ms: 20,
        distinct_participants: true,
        slots: vec![
            Slot {
                id: id(11),
                capability: id(21),
                proposed_role: "Implementation".into(),
            },
            Slot {
                id: id(12),
                capability: id(22),
                proposed_role: "Distribution".into(),
            },
        ],
        conditions: vec![Requirement {
            claim: id(80),
            hard: true,
        }],
    }
}

fn offer(n: u64, capability: u64, participant: u64, available: Window) -> Offer {
    Offer {
        id: id(n),
        revision: 1,
        scope: id(1),
        participant: id(participant),
        capability: id(capability),
        place: id(5),
        window: available,
        capability_claim: id(n + 100),
        availability_claim: id(n + 200),
    }
}

fn engine() -> Engine {
    Engine::new(id(1), 10).unwrap()
}

fn budget() -> Budget {
    Budget {
        nodes: 100,
        results: 10,
    }
}

#[test]
fn combines_complementary_offers_into_a_new_hypothesis() {
    let mut e = engine();
    let offers = [
        offer(31, 21, 41, window(20, 70)),
        offer(32, 22, 42, window(40, 90)),
    ];
    let result = e.form(&goal(), &offers, budget()).unwrap();
    assert!(!result.limited);
    assert_eq!(result.proposals.len(), 1);
    let proposal = &result.proposals[0];
    assert_eq!(proposal.window(), window(40, 70));
    assert_eq!(proposal.place(), &id(5));
    assert_eq!(proposal.key().assignments[0].offer, id(31));
    let candidate = proposal.candidate(id(90));
    assert_eq!(candidate.work_revision, 3);
    assert_eq!(candidate.roles.len(), 2);
    assert_eq!(candidate.requirements.len(), 5);
    assert!(e.evaluation(&id(90)).is_none());
    e.register(candidate.clone()).unwrap();
    assert_eq!(
        e.evaluation(&id(90)).unwrap().feasibility,
        Feasibility::Conditional
    );
    for (n, condition) in candidate.requirements.iter().enumerate() {
        e.upsert(Evidence {
            id: id(500 + n as u64),
            revision: 1,
            scope: id(1),
            claim: condition.claim.clone(),
            source: id(600 + n as u64),
            source_revision: 1,
            polarity: Polarity::Supports,
            valid_from_ms: 0,
            valid_until_ms: None,
            withdrawn: false,
        })
        .unwrap();
    }
    assert_eq!(
        e.evaluation(&id(90)).unwrap().feasibility,
        Feasibility::SupportedUnderEvidence
    );
}

#[test]
fn excludes_insufficient_overlap_wrong_place_and_same_participant() {
    let e = engine();
    let mut wrong_place = offer(35, 22, 45, window(20, 70));
    wrong_place.place = id(99);
    let offers = [
        offer(31, 21, 41, window(20, 70)),
        offer(32, 22, 42, window(51, 90)),
        offer(33, 22, 41, window(30, 70)),
        wrong_place,
    ];
    assert!(
        e.form(&goal(), &offers, budget())
            .unwrap()
            .proposals
            .is_empty()
    );
    let mut g = goal();
    g.distinct_participants = false;
    let result = e.form(&g, &offers, budget()).unwrap();
    assert_eq!(result.proposals.len(), 1);
    assert_eq!(result.proposals[0].key().assignments[1].offer, id(33));
}

#[test]
fn ordering_is_stable_and_changed_offer_version_changes_key() {
    let e = engine();
    let mut g = goal();
    let mut offers = vec![
        offer(33, 22, 43, window(20, 80)),
        offer(31, 21, 41, window(20, 70)),
        offer(32, 22, 42, window(40, 90)),
    ];
    let a = e.form(&g, &offers, budget()).unwrap();
    assert_eq!(a.proposals.len(), 2);
    g.slots.reverse();
    offers.reverse();
    assert_eq!(a, e.form(&g, &offers, budget()).unwrap());
    offers[0].revision = 2;
    let b = e.form(&g, &offers, budget()).unwrap();
    assert_ne!(a.proposals[0].key(), b.proposals[0].key());
    assert_eq!(a.proposals[1].key(), b.proposals[1].key());
}

#[test]
fn budget_reports_incomplete_search_without_inventing_results() {
    let e = engine();
    let offers = [
        offer(31, 21, 41, window(20, 70)),
        offer(32, 22, 42, window(40, 90)),
        offer(33, 22, 43, window(30, 80)),
    ];
    let a = e
        .form(
            &goal(),
            &offers,
            Budget {
                nodes: 1,
                results: 10,
            },
        )
        .unwrap();
    assert!(a.limited);
    assert_eq!(a.visited, 1);
    assert!(a.proposals.is_empty());
    let b = e
        .form(
            &goal(),
            &offers,
            Budget {
                nodes: 100,
                results: 1,
            },
        )
        .unwrap();
    assert!(b.limited);
    assert_eq!(b.proposals.len(), 1);
    assert_eq!(
        e.form(
            &goal(),
            &offers,
            Budget {
                nodes: 0,
                results: 1
            }
        ),
        Err(Error::Capacity)
    );
}

#[test]
fn rejects_mixed_scope_duplicate_identity_and_invalid_windows() {
    let e = engine();
    let o = offer(31, 21, 41, window(20, 70));
    let mut foreign = o.clone();
    foreign.scope = id(99);
    assert_eq!(
        e.form(&goal(), &[o.clone(), foreign], budget()),
        Err(Error::ScopeMismatch)
    );
    assert_eq!(
        e.form(&goal(), &[o.clone(), o.clone()], budget()),
        Err(Error::IdentityConflict)
    );
    let mut invalid = o;
    invalid.window = window(80, 20);
    assert_eq!(
        e.form(&goal(), &[invalid], budget()),
        Err(Error::InvalidValue)
    );
    let mut g = goal();
    g.scope = id(99);
    assert_eq!(e.form(&g, &[], budget()), Err(Error::ScopeMismatch));
}

#[test]
fn a_single_offer_is_not_implicitly_reused_and_hard_claim_wins() {
    let e = engine();
    let mut g = goal();
    g.distinct_participants = false;
    g.slots[1].capability = id(21);
    let a = offer(31, 21, 41, window(20, 70));
    assert!(
        e.form(&g, std::slice::from_ref(&a), budget())
            .unwrap()
            .proposals
            .is_empty()
    );
    g.conditions.push(Requirement {
        claim: a.capability_claim.clone(),
        hard: false,
    });
    let b = offer(32, 21, 41, window(20, 70));
    let result = e.form(&g, &[a.clone(), b], budget()).unwrap();
    assert_eq!(result.proposals.len(), 2);
    let candidate = result.proposals[0].candidate(id(90));
    assert!(
        candidate
            .requirements
            .iter()
            .find(|r| r.claim == a.capability_claim)
            .unwrap()
            .hard
    );
}
