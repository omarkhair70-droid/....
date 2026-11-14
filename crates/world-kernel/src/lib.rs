//! First deterministic world kernel. Pure domain code; no I/O or model calls.
//! The calling server must authenticate the actor and authorize registry changes.
#![forbid(unsafe_code)]

use std::collections::{BTreeMap, BTreeSet};
use world_language::{Command, Id, MAX_REVISION, Operation, Response, ScopedReply, StoredCommand, WireError};

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Rejection {
    Denied,
    AlreadyExists,
    StaleRevision,
    WrongSnapshot,
    CommandCollision,
    DuplicateShare,
    NoChange,
    Revoked,
    RevisionExhausted,
    InvalidTime,
    InvalidHistory,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Receipt {
    pub command_id: Id,
    pub work_id: Id,
    pub revision: u64,
}

#[derive(Clone, PartialEq, Eq)]
pub struct Recorded {
    actor: Id,
    command: Command,
    recorded_at_ms: u64,
    receipt: Receipt,
}

impl Recorded {
    /// Persist only behind a trusted storage boundary. Contains private data.
    pub fn to_json(&self) -> Result<String, WireError> {
        StoredCommand {
            actor: self.actor.clone(),
            command: self.command.clone(),
            recorded_at_ms: self.recorded_at_ms,
            accepted_revision: self.receipt.revision,
        }
        .to_json()
    }

    /// Shape checks only; replay verifies the historical domain transition.
    pub fn parse(raw: &str) -> Result<Self, WireError> {
        let record = StoredCommand::parse(raw)?;
        let receipt = Receipt {
            command_id: record.command.command_id().clone(),
            work_id: record.command.work_id().clone(),
            revision: record.accepted_revision,
        };
        Ok(Self {
            actor: record.actor,
            command: record.command,
            recorded_at_ms: record.recorded_at_ms,
            receipt,
        })
    }
}

/// Recipient-safe acknowledgement. No private aggregate revision appears.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct ScopedReceipt {
    pub command_id: Id,
    pub share_id: Id,
    pub snapshot_revision: u64,
}

#[derive(Clone, PartialEq, Eq)]
pub struct ResponseView {
    pub snapshot_revision: u64,
    pub response: Response,
    pub comment: Option<String>,
    pub recorded_at_ms: u64,
}

#[derive(Clone, PartialEq, Eq)]
pub struct SharedView {
    pub share_id: Id,
    pub snapshot_revision: u64,
    pub title: String,
    pub scope_text: String,
    pub responses: Vec<ResponseView>,
}

#[derive(Clone, PartialEq, Eq)]
pub struct OwnerShareView {
    pub recipient_id: Id,
    pub revoked: bool,
    pub disclosed: SharedView,
}

#[derive(Clone, PartialEq, Eq)]
pub struct OwnerView {
    pub work_id: Id,
    pub revision: u64,
    pub title: String,
    pub body: String,
    pub shares: Vec<OwnerShareView>,
}

struct Share {
    recipient: Id,
    revoked: bool,
    view: SharedView,
}

struct Work {
    owner: Id,
    revision: u64,
    title: String,
    body: String,
    shares: BTreeMap<Id, Share>,
}

/// Server-internal aggregate engine. Do not serialize it to a browser.
/// A fixed verified-principal registry is intentionally used in this slice.
/// Durable identity, grants and transaction handling belong to the next slice.
pub struct Kernel {
    principals: BTreeSet<Id>,
    works: BTreeMap<Id, Work>,
    admitted: BTreeMap<(Id, Id), usize>,
    history: Vec<Recorded>,
}

impl Kernel {
    pub fn new(principals: impl IntoIterator<Item = Id>) -> Self {
        Self {
            principals: principals.into_iter().collect(),
            works: BTreeMap::new(),
            admitted: BTreeMap::new(),
            history: Vec::new(),
        }
    }

    fn authorize(&self, actor: &Id, command: &Command) -> Result<(), Rejection> {
        if !self.principals.contains(actor) {
            return Err(Rejection::Denied);
        }
        let work = self.works.get(command.work_id());
        match command.operation() {
            Operation::CreateWork(_) => {
                if work.is_some_and(|w| &w.owner != actor) {
                    return Err(Rejection::Denied);
                }
            }
            Operation::RespondToShare(reply) => {
                let share = work
                    .and_then(|w| w.shares.get(&reply.share_id))
                    .ok_or(Rejection::Denied)?;
                if share.revoked || &share.recipient != actor {
                    return Err(Rejection::Denied);
                }
            }
            _ => {
                if !work.is_some_and(|w| &w.owner == actor) {
                    return Err(Rejection::Denied);
                }
            }
        }
        Ok(())
    }

    /// Admission at an authenticated, trusted boundary.
    /// The receipt and history are server-internal, not recipient projections.
    /// An exact retry checks current permission but never advances the revision.
    pub fn submit(
        &mut self,
        actor: &Id,
        command: Command,
        recorded_at_ms: u64,
    ) -> Result<Receipt, Rejection> {
        self.authorize(actor, &command)?;
        let key = (actor.clone(), command.command_id().clone());
        if let Some(index) = self.admitted.get(&key) {
            let old = &self.history[*index];
            if old.command != command {
                return Err(Rejection::CommandCollision);
            }
            return Ok(old.receipt.clone());
        }
        if recorded_at_ms > MAX_REVISION {
            return Err(Rejection::InvalidTime);
        }
        let revision = match self.works.get(command.work_id()) {
            Some(work) => work.revision,
            None => 0,
        };
        if revision != command.expected_revision() {
            return Err(Rejection::StaleRevision);
        }
        let next = revision
            .checked_add(1)
            .filter(|v| *v <= MAX_REVISION)
            .ok_or(Rejection::RevisionExhausted)?;

        // Every fallible domain check precedes mutation of the affected aggregate.
        match command.operation() {
            Operation::CreateWork(text) => {
                if self.works.contains_key(command.work_id()) {
                    return Err(Rejection::AlreadyExists);
                }
                self.works.insert(
                    command.work_id().clone(),
                    Work {
                        owner: actor.clone(),
                        revision: next,
                        title: text.title.clone(),
                        body: text.body.clone(),
                        shares: BTreeMap::new(),
                    },
                );
            }
            Operation::ReviseWork(text) => {
                let work = self
                    .works
                    .get_mut(command.work_id())
                    .ok_or(Rejection::Denied)?;
                if work.title == text.title && work.body == text.body {
                    return Err(Rejection::NoChange);
                }
                work.title.clone_from(&text.title);
                work.body.clone_from(&text.body);
                work.revision = next;
            }
            Operation::ShareWork(text) => {
                if !self.principals.contains(&text.recipient_id) || &text.recipient_id == actor {
                    return Err(Rejection::Denied);
                }
                let work = self
                    .works
                    .get_mut(command.work_id())
                    .ok_or(Rejection::Denied)?;
                if work.shares.contains_key(&text.share_id) {
                    return Err(Rejection::DuplicateShare);
                }
                work.shares.insert(
                    text.share_id.clone(),
                    Share {
                        recipient: text.recipient_id.clone(),
                        revoked: false,
                        view: SharedView {
                            share_id: text.share_id.clone(),
                            snapshot_revision: revision,
                            title: text.title.clone(),
                            scope_text: text.scope_text.clone(),
                            responses: Vec::new(),
                        },
                    },
                );
                work.revision = next;
            }
            Operation::RespondToShare(reply) => {
                let work = self
                    .works
                    .get_mut(command.work_id())
                    .ok_or(Rejection::Denied)?;
                let share = work
                    .shares
                    .get_mut(&reply.share_id)
                    .ok_or(Rejection::Denied)?;
                if share.view.snapshot_revision != reply.snapshot_revision {
                    return Err(Rejection::WrongSnapshot);
                }
                share.view.responses.push(ResponseView {
                    snapshot_revision: reply.snapshot_revision,
                    response: reply.response,
                    comment: reply.comment.clone(),
                    recorded_at_ms,
                });
                work.revision = next;
            }
            Operation::RevokeShare(reference) => {
                let work = self
                    .works
                    .get_mut(command.work_id())
                    .ok_or(Rejection::Denied)?;
                let share = work
                    .shares
                    .get_mut(&reference.share_id)
                    .ok_or(Rejection::Denied)?;
                if share.revoked {
                    return Err(Rejection::Revoked);
                }
                share.revoked = true;
                work.revision = next;
            }
        }
        let receipt = Receipt {
            command_id: command.command_id().clone(),
            work_id: command.work_id().clone(),
            revision: next,
        };
        self.admitted.insert(key, self.history.len());
        self.history.push(Recorded {
            actor: actor.clone(),
            command,
            recorded_at_ms,
            receipt: receipt.clone(),
        });
        Ok(receipt)
    }

    /// Admit a response against the immutable disclosed snapshot while holding
    /// exclusive access to the aggregate. Do not expose internal submit to a
    /// recipient. A storage adapter must implement the same transaction boundary.
    pub fn respond(
        &mut self,
        actor: &Id,
        request: &ScopedReply,
        recorded_at_ms: u64,
    ) -> Result<ScopedReceipt, Rejection> {
        let reply = request.reply();
        let work = self.works.get(request.work_id()).ok_or(Rejection::Denied)?;
        let share = work.shares.get(&reply.share_id).ok_or(Rejection::Denied)?;
        if !self.principals.contains(actor) || share.revoked || &share.recipient != actor {
            return Err(Rejection::Denied);
        }
        if share.view.snapshot_revision != reply.snapshot_revision {
            return Err(Rejection::WrongSnapshot);
        }
        // For a retry, bind exactly the original internal revision before
        // submit compares the complete typed command. Never use a new revision
        // to accidentally turn a retry into another response.
        let key = (actor.clone(), request.command_id().clone());
        let revision = self.admitted.get(&key).map_or(work.revision, |index| {
            self.history[*index].command.expected_revision()
        });
        let command = request.bind(revision).map_err(|_| Rejection::CommandCollision)?;
        self.submit(actor, command, recorded_at_ms)?;
        Ok(ScopedReceipt {
            command_id: request.command_id().clone(),
            share_id: reply.share_id.clone(),
            snapshot_revision: reply.snapshot_revision,
        })
    }

    /// Only the verified owner can retrieve the full text and share history.
    pub fn owner_view(&self, actor: &Id, work_id: &Id) -> Option<OwnerView> {
        let work = self.works.get(work_id)?;
        if !self.principals.contains(actor) || &work.owner != actor {
            return None;
        }
        Some(OwnerView {
            work_id: work_id.clone(),
            revision: work.revision,
            title: work.title.clone(),
            body: work.body.clone(),
            shares: work
                .shares
                .values()
                .map(|share| OwnerShareView {
                    recipient_id: share.recipient.clone(),
                    revoked: share.revoked,
                    disclosed: share.view.clone(),
                })
                .collect(),
        })
    }

    /// The recipient sees the disclosed snapshot, never current aggregate
    /// revision, owner-private body, other recipients, or other shares.
    pub fn shared_view(&self, actor: &Id, work_id: &Id, share_id: &Id) -> Option<SharedView> {
        let share = self.works.get(work_id)?.shares.get(share_id)?;
        if !self.principals.contains(actor) || share.revoked || &share.recipient != actor {
            return None;
        }
        Some(share.view.clone())
    }

    /// Trusted internal history, not an endpoint or a permission grant.
    pub fn history(&self) -> &[Recorded] {
        &self.history
    }

    /// Rebuild from an admitted, trusted sequence using a fixed principal
    /// registry. Duplicate or inconsistent records are rejected.
    pub fn replay(
        principals: impl IntoIterator<Item = Id>,
        records: &[Recorded],
    ) -> Result<Self, Rejection> {
        let mut kernel = Self::new(principals);
        for record in records {
            let previous_count = kernel.history.len();
            let receipt =
                kernel.submit(&record.actor, record.command.clone(), record.recorded_at_ms)?;
            if receipt != record.receipt || kernel.history.len() != previous_count + 1 {
                return Err(Rejection::InvalidHistory);
            }
        }
        Ok(kernel)
    }
}
