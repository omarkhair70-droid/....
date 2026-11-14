//! Imported text and bounded extraction proposals. No network or provider call.
//! The trusted caller supplies identity, authority and authenticated review.
//! Untrusted source text and model output are data, not tool instructions.

use super::Polarity;
use super::knowledge::{Citation, Source};
use super::retrieval::{Corpus, Error as RetrievalError, Grants};
use std::collections::BTreeSet;
use world_language::{Id, MAX_REVISION};

const MAX_TEXT_BYTES: usize = 128 * 1024;
const MAX_OUTPUT_BYTES: usize = 64 * 1024;
const MAX_PROPOSALS: usize = 32;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Error {
    Denied,
    Invalid,
    Capacity,
    Shape,
    Retrieval(RetrievalError),
}

impl From<RetrievalError> for Error {
    fn from(value: RetrievalError) -> Self {
        match value {
            RetrievalError::Denied | RetrievalError::Scope => Self::Denied,
            _ => Self::Retrieval(value),
        }
    }
}

/// An exact import grant supplied by trusted code, never parsed from a user
/// or model message. Its authority and provenance must be verified upstream.
pub struct ImportPermit {
    pub scope: Id,
    pub source: Id,
    pub revision: u64,
    pub locator: String,
    pub expires_at_ms: u64,
}

/// Import actual UTF-8 bytes from an authorized caller. No locator is opened
/// or fetched here. A locator and a permit alone do not establish authenticity.
pub fn import_text(
    permit: &ImportPermit,
    current: &Grants,
    now_ms: u64,
    bytes: &[u8],
) -> Result<Source, Error> {
    if current.scope != permit.scope
        || !current
            .versions
            .contains(&(permit.source.clone(), permit.revision))
        || now_ms >= permit.expires_at_ms
    {
        return Err(Error::Denied);
    }
    if bytes.len() > MAX_TEXT_BYTES {
        return Err(Error::Capacity);
    }
    if now_ms > MAX_REVISION
        || permit.expires_at_ms > MAX_REVISION
        || !(1..=MAX_REVISION).contains(&permit.revision)
        || permit.locator.trim().is_empty()
        || permit.locator.chars().count() > 2_000
        || permit.locator.chars().any(char::is_control)
    {
        return Err(Error::Invalid);
    }
    let text = std::str::from_utf8(bytes).map_err(|_| Error::Invalid)?;
    if text.trim().is_empty() {
        return Err(Error::Invalid);
    }
    Ok(Source {
        id: permit.source.clone(),
        revision: permit.revision,
        scope: permit.scope.clone(),
        locator: permit.locator.clone(),
        acquired_at_ms: now_ms,
        text: text.to_owned(),
    })
}

/// Trusted job binding: work-private scope, exact work revision, one attempt.
/// Never deserialize this authority from a provider response.
pub struct JobSpec {
    pub job: Id,
    pub scope: Id,
    pub work_revision: u64,
    pub expires_at_ms: u64,
    pub max_hits: usize,
    pub max_proposals: usize,
}

#[derive(Debug, PartialEq, Eq)]
pub struct Proposal {
    pub proposition: String,
    pub polarity: Polarity,
    pub citation: Citation,
}

/// No provider object, credentials, network capabilities or write methods.
/// Output stays a proposal; it cannot be converted into an admitted assertion
/// without separate authenticated review, claim ID and evidence ID allocation.
pub struct Extraction {
    spec: JobSpec,
    query: String,
    citations: Vec<Citation>,
}

#[derive(serde::Serialize)]
struct Input<'a> {
    version: &'static str,
    job: &'a Id,
    question: &'a str,
    excerpts: Vec<Excerpt<'a>>,
    max_proposals: usize,
}

#[derive(serde::Serialize)]
struct Excerpt<'a> {
    index: usize,
    text: &'a str,
}

#[derive(serde::Deserialize)]
#[serde(deny_unknown_fields)]
struct Output {
    version: String,
    job: Id,
    proposals: Vec<OutputItem>,
}

#[derive(serde::Deserialize)]
#[serde(deny_unknown_fields)]
struct OutputItem {
    excerpt_index: usize,
    proposition: String,
    polarity: Polarity,
}

impl Extraction {
    pub fn prepare(
        spec: JobSpec,
        grants: &Grants,
        corpus: &Corpus,
        query: &str,
        now_ms: u64,
    ) -> Result<Self, Error> {
        check_job(&spec, grants, spec.work_revision, now_ms)?;
        if spec.max_hits == 0
            || spec.max_hits > 16
            || spec.max_proposals == 0
            || spec.max_proposals > MAX_PROPOSALS
        {
            return Err(Error::Capacity);
        }
        let citations = corpus
            .search(grants, query, spec.max_hits)?
            .hits
            .into_iter()
            .map(|hit| hit.citation)
            .collect();
        Ok(Self {
            spec,
            query: query.to_owned(),
            citations,
        })
    }

    fn recheck(
        &self,
        grants: &Grants,
        corpus: &Corpus,
        work_revision: u64,
        now_ms: u64,
    ) -> Result<(), Error> {
        check_job(&self.spec, grants, work_revision, now_ms)?;
        for citation in &self.citations {
            corpus.exact_citation(grants, citation)?;
        }
        Ok(())
    }

    /// Serialized *data* for a future provider adapter. No source IDs or
    /// locators. Text may still contain sensitive material: no external send
    /// without explicit egress authorization, cost cap and retention review.
    pub fn input_json(
        &self,
        grants: &Grants,
        corpus: &Corpus,
        work_revision: u64,
        now_ms: u64,
    ) -> Result<String, Error> {
        self.recheck(grants, corpus, work_revision, now_ms)?;
        serde_json::to_string(&Input {
            version: "0.1",
            job: &self.spec.job,
            question: &self.query,
            excerpts: self
                .citations
                .iter()
                .enumerate()
                .map(|(index, citation)| Excerpt {
                    index,
                    text: &citation.excerpt,
                })
                .collect(),
            max_proposals: self.spec.max_proposals,
        })
        .map_err(|_| Error::Shape)
    }

    /// Bind each proposed interpretation to an excerpt already provided.
    /// No arbitrary source IDs, reviewer fields, tool calls or approvals.
    /// The caller owns attempt/retry/cancel state; this is not a job runner.
    pub fn validate_output(
        &self,
        raw: &str,
        grants: &Grants,
        corpus: &Corpus,
        work_revision: u64,
        now_ms: u64,
    ) -> Result<Vec<Proposal>, Error> {
        self.recheck(grants, corpus, work_revision, now_ms)?;
        if raw.len() > MAX_OUTPUT_BYTES {
            return Err(Error::Capacity);
        }
        let output: Output = serde_json::from_str(raw).map_err(|_| Error::Shape)?;
        if output.version != "0.1" || output.job != self.spec.job {
            return Err(Error::Invalid);
        }
        if output.proposals.len() > self.spec.max_proposals {
            return Err(Error::Capacity);
        }
        let mut seen = BTreeSet::new();
        let mut result = Vec::new();
        for item in output.proposals {
            let citation = self
                .citations
                .get(item.excerpt_index)
                .ok_or(Error::Invalid)?;
            if item.proposition.trim().is_empty() || item.proposition.chars().count() > 2_000 {
                return Err(Error::Invalid);
            }
            let key = (
                item.excerpt_index,
                item.proposition.clone(),
                matches!(item.polarity, Polarity::Supports),
            );
            if !seen.insert(key) {
                return Err(Error::Invalid);
            }
            result.push(Proposal {
                proposition: item.proposition,
                polarity: item.polarity,
                citation: citation.clone(),
            });
        }
        Ok(result)
    }
}

fn check_job(
    spec: &JobSpec,
    grants: &Grants,
    work_revision: u64,
    now_ms: u64,
) -> Result<(), Error> {
    if spec.scope != grants.scope
        || spec.work_revision != work_revision
        || now_ms >= spec.expires_at_ms
    {
        return Err(Error::Denied);
    }
    if !(1..=MAX_REVISION).contains(&work_revision)
        || spec.expires_at_ms > MAX_REVISION
        || now_ms > MAX_REVISION
    {
        return Err(Error::Invalid);
    }
    Ok(())
}
