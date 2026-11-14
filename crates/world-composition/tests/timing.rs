use world_composition::formation::timing::Origin;
use world_composition::formation::{Budget, Goal, Offer, Slot, Window};
use world_composition::{Engine, Error};
use world_language::Id;

fn id(n: u64) -> Id {
    Id::parse(&format!("00000000-0000-4000-8000-{n:012x}")).unwrap()
}

fn window(start_ms: u64, end_ms: u64) -> Window {
    Window { start_ms, end_ms }
}

fn fixture() -> (Goal, Vec<Offer>, Engine) {
    let scope = id(1);
    let goal = Goal {
        id: id(2),
        revision: 1,
        scope: scope.clone(),
        work: id(3),
        work_revision: 1,
        intended_outcome: "Synthetic collaboration".into(),
        place: id(4),
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
        conditions: vec![],
    };
    let offers = [(31, 21, 41, 20, 70), (32, 22, 42, 40, 90)]
        .into_iter()
        .map(|(n, cap, person, start, end)| Offer {
            id: id(n),
            revision: 1,
            scope: scope.clone(),
            participant: id(person),
            capability: id(cap),
            place: id(4),
            window: window(start, end),
            capability_claim: id(n + 100),
            availability_claim: id(n + 200),
        })
        .collect();
    (goal, offers, Engine::new(scope, 10).unwrap())
}

fn budget() -> Budget {
    Budget { nodes: 100, results: 10 }
}

#[test]
fn direct_change_preserves_the_formation_and_original_conditions() {
    let (goal, offers, engine) = fixture();
    let formation = engine.form(&goal, &offers, budget()).unwrap();
    let original = &formation.proposals[0];
    let candidate = original.candidate(id(80));
    let preview = original.preview_timing(window(50, 80), 25).unwrap();
    assert_eq!(&preview.base, original.key());
    assert_eq!(preview.before.overlap, Some(window(40, 70)));
    assert_eq!(preview.after.overlap, Some(window(50, 70)));
    assert!(!preview.after.fits);
    assert_eq!(preview.after.shortfall_ms, 5);
    assert_eq!(preview.after.latest_start.origins, vec![Origin::ProposedWork]);
    assert_eq!(
        preview.after.earliest_end.origins,
        vec![Origin::Contribution { slot: id(11), offer: id(31) }]
    );
    assert_eq!(original.window(), window(40, 70));
    assert_eq!(original.candidate(id(80)), candidate);
    assert!(engine.evaluation(&id(80)).is_none());
}

#[test]
fn absent_overlap_is_not_a_new_match_or_an_error_to_hide() {
    let (goal, offers, engine) = fixture();
    let formation = engine.form(&goal, &offers, budget()).unwrap();
    let original = &formation.proposals[0];
    let preview = original.preview_timing(window(70, 90), 20).unwrap();
    assert_eq!(preview.after.overlap, None);
    assert_eq!(preview.after.available_ms, 0);
    assert_eq!(preview.after.shortfall_ms, 20);
    assert!(!preview.after.fits);
    let retry = original.preview_timing(goal.window, goal.minimum_duration_ms).unwrap();
    assert_eq!(retry.before, retry.after);
    assert!(retry.after.fits);
}

#[test]
fn ties_preserve_all_limiting_conditions_and_are_deterministic() {
    let (goal, mut offers, engine) = fixture();
    offers[0].window = window(40, 70);
    offers[1].window = window(40, 70);
    let a = engine.form(&goal, &offers, budget()).unwrap();
    offers.reverse();
    let b = engine.form(&goal, &offers, budget()).unwrap();
    let p = a.proposals[0].preview_timing(window(40, 70), 30).unwrap();
    assert_eq!(p, b.proposals[0].preview_timing(window(40, 70), 30).unwrap());
    assert_eq!(p.after.latest_start.origins.len(), 3);
    assert_eq!(p.after.earliest_end.origins.len(), 3);
    assert!(p.after.fits);
}

#[test]
fn counterfactual_matches_full_reformation_for_fixed_assignment() {
    let (mut goal, offers, engine) = fixture();
    let formation = engine.form(&goal, &offers, budget()).unwrap();
    let original = &formation.proposals[0];
    for start in 10..90 {
        let end = start + 10;
        let trial = window(start, end);
        for duration in [1, 5, 10] {
            let preview = original.preview_timing(trial, duration).unwrap();
            goal.window = trial;
            goal.minimum_duration_ms = duration;
            let fresh = engine.form(&goal, &offers, budget()).unwrap();
            assert_eq!(preview.after.fits, !fresh.proposals.is_empty());
            if let Some(proposal) = fresh.proposals.first() {
                assert_eq!(preview.after.overlap, Some(proposal.window()));
            }
        }
    }
    assert_eq!(
        original.preview_timing(window(20, 10), 1),
        Err(Error::InvalidValue)
    );
    assert_eq!(
        original.preview_timing(window(10, 20), 0),
        Err(Error::InvalidValue)
    );
    // Even an impossible requested duration is a meaningful exploration.
    assert!(!original.preview_timing(window(10, 20), 30).unwrap().after.fits);
}
