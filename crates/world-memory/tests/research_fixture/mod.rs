use std::collections::BTreeSet;
use world_composition::archive::{Archive, Authority, Selection};
use world_composition::formation::{Budget, Goal, Offer, Slot, Window};
use world_composition::knowledge::{Assertion, Citation, Claim, Source};
use world_composition::{Engine, Evidence, Polarity};
use world_language::Id;

fn id(n: u64) -> Id {
    Id::parse(&format!("00000000-0000-4000-8000-{n:012x}")).unwrap()
}

pub fn fixture() -> (Archive, Authority) {
    let work = id(10);
    let window = Window { start_ms: 10, end_ms: 100 };
    let goal = Goal {
        id: id(200), revision: 1, scope: work.clone(), work: work.clone(),
        work_revision: 1, intended_outcome: "Synthetic joint work".into(), place: id(201),
        window, minimum_duration_ms: 10, distinct_participants: true,
        slots: vec![Slot {id: id(202), capability: id(203), proposed_role: "Contributor".into()}],
        conditions: vec![],
    };
    let offers = vec![Offer {
        id: id(204), revision: 1, scope: work.clone(), participant: id(2),
        capability: id(203), place: id(201), window, capability_claim: id(205),
        availability_claim: id(206),
    }];
    let claims: Vec<_> = [205, 206].into_iter().map(|n| Claim {
        id: id(n), scope: work.clone(), proposition: format!("Synthetic claim {n}"),
    }).collect();
    let text = "قدرة متاحة";
    let sources = vec![Source {
        id: id(207), revision: 1, scope: work.clone(), locator: "synthetic:research".into(),
        acquired_at_ms: 10, text: text.into(),
    }];
    let assertions = claims.iter().enumerate().map(|(n, claim)| Assertion {
        evidence: Evidence {
            id: id(210 + n as u64), revision: 1, scope: work.clone(), claim: claim.id.clone(),
            source: id(207), source_revision: 1, polarity: Polarity::Supports,
            valid_from_ms: 10, valid_until_ms: Some(40), withdrawn: false,
        },
        citation: Citation {source: id(207), source_revision: 1, start: 0, end: text.len(), excerpt: text.into()},
        reviewer: id(1), reviewed_at_ms: 11,
    }).collect();
    let budget = Budget {nodes: 20, results: 5};
    let formation = Engine::new(work.clone(), 20).unwrap().form(&goal, &offers, budget).unwrap();
    let archive = Archive {
        version: "0.1".into(), archive_id: id(220), snapshot_at_ms: 20, goal, offers,
        budget, sources, claims, assertions,
        selections: vec![Selection {candidate: id(221), key: formation.proposals[0].key().clone()}],
    };
    let authority = Authority {
        actor: id(1), scope: work, source_versions: BTreeSet::from([(id(207),1)]),
        reviewers: BTreeSet::from([id(1)]),
    };
    (archive, authority)
}
