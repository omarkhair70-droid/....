//! Deterministic composition semantics over already authorized evidence.
//! No retrieval, identity resolution, model call, commitment or world mutation.
#![forbid(unsafe_code)]

pub mod formation;

use std::collections::{BTreeMap, BTreeSet};
use world_language::{Id, MAX_REVISION};

const MAX_EVIDENCE: usize = 10_000;
const MAX_CANDIDATES: usize = 1_000;
const MAX_REQUIREMENTS: usize = 32;
const MAX_ROLES: usize = 16;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Polarity {
    Supports,
    Opposes,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Evidence {
    pub id: Id,
    pub revision: u64,
    pub scope: Id,
    /// Exact contextual proposition ID. Never infer identity from text.
    pub claim: Id,
    pub source: Id,
    pub source_revision: u64,
    pub polarity: Polarity,
    pub valid_from_ms: u64,
    /// Exclusive upper bound.
    pub valid_until_ms: Option<u64>,
    pub withdrawn: bool,
}

impl Evidence {
    fn active_at(&self, at: u64) -> bool {
        !self.withdrawn
            && self.valid_from_ms <= at
            && self.valid_until_ms.is_none_or(|end| at < end)
    }

    fn valid(&self) -> bool {
        (1..=MAX_REVISION).contains(&self.revision)
            && (1..=MAX_REVISION).contains(&self.source_revision)
            && self.valid_from_ms <= MAX_REVISION
            && self
                .valid_until_ms
                .is_none_or(|end| end > self.valid_from_ms && end <= MAX_REVISION)
    }
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Role {
    pub participant: Id,
    pub proposed_role: String,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Requirement {
    pub claim: Id,
    pub hard: bool,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Candidate {
    pub id: Id,
    pub scope: Id,
    pub work: Id,
    pub work_revision: u64,
    pub intended_outcome: String,
    pub roles: Vec<Role>,
    pub requirements: Vec<Requirement>,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Knowledge {
    Unknown,
    Supported,
    Opposed,
    Contested,
}

/// A source pointer is not a verified citation. Evidence admission is upstream.
#[derive(Clone, Debug, PartialEq, Eq, PartialOrd, Ord)]
pub struct Trace {
    pub evidence_id: Id,
    pub evidence_revision: u64,
    pub source_id: Id,
    pub source_revision: u64,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Condition {
    pub requirement: Requirement,
    pub knowledge: Knowledge,
    pub supporting: Vec<Trace>,
    pub opposing: Vec<Trace>,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Feasibility {
    /// At least one hard condition has opposing evidence only.
    BlockedUnderEvidence,
    /// At least one hard or optional condition is unresolved or contested.
    Conditional,
    /// All declared hard conditions have support without known opposition.
    /// This does NOT establish completeness, consent, or real-world feasibility.
    SupportedUnderEvidence,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Evaluation {
    pub candidate: Id,
    pub work: Id,
    pub work_revision: u64,
    pub feasibility: Feasibility,
    pub conditions: Vec<Condition>,
}

#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct ChangeSet {
    /// Candidates actually evaluated, in deterministic ID order.
    pub evaluated: Vec<Id>,
    /// Subset whose evaluation, including evidence references, changed.
    pub changed: Vec<Id>,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Error {
    ScopeMismatch,
    InvalidValue,
    IdentityConflict,
    StaleEvidence,
    Capacity,
}

/// One ephemeral authorized scope. The caller must enforce the authorization
/// and discard or rebuild the engine whenever that scope's grants change.
/// Scope IDs alone are not permissions. No unsanitized output crosses contexts.
pub struct Engine {
    scope: Id,
    at_ms: u64,
    evidence: BTreeMap<Id, Evidence>,
    by_claim: BTreeMap<Id, BTreeSet<Id>>,
    candidates: BTreeMap<Id, Candidate>,
    dependents: BTreeMap<Id, BTreeSet<Id>>,
    evaluations: BTreeMap<Id, Evaluation>,
}

impl Engine {
    pub fn new(scope: Id, at_ms: u64) -> Result<Self, Error> {
        if at_ms > MAX_REVISION {
            return Err(Error::InvalidValue);
        }
        Ok(Self {
            scope,
            at_ms,
            evidence: BTreeMap::new(),
            by_claim: BTreeMap::new(),
            candidates: BTreeMap::new(),
            dependents: BTreeMap::new(),
            evaluations: BTreeMap::new(),
        })
    }

    /// Register a human- or model-proposed configuration; never create a work
    /// or assert consent. Candidate versions are immutable in this slice.
    pub fn register(&mut self, candidate: Candidate) -> Result<ChangeSet, Error> {
        if candidate.scope != self.scope {
            return Err(Error::ScopeMismatch);
        }
        let unique: BTreeSet<_> = candidate.requirements.iter().map(|r| &r.claim).collect();
        let roles: BTreeSet<_> = candidate
            .roles
            .iter()
            .map(|r| (&r.participant, &r.proposed_role))
            .collect();
        if !(1..=MAX_REVISION).contains(&candidate.work_revision)
            || !valid_text(&candidate.intended_outcome, 2_000)
            || candidate.roles.is_empty()
            || candidate.roles.len() > MAX_ROLES
            || candidate.requirements.is_empty()
            || candidate.requirements.len() > MAX_REQUIREMENTS
            || !candidate.requirements.iter().any(|r| r.hard)
            || unique.len() != candidate.requirements.len()
            || roles.len() != candidate.roles.len()
            || candidate
                .roles
                .iter()
                .any(|r| !valid_text(&r.proposed_role, 240))
        {
            return Err(Error::InvalidValue);
        }
        if let Some(old) = self.candidates.get(&candidate.id) {
            return if old == &candidate {
                Ok(ChangeSet::default())
            } else {
                Err(Error::IdentityConflict)
            };
        }
        if self.candidates.len() >= MAX_CANDIDATES {
            return Err(Error::Capacity);
        }
        let id = candidate.id.clone();
        for requirement in &candidate.requirements {
            self.dependents
                .entry(requirement.claim.clone())
                .or_default()
                .insert(id.clone());
        }
        self.candidates.insert(id.clone(), candidate);
        Ok(self.refresh(BTreeSet::from([id])))
    }

    /// Apply a new source-backed evidence revision. Replays are idempotent;
    /// contradictory versions at the same revision fail closed.
    pub fn upsert(&mut self, evidence: Evidence) -> Result<ChangeSet, Error> {
        if evidence.scope != self.scope {
            return Err(Error::ScopeMismatch);
        }
        if !evidence.valid() {
            return Err(Error::InvalidValue);
        }
        if let Some(old) = self.evidence.get(&evidence.id) {
            if old.claim != evidence.claim || old.source != evidence.source {
                return Err(Error::IdentityConflict);
            }
            if evidence.revision < old.revision || evidence.source_revision < old.source_revision {
                return Err(Error::StaleEvidence);
            }
            if evidence.revision == old.revision {
                return if old == &evidence {
                    Ok(ChangeSet::default())
                } else {
                    Err(Error::IdentityConflict)
                };
            }
        } else if self.evidence.len() >= MAX_EVIDENCE {
            return Err(Error::Capacity);
        }
        let claim = evidence.claim.clone();
        self.by_claim
            .entry(claim.clone())
            .or_default()
            .insert(evidence.id.clone());
        self.evidence.insert(evidence.id.clone(), evidence);
        Ok(self.refresh(self.affected(&BTreeSet::from([claim]))))
    }

    /// Time is explicit, not wall-clock I/O. Only claims with activity changes
    /// can affect evaluations. Rebuild a historical snapshot for earlier times.
    pub fn advance_to(&mut self, at_ms: u64) -> Result<ChangeSet, Error> {
        if at_ms < self.at_ms || at_ms > MAX_REVISION {
            return Err(Error::InvalidValue);
        }
        let claims = self
            .evidence
            .values()
            .filter(|e| e.active_at(self.at_ms) != e.active_at(at_ms))
            .map(|e| e.claim.clone())
            .collect();
        self.at_ms = at_ms;
        Ok(self.refresh(self.affected(&claims)))
    }

    /// Form hypotheses from an already authorized, bounded input snapshot.
    /// Does not register candidates or grant permissions.
    pub fn form(
        &self,
        goal: &formation::Goal,
        offers: &[formation::Offer],
        budget: formation::Budget,
    ) -> Result<formation::Formation, Error> {
        if goal.scope != self.scope {
            return Err(Error::ScopeMismatch);
        }
        formation::generate(goal, offers, budget)
    }

    pub fn evaluation(&self, id: &Id) -> Option<&Evaluation> {
        self.evaluations.get(id)
    }

    /// Full deterministic recomputation for test and consistency checks.
    pub fn recompute_all(&self) -> BTreeMap<Id, Evaluation> {
        self.candidates
            .iter()
            .map(|(id, candidate)| (id.clone(), self.evaluate(candidate)))
            .collect()
    }

    fn affected(&self, claims: &BTreeSet<Id>) -> BTreeSet<Id> {
        claims
            .iter()
            .filter_map(|claim| self.dependents.get(claim))
            .flatten()
            .cloned()
            .collect()
    }

    fn refresh(&mut self, ids: BTreeSet<Id>) -> ChangeSet {
        let mut result = ChangeSet::default();
        for id in ids {
            let next = self.evaluate(&self.candidates[&id]);
            if self.evaluations.get(&id) != Some(&next) {
                result.changed.push(id.clone());
                self.evaluations.insert(id.clone(), next);
            }
            result.evaluated.push(id);
        }
        result
    }

    fn evaluate(&self, candidate: &Candidate) -> Evaluation {
        let mut conditions = Vec::with_capacity(candidate.requirements.len());
        for requirement in &candidate.requirements {
            let mut supporting = Vec::new();
            let mut opposing = Vec::new();
            if let Some(ids) = self.by_claim.get(&requirement.claim) {
                for id in ids {
                    let evidence = &self.evidence[id];
                    if !evidence.active_at(self.at_ms) {
                        continue;
                    }
                    let trace = Trace {
                        evidence_id: evidence.id.clone(),
                        evidence_revision: evidence.revision,
                        source_id: evidence.source.clone(),
                        source_revision: evidence.source_revision,
                    };
                    match evidence.polarity {
                        Polarity::Supports => supporting.push(trace),
                        Polarity::Opposes => opposing.push(trace),
                    }
                }
            }
            let knowledge = match (supporting.is_empty(), opposing.is_empty()) {
                (true, true) => Knowledge::Unknown,
                (false, true) => Knowledge::Supported,
                (true, false) => Knowledge::Opposed,
                (false, false) => Knowledge::Contested,
            };
            conditions.push(Condition {
                requirement: requirement.clone(),
                knowledge,
                supporting,
                opposing,
            });
        }
        let feasibility = if conditions
            .iter()
            .any(|c| c.requirement.hard && c.knowledge == Knowledge::Opposed)
        {
            Feasibility::BlockedUnderEvidence
        } else if conditions
            .iter()
            .any(|c| c.knowledge != Knowledge::Supported)
        {
            Feasibility::Conditional
        } else {
            Feasibility::SupportedUnderEvidence
        };
        Evaluation {
            candidate: candidate.id.clone(),
            work: candidate.work.clone(),
            work_revision: candidate.work_revision,
            feasibility,
            conditions,
        }
    }
}

fn valid_text(value: &str, max: usize) -> bool {
    !value.trim().is_empty() && value.chars().count() <= max
}
