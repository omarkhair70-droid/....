//! Bounded local retrieval of exact source spans and identity hypotheses.
//! All source acquisition, reviewer authority and permissions are external.
//! Search relevance and identity hints are not evidence of truth or consent.

use super::knowledge::{Citation, Source};
use std::collections::{BTreeMap, BTreeSet};
use world_language::{Id, MAX_REVISION};

const MAX_SOURCES: usize = 256;
const MAX_SOURCE_BYTES: usize = 128 * 1024;
const MAX_TOTAL_BYTES: usize = 8 * 1024 * 1024;
const MAX_CHUNK_BYTES: usize = 2_048;
const MAX_HITS: usize = 32;
const MAX_IDENTITIES: usize = 1_000;
const MAX_QUERY_BYTES: usize = 1_024;
const MAX_TERMS: usize = 32;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Error {
    Scope,
    Denied,
    Invalid,
    Duplicate,
    Capacity,
}

/// Supplied freshly by trusted server code. A source ID is not a permission.
pub struct Grants {
    pub scope: Id,
    pub versions: BTreeSet<(Id, u64)>,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Hit {
    pub citation: Citation,
    /// Count of distinct normalized query terms present, not confidence.
    pub matched_terms: usize,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Search {
    pub hits: Vec<Hit>,
    /// There were more matching authorized chunks than the requested limit.
    pub limited: bool,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct IdentityHint {
    pub entity: Id,
    pub scope: Id,
    pub name: String,
    /// Exact authority namespace and identifier strings, not guessed aliases.
    pub identifier: Option<(String, String)>,
    pub citation: Citation,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum IdentityQuery<'a> {
    Name(&'a str),
    Identifier { namespace: &'a str, value: &'a str },
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct IdentityMatches {
    pub entity_ids: Vec<Id>,
    pub hints: Vec<IdentityHint>,
}

/// Ephemeral single-scope corpus; rebuild/drop on access changes. No network
/// calls or writes to the knowledge ledger. Never share this across users.
pub struct Corpus {
    scope: Id,
    sources: BTreeMap<Id, Source>,
    identities: Vec<IdentityHint>,
}

impl Corpus {
    pub fn new(grants: &Grants, sources: Vec<Source>) -> Result<Self, Error> {
        if sources.len() > MAX_SOURCES {
            return Err(Error::Capacity);
        }
        let mut bytes = 0;
        let mut index = BTreeMap::new();
        for source in sources {
            if source.scope != grants.scope {
                return Err(Error::Scope);
            }
            if !grants
                .versions
                .contains(&(source.id.clone(), source.revision))
            {
                return Err(Error::Denied);
            }
            if !(1..=MAX_REVISION).contains(&source.revision)
                || source.acquired_at_ms > MAX_REVISION
                || source.locator.trim().is_empty()
                || source.locator.len() > 8_000
                || source.text.trim().is_empty()
                || source.text.len() > MAX_SOURCE_BYTES
            {
                return Err(Error::Invalid);
            }
            bytes += source.text.len();
            if bytes > MAX_TOTAL_BYTES {
                return Err(Error::Capacity);
            }
            if index.insert(source.id.clone(), source).is_some() {
                return Err(Error::Duplicate);
            }
        }
        Ok(Self {
            scope: grants.scope.clone(),
            sources: index,
            identities: Vec::new(),
        })
    }

    fn check_scope(&self, grants: &Grants) -> Result<(), Error> {
        if grants.scope != self.scope {
            return Err(Error::Scope);
        }
        Ok(())
    }

    fn visible(&self, grants: &Grants, source: &Source) -> bool {
        grants
            .versions
            .contains(&(source.id.clone(), source.revision))
    }

    fn exact_citation(&self, grants: &Grants, citation: &Citation) -> Result<(), Error> {
        self.check_scope(grants)?;
        if !grants
            .versions
            .contains(&(citation.source.clone(), citation.source_revision))
        {
            return Err(Error::Denied);
        }
        let source = self.sources.get(&citation.source).ok_or(Error::Invalid)?;
        if source.revision != citation.source_revision
            || citation.start >= citation.end
            || citation.excerpt.trim().is_empty()
            || citation.excerpt.len() > MAX_CHUNK_BYTES
            || source.text.get(citation.start..citation.end) != Some(citation.excerpt.as_str())
        {
            return Err(Error::Invalid);
        }
        Ok(())
    }

    /// Return exact UTF-8 excerpts; revoked versions are not searched/ranked.
    /// Deterministic local lexical baseline; no embeddings or inference.
    pub fn search(&self, grants: &Grants, query: &str, limit: usize) -> Result<Search, Error> {
        self.check_scope(grants)?;
        if limit == 0 || limit > MAX_HITS || query.len() > MAX_QUERY_BYTES {
            return Err(Error::Capacity);
        }
        let terms: BTreeSet<_> = tokens(query).into_iter().collect();
        if terms.is_empty() || terms.len() > MAX_TERMS {
            return Err(Error::Invalid);
        }
        let mut hits = Vec::new();
        let mut matched = 0;
        for source in self.sources.values() {
            if !self.visible(grants, source) {
                continue;
            }
            for (start, end) in chunks(&source.text) {
                let excerpt = &source.text[start..end];
                let words: BTreeSet<_> = tokens(excerpt).into_iter().collect();
                let score = terms.intersection(&words).count();
                if score == 0 {
                    continue;
                }
                matched += 1;
                hits.push(Hit {
                    citation: Citation {
                        source: source.id.clone(),
                        source_revision: source.revision,
                        start,
                        end,
                        excerpt: excerpt.to_owned(),
                    },
                    matched_terms: score,
                });
                hits.sort_by(|a, b| {
                    b.matched_terms
                        .cmp(&a.matched_terms)
                        .then_with(|| a.citation.source.cmp(&b.citation.source))
                        .then_with(|| a.citation.start.cmp(&b.citation.start))
                });
                hits.truncate(limit);
            }
        }
        Ok(Search {
            hits,
            limited: matched > limit,
        })
    }

    /// Add an upstream-reviewed identity hypothesis, never merge entities.
    /// Exact excerpt presence is checked; semantic review is outside this port.
    pub fn add_hint(&mut self, grants: &Grants, hint: IdentityHint) -> Result<(), Error> {
        self.check_scope(grants)?;
        if hint.scope != self.scope {
            return Err(Error::Scope);
        }
        self.exact_citation(grants, &hint.citation)?;
        if hint.name.len() > MAX_QUERY_BYTES || tokens(&hint.name).is_empty() {
            return Err(Error::Invalid);
        }
        if hint
            .identifier
            .as_ref()
            .is_some_and(|(ns, val)| !valid_key(ns) || !valid_key(val))
        {
            return Err(Error::Invalid);
        }
        if self.identities.contains(&hint) {
            return Ok(());
        }
        if self.identities.len() >= MAX_IDENTITIES {
            return Err(Error::Capacity);
        }
        self.identities.push(hint);
        Ok(())
    }

    /// Even a unique match is a hypothesis, not identity authentication.
    /// Preserve competing entities, including competing exact identifiers.
    pub fn identify(
        &self,
        grants: &Grants,
        query: IdentityQuery<'_>,
    ) -> Result<IdentityMatches, Error> {
        self.check_scope(grants)?;
        let name = match &query {
            IdentityQuery::Name(value) => {
                if value.len() > MAX_QUERY_BYTES {
                    return Err(Error::Capacity);
                }
                let words = tokens(value);
                if words.is_empty() {
                    return Err(Error::Invalid);
                }
                Some(words)
            }
            IdentityQuery::Identifier { namespace, value } => {
                if !valid_key(namespace) || !valid_key(value) {
                    return Err(Error::Invalid);
                }
                None
            }
        };
        let mut hints = Vec::new();
        for hint in &self.identities {
            if !grants
                .versions
                .contains(&(hint.citation.source.clone(), hint.citation.source_revision))
            {
                continue;
            }
            let matches = match &query {
                IdentityQuery::Name(_) => name.as_ref().is_some_and(|n| *n == tokens(&hint.name)),
                IdentityQuery::Identifier { namespace, value } => hint
                    .identifier
                    .as_ref()
                    .is_some_and(|(n, v)| n == namespace && v == value),
            };
            if matches {
                hints.push(hint.clone());
            }
        }
        hints.sort_by(|a, b| {
            a.entity
                .cmp(&b.entity)
                .then_with(|| a.citation.source.cmp(&b.citation.source))
                .then_with(|| a.citation.start.cmp(&b.citation.start))
                .then_with(|| a.citation.end.cmp(&b.citation.end))
                .then_with(|| a.name.cmp(&b.name))
                .then_with(|| a.identifier.cmp(&b.identifier))
        });
        let entity_ids = hints
            .iter()
            .map(|h| h.entity.clone())
            .collect::<BTreeSet<_>>();
        Ok(IdentityMatches {
            entity_ids: entity_ids.into_iter().collect(),
            hints,
        })
    }
}

fn valid_key(value: &str) -> bool {
    !value.is_empty()
        && value.len() <= MAX_QUERY_BYTES
        && value.trim() == value
        && !value.chars().any(char::is_control)
}

// Deliberately modest normalization: lowercase, selected Arabic marks and
// alef variants, punctuation separators. No transliteration or stemming.
fn tokens(value: &str) -> Vec<String> {
    let mut normalized = String::new();
    for ch in value.chars() {
        match ch {
            '\u{0640}' | '\u{064b}'..='\u{065f}' | '\u{0670}' => {}
            'أ' | 'إ' | 'آ' | 'ٱ' => normalized.push('ا'),
            ch if ch.is_alphanumeric() => normalized.extend(ch.to_lowercase()),
            _ => normalized.push(' '),
        }
    }
    normalized.split_whitespace().map(str::to_owned).collect()
}

// Split bounded chunks without cutting UTF-8. Prefer the last whitespace
// before the limit; a very long word may split. Preserve original offsets.
fn chunks(text: &str) -> Vec<(usize, usize)> {
    let mut result = Vec::new();
    let mut start = 0;
    while start < text.len() {
        let mut end = (start + MAX_CHUNK_BYTES).min(text.len());
        while !text.is_char_boundary(end) {
            end -= 1;
        }
        if end < text.len()
            && let Some((offset, ch)) = text[start..end]
                .char_indices()
                .rev()
                .find(|(offset, ch)| *offset > MAX_CHUNK_BYTES / 2 && ch.is_whitespace())
        {
            end = start + offset + ch.len_utf8();
        }
        result.push((start, end));
        start = end;
    }
    result
}
