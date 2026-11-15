//! Bounded deterministic construction of configurations, not a market oracle.
//! All inputs must have been authorized and validated by the caller.
use super::{Candidate, Error, Requirement, Role, valid_text};
use std::collections::{BTreeMap, BTreeSet};
use world_language::{Id, MAX_REVISION};

pub mod timing;

const MAX_SLOTS: usize = 8;
const MAX_OFFERS: usize = 256;
const MAX_BASE_REQUIREMENTS: usize = 16;
const MAX_NODES: usize = 10_000;
const MAX_RESULTS: usize = 64;

#[derive(Clone, Copy, Debug, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Window {
    pub start_ms: u64,
    pub end_ms: u64,
}

impl Window {
    fn valid(self) -> bool {
        self.start_ms < self.end_ms && self.end_ms <= MAX_REVISION
    }

    fn overlap(self, other: Self, duration: u64) -> Option<Self> {
        let start_ms = self.start_ms.max(other.start_ms);
        let end_ms = self.end_ms.min(other.end_ms);
        (end_ms.checked_sub(start_ms)? >= duration).then_some(Self { start_ms, end_ms })
    }
}

#[derive(Clone, Debug, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Slot {
    pub id: Id,
    pub capability: Id,
    pub proposed_role: String,
}

#[derive(Clone, Debug, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Goal {
    pub id: Id,
    pub revision: u64,
    pub scope: Id,
    pub work: Id,
    pub work_revision: u64,
    pub intended_outcome: String,
    pub place: Id,
    pub window: Window,
    pub minimum_duration_ms: u64,
    pub distinct_participants: bool,
    pub slots: Vec<Slot>,
    pub conditions: Vec<Requirement>,
}

#[derive(Clone, Debug, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Offer {
    pub id: Id,
    pub revision: u64,
    pub scope: Id,
    pub participant: Id,
    pub capability: Id,
    pub place: Id,
    pub window: Window,
    /// Propositions that must be evaluated separately against admitted evidence.
    pub capability_claim: Id,
    pub availability_claim: Id,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Budget {
    pub nodes: usize,
    pub results: usize,
}

#[derive(Clone, Debug, PartialEq, Eq, PartialOrd, Ord, serde::Serialize, serde::Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Assignment {
    pub slot: Id,
    pub offer: Id,
    pub offer_revision: u64,
    pub participant: Id,
}

/// Structural identity, scoped to a goal/work version. No generated UUID is
/// masquerading as an existing work identifier.
#[derive(Clone, Debug, PartialEq, Eq, PartialOrd, Ord, serde::Serialize, serde::Deserialize)]
#[serde(deny_unknown_fields)]
pub struct FormationKey {
    pub scope: Id,
    pub work: Id,
    pub work_revision: u64,
    pub goal: Id,
    pub goal_revision: u64,
    pub assignments: Vec<Assignment>,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Proposal {
    key: FormationKey,
    place: Id,
    window: Window,
    intended_outcome: String,
    roles: Vec<Role>,
    requirements: Vec<Requirement>,
    timing: timing::Basis,
}

impl Proposal {
    pub fn key(&self) -> &FormationKey {
        &self.key
    }

    pub fn place(&self) -> &Id {
        &self.place
    }

    pub fn window(&self) -> Window {
        self.window
    }

    /// Explore a change in the proposed work's temporal conditions without
    /// replacing its identity, changing evidence or committing an action.
    pub fn preview_timing(
        &self,
        window: Window,
        minimum_duration_ms: u64,
    ) -> Result<timing::Preview, Error> {
        self.timing.preview(&self.key, window, minimum_duration_ms)
    }

    /// Allocate a durable candidate ID at the trusted caller. This does not
    /// create a work, change a work revision, contact anyone or imply consent.
    pub fn candidate(&self, id: Id) -> Candidate {
        Candidate {
            id,
            scope: self.key.scope.clone(),
            work: self.key.work.clone(),
            work_revision: self.key.work_revision,
            intended_outcome: self.intended_outcome.clone(),
            roles: self.roles.clone(),
            requirements: self.requirements.clone(),
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Formation {
    pub proposals: Vec<Proposal>,
    /// Number of examined offer/slot extensions, including rejected ones.
    pub visited: usize,
    /// False means the bounded enumeration completed. True means the node or
    /// output limit was reached; more structural hypotheses may exist.
    pub limited: bool,
}

pub(super) fn generate(goal: &Goal, offers: &[Offer], budget: Budget) -> Result<Formation, Error> {
    if goal.slots.len() > MAX_SLOTS
        || offers.len() > MAX_OFFERS
        || goal.conditions.len() > MAX_BASE_REQUIREMENTS
        || budget.nodes == 0
        || budget.nodes > MAX_NODES
        || budget.results == 0
        || budget.results > MAX_RESULTS
    {
        return Err(Error::Capacity);
    }
    let unique_slots: BTreeSet<_> = goal.slots.iter().map(|s| &s.id).collect();
    let role_names: BTreeSet<_> = goal.slots.iter().map(|s| &s.proposed_role).collect();
    let condition_ids: BTreeSet<_> = goal.conditions.iter().map(|r| &r.claim).collect();
    if !(1..=MAX_REVISION).contains(&goal.revision)
        || !(1..=MAX_REVISION).contains(&goal.work_revision)
        || !valid_text(&goal.intended_outcome, 2_000)
        || !goal.window.valid()
        || goal.minimum_duration_ms == 0
        || goal.minimum_duration_ms > goal.window.end_ms - goal.window.start_ms
        || goal.slots.is_empty()
        || unique_slots.len() != goal.slots.len()
        || role_names.len() != goal.slots.len()
        || condition_ids.len() != goal.conditions.len()
        || goal
            .slots
            .iter()
            .any(|s| !valid_text(&s.proposed_role, 240))
    {
        return Err(Error::InvalidValue);
    }
    let mut ids = BTreeSet::new();
    let mut index: BTreeMap<&Id, Vec<&Offer>> = BTreeMap::new();
    for offer in offers {
        if offer.scope != goal.scope {
            return Err(Error::ScopeMismatch);
        }
        if !ids.insert(&offer.id) {
            return Err(Error::IdentityConflict);
        }
        if !(1..=MAX_REVISION).contains(&offer.revision) || !offer.window.valid() {
            return Err(Error::InvalidValue);
        }
        if offer.place == goal.place {
            index.entry(&offer.capability).or_default().push(offer);
        }
    }
    let mut slots: Vec<_> = goal.slots.iter().collect();
    slots.sort_by(|a, b| a.id.cmp(&b.id));
    let choices: Vec<Vec<&Offer>> = slots
        .iter()
        .map(|slot| {
            let mut options = index.get(&slot.capability).cloned().unwrap_or_default();
            options.sort_by(|a, b| a.id.cmp(&b.id));
            options
        })
        .collect();
    let mut search = Search {
        goal,
        slots,
        choices,
        budget,
        result: Formation {
            proposals: Vec::new(),
            visited: 0,
            limited: false,
        },
    };
    if !search.choices.iter().any(Vec::is_empty) {
        search.visit(goal.window, &mut Vec::new());
    }
    Ok(search.result)
}

struct Search<'a> {
    goal: &'a Goal,
    slots: Vec<&'a Slot>,
    choices: Vec<Vec<&'a Offer>>,
    budget: Budget,
    result: Formation,
}

impl<'a> Search<'a> {
    fn visit(&mut self, window: Window, chosen: &mut Vec<&'a Offer>) {
        if chosen.len() == self.slots.len() {
            self.result.proposals.push(self.proposal(window, chosen));
            return;
        }
        let depth = chosen.len();
        for i in 0..self.choices[depth].len() {
            if self.result.visited >= self.budget.nodes
                || self.result.proposals.len() >= self.budget.results
            {
                self.result.limited = true;
                return;
            }
            let offer = self.choices[depth][i];
            self.result.visited += 1;
            // An offer is a single proposed contribution. Reuse is not inferred.
            if chosen.iter().any(|old| {
                old.id == offer.id
                    || (self.goal.distinct_participants && old.participant == offer.participant)
            }) {
                continue;
            }
            let Some(overlap) = window.overlap(offer.window, self.goal.minimum_duration_ms) else {
                continue;
            };
            chosen.push(offer);
            self.visit(overlap, chosen);
            chosen.pop();
            if self.result.limited {
                return;
            }
        }
    }

    fn proposal(&self, window: Window, chosen: &[&Offer]) -> Proposal {
        let mut conditions: BTreeMap<Id, bool> = self
            .goal
            .conditions
            .iter()
            .map(|r| (r.claim.clone(), r.hard))
            .collect();
        let mut assignments = Vec::new();
        let mut roles = Vec::new();
        for (slot, offer) in self.slots.iter().zip(chosen) {
            // Hard requirement wins if the goal had listed it as optional.
            conditions.insert(offer.capability_claim.clone(), true);
            conditions.insert(offer.availability_claim.clone(), true);
            assignments.push(Assignment {
                slot: slot.id.clone(),
                offer: offer.id.clone(),
                offer_revision: offer.revision,
                participant: offer.participant.clone(),
            });
            roles.push(Role {
                participant: offer.participant.clone(),
                proposed_role: slot.proposed_role.clone(),
            });
        }
        Proposal {
            key: FormationKey {
                scope: self.goal.scope.clone(),
                work: self.goal.work.clone(),
                work_revision: self.goal.work_revision,
                goal: self.goal.id.clone(),
                goal_revision: self.goal.revision,
                assignments,
            },
            place: self.goal.place.clone(),
            window,
            timing: timing::Basis::new(self.goal, &self.slots, chosen),
            intended_outcome: self.goal.intended_outcome.clone(),
            roles,
            requirements: conditions
                .into_iter()
                .map(|(claim, hard)| Requirement { claim, hard })
                .collect(),
        }
    }
}
