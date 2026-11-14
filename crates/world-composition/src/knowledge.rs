//! Source-bound admission into a fresh authorized composition snapshot.
//! The caller authenticates reviewers, enforces grants and verifies provenance.
//! A matching excerpt does not demonstrate entailment or real-world truth.

use super::{Engine, Error, Evidence, Polarity, valid_text};
use std::collections::{BTreeMap, BTreeSet};
use world_language::{Id, MAX_REVISION};

const MAX_SOURCES: usize = 256;
const MAX_SOURCE_BYTES: usize = 128 * 1024;
const MAX_TOTAL_BYTES: usize = 8 * 1024 * 1024;
const MAX_CLAIMS: usize = 2_000;
const MAX_EVIDENCE: usize = 4_000;
const MAX_EXCERPT_BYTES: usize = 4_096;

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Source {
    pub id: Id,
    pub revision: u64,
    pub scope: Id,
    /// Locator is an identifier only; no network access occurs here.
    pub locator: String,
    pub acquired_at_ms: u64,
    pub text: String,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Claim {
    pub id: Id,
    pub scope: Id,
    /// Immutable contextual proposition; changed meaning requires a new ID.
    pub proposition: String,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Citation {
    pub source: Id,
    pub source_revision: u64,
    /// UTF-8 byte offsets, half-open, against the exact source text.
    pub start: usize,
    pub end: usize,
    pub excerpt: String,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Assertion {
    pub evidence: Evidence,
    pub citation: Citation,
    /// Authenticated human reviewer supplied by the trusted boundary.
    pub reviewer: Id,
    pub reviewed_at_ms: u64,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum AdmissionError {
    Scope,
    Invalid,
    MissingSource,
    MissingClaim,
    MissingReviewerGrant,
    CitationMismatch,
    DuplicateIdentity,
    Capacity,
    Engine(Error),
}

/// Disposable, single-scope snapshot builder. No persistent archive, auth
/// provider or reviewer authority is implemented here. Never accept reviewer
/// grants or source text directly from an untrusted request.
pub struct Knowledge {
    scope: Id,
    at_ms: u64,
    reviewers: BTreeSet<Id>,
    sources: BTreeMap<Id, Source>,
    claims: BTreeMap<Id, Claim>,
    assertions: BTreeMap<Id, Assertion>,
    bytes: usize,
}

impl Knowledge {
    pub fn new(
        scope: Id,
        at_ms: u64,
        reviewers: BTreeSet<Id>,
    ) -> Result<Self, AdmissionError> {
        if at_ms > MAX_REVISION || reviewers.len() > MAX_SOURCES {
            return Err(AdmissionError::Invalid);
        }
        Ok(Self {
            scope,
            at_ms,
            reviewers,
            sources: BTreeMap::new(),
            claims: BTreeMap::new(),
            assertions: BTreeMap::new(),
            bytes: 0,
        })
    }

    pub fn add_source(&mut self, source: Source) -> Result<(), AdmissionError> {
        if source.scope != self.scope {
            return Err(AdmissionError::Scope);
        }
        if !(1..=MAX_REVISION).contains(&source.revision)
            || source.acquired_at_ms > self.at_ms
            || !valid_text(&source.locator, 2_000)
            || source.text.trim().is_empty()
            || source.text.len() > MAX_SOURCE_BYTES
        {
            return Err(AdmissionError::Invalid);
        }
        if let Some(old) = self.sources.get(&source.id) {
            return if old == &source {
                Ok(())
            } else {
                Err(AdmissionError::DuplicateIdentity)
            };
        }
        if self.sources.len() >= MAX_SOURCES || self.bytes + source.text.len() > MAX_TOTAL_BYTES {
            return Err(AdmissionError::Capacity);
        }
        self.bytes += source.text.len();
        self.sources.insert(source.id.clone(), source);
        Ok(())
    }

    pub fn add_claim(&mut self, claim: Claim) -> Result<(), AdmissionError> {
        if claim.scope != self.scope {
            return Err(AdmissionError::Scope);
        }
        if !valid_text(&claim.proposition, 2_000) {
            return Err(AdmissionError::Invalid);
        }
        if let Some(old) = self.claims.get(&claim.id) {
            return if old == &claim {
                Ok(())
            } else {
                Err(AdmissionError::DuplicateIdentity)
            };
        }
        if self.claims.len() >= MAX_CLAIMS {
            return Err(AdmissionError::Capacity);
        }
        self.claims.insert(claim.id.clone(), claim);
        Ok(())
    }

    /// Admit a reviewed directional assertion, not an AI-produced citation.
    /// Unknown, contradicted and expired evidence remains meaningful downstream.
    pub fn admit(&mut self, assertion: Assertion) -> Result<(), AdmissionError> {
        let evidence = &assertion.evidence;
        let citation = &assertion.citation;
        if evidence.scope != self.scope {
            return Err(AdmissionError::Scope);
        }
        if !self.reviewers.contains(&assertion.reviewer) {
            return Err(AdmissionError::MissingReviewerGrant);
        }
        if !self.claims.contains_key(&evidence.claim) {
            return Err(AdmissionError::MissingClaim);
        }
        let source = self
            .sources
            .get(&citation.source)
            .ok_or(AdmissionError::MissingSource)?;
        if !evidence.valid()
            || assertion.reviewed_at_ms < source.acquired_at_ms
            || assertion.reviewed_at_ms > self.at_ms
            || citation.source != evidence.source
            || citation.source_revision != evidence.source_revision
            || citation.source_revision != source.revision
        {
            return Err(AdmissionError::Invalid);
        }
        if citation.start >= citation.end
            || citation.excerpt.len() > MAX_EXCERPT_BYTES
            || citation.excerpt.trim().is_empty()
            || source.text.get(citation.start..citation.end) != Some(citation.excerpt.as_str())
        {
            return Err(AdmissionError::CitationMismatch);
        }
        if let Some(old) = self.assertions.get(&evidence.id) {
            return if old == &assertion {
                Ok(())
            } else {
                Err(AdmissionError::DuplicateIdentity)
            };
        }
        if self.assertions.len() >= MAX_EVIDENCE {
            return Err(AdmissionError::Capacity);
        }
        self.assertions.insert(evidence.id.clone(), assertion);
        Ok(())
    }

    /// Build a new engine from the admitted snapshot. Do not reuse an engine
    /// after grant revocation or source/version changes. No mutation of work.
    pub fn build_engine(&self) -> Result<Engine, AdmissionError> {
        let mut engine =
            Engine::new(self.scope.clone(), self.at_ms).map_err(AdmissionError::Engine)?;
        for assertion in self.assertions.values() {
            engine
                .upsert(assertion.evidence.clone())
                .map_err(AdmissionError::Engine)?;
        }
        Ok(engine)
    }

    /// Trusted internal access only. The exact scope still governs disclosure.
    pub fn assertion(&self, evidence_id: &Id) -> Option<&Assertion> {
        self.assertions.get(evidence_id)
    }

    pub fn polarity(&self, evidence_id: &Id) -> Option<Polarity> {
        self.assertion(evidence_id).map(|a| a.evidence.polarity)
    }
}
