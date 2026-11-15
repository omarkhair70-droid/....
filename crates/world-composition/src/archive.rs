//! Versioned internal records of a scoped research snapshot.
//! Restoration is historical, never a fresh verification of the outside world.
use super::formation::{Budget, Formation, FormationKey, Goal, Offer};
use super::knowledge::{Assertion, Claim, Knowledge, Source};
use super::{Error, Evaluation};
use std::collections::{BTreeMap, BTreeSet};
use world_language::{Id, MAX_REVISION};

pub const MAX_ARCHIVE_BYTES: usize = 4 * 1024 * 1024;

#[derive(Clone, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Selection {
    pub candidate: Id,
    pub key: FormationKey,
}

#[derive(Clone, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Archive {
    pub version: String,
    pub archive_id: Id,
    pub snapshot_at_ms: u64,
    pub goal: Goal,
    pub offers: Vec<Offer>,
    pub budget: Budget,
    pub sources: Vec<Source>,
    pub claims: Vec<Claim>,
    pub assertions: Vec<Assertion>,
    pub selections: Vec<Selection>,
}

/// Trusted server input, NOT a client claim or archived grant. A future
/// authority service must resolve these permissions and enforce revocation.
pub struct Authority {
    pub actor: Id,
    pub scope: Id,
    pub source_versions: BTreeSet<(Id, u64)>,
    pub reviewers: BTreeSet<Id>,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum ArchiveError {
    Shape,
    Capacity,
    Denied,
    Invalid,
    Admission,
    Composition(Error),
}

pub struct Restored {
    pub snapshot_at_ms: u64,
    pub work_revision: u64,
    pub formation: Formation,
    pub evaluations: BTreeMap<Id, Evaluation>,
}

impl Archive {
    pub fn parse(raw: &str) -> Result<Self, ArchiveError> {
        if raw.len() > MAX_ARCHIVE_BYTES {
            return Err(ArchiveError::Capacity);
        }
        let value: Self = serde_json::from_str(raw).map_err(|_| ArchiveError::Shape)?;
        value.check_shape()?;
        Ok(value)
    }

    pub fn encode(&self) -> Result<String, ArchiveError> {
        self.check_shape()?;
        let raw = serde_json::to_string(self).map_err(|_| ArchiveError::Shape)?;
        if raw.len() > MAX_ARCHIVE_BYTES {
            return Err(ArchiveError::Capacity);
        }
        Ok(raw)
    }

    fn check_shape(&self) -> Result<(), ArchiveError> {
        if self.version != "0.1"
            || self.snapshot_at_ms > MAX_REVISION
            || self.goal.scope != self.goal.work
            || self.goal.work_revision == 0
            || self.goal.work_revision > MAX_REVISION
        {
            return Err(ArchiveError::Invalid);
        }
        if self.sources.len() > 256
            || self.claims.len() > 2_000
            || self.assertions.len() > 4_000
            || self.offers.len() > 256
            || self.selections.len() > 64
            || self.selections.iter().any(|s| s.key.assignments.len() > 8)
        {
            return Err(ArchiveError::Capacity);
        }
        Ok(())
    }

    /// Validate against an externally authorized snapshot. Scope is work-private
    /// in v0.1. Missing grants fail closed even for historical replay.
    /// Does not return the raw source texts or modify the canonical world.
    pub fn restore(&self, authority: &Authority) -> Result<Restored, ArchiveError> {
        self.check_shape()?;
        if authority.scope != self.goal.scope
            || self.sources.iter().any(|s| {
                !authority
                    .source_versions
                    .contains(&(s.id.clone(), s.revision))
            })
            || self
                .assertions
                .iter()
                .any(|a| !authority.reviewers.contains(&a.reviewer))
        {
            return Err(ArchiveError::Denied);
        }

        let mut ledger = Knowledge::new(
            self.goal.scope.clone(),
            self.snapshot_at_ms,
            authority.reviewers.clone(),
        )
        .map_err(|_| ArchiveError::Admission)?;
        let mut sources = BTreeSet::new();
        for source in &self.sources {
            if !sources.insert(&source.id) {
                return Err(ArchiveError::Invalid);
            }
            ledger
                .add_source(source.clone())
                .map_err(|_| ArchiveError::Admission)?;
        }
        let mut claims = BTreeSet::new();
        for claim in &self.claims {
            if !claims.insert(&claim.id) {
                return Err(ArchiveError::Invalid);
            }
            ledger
                .add_claim(claim.clone())
                .map_err(|_| ArchiveError::Admission)?;
        }
        if self
            .goal
            .conditions
            .iter()
            .any(|r| !claims.contains(&r.claim))
            || self.offers.iter().any(|o| {
                !claims.contains(&o.capability_claim) || !claims.contains(&o.availability_claim)
            })
        {
            return Err(ArchiveError::Invalid);
        }
        let mut assertions = BTreeSet::new();
        for assertion in &self.assertions {
            if !assertions.insert(&assertion.evidence.id) {
                return Err(ArchiveError::Invalid);
            }
            ledger
                .admit(assertion.clone())
                .map_err(|_| ArchiveError::Admission)?;
        }
        let mut engine = ledger.build_engine().map_err(|_| ArchiveError::Admission)?;
        let formation = engine
            .form(&self.goal, &self.offers, self.budget)
            .map_err(ArchiveError::Composition)?;
        let mut candidates = BTreeSet::new();
        let mut keys = BTreeSet::new();
        for selection in &self.selections {
            if !candidates.insert(&selection.candidate) || !keys.insert(&selection.key) {
                return Err(ArchiveError::Invalid);
            }
            let proposal = formation
                .proposals
                .iter()
                .find(|p| p.key() == &selection.key)
                .ok_or(ArchiveError::Invalid)?;
            engine
                .register(proposal.candidate(selection.candidate.clone()))
                .map_err(ArchiveError::Composition)?;
        }
        Ok(Restored {
            snapshot_at_ms: self.snapshot_at_ms,
            work_revision: self.goal.work_revision,
            formation,
            evaluations: engine.recompute_all(),
        })
    }
}
