//! Transport-independent request boundary. Only trusted server code supplies
//! a verifier, a route and a recorded time. No production verifier is included.

use crate::{Memory, MemoryError};
use serde_json::{Value, json};
use world_kernel::{OwnerView, Rejection, SharedView};
use world_language::{Command, Id, ScopedReply};

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum VerifyError {
    Invalid,
    Unavailable,
}

/// Server-owned port. Implementations must verify issuer, audience, expiry,
/// signature/session validity and revocation, then resolve a registered actor.
/// A claim, token string, email address or caller-provided ID is not proof.
pub trait IdentityVerifier {
    fn verify(&self, credential: &str) -> Result<Id, VerifyError>;
}

pub enum Request<'a> {
    OwnerCommand(&'a str),
    ScopedReply(&'a str),
    OwnerView(&'a str),
    SharedView { work: &'a str, share: &'a str },
}

/// Explicit JSON representation for a future transport. Not an HTTP server.
/// Transport must set no-store, enforce request limits and never log bodies.
pub struct AccessResponse {
    pub status: u16,
    pub body: Value,
}

pub struct Access<'a, V> {
    memory: &'a mut Memory,
    verifier: &'a V,
}

impl<'a, V: IdentityVerifier> Access<'a, V> {
    pub fn new(memory: &'a mut Memory, verifier: &'a V) -> Self {
        Self { memory, verifier }
    }

    /// The time comes from trusted server code, never client JSON.
    /// Reverify the credential on every operation, including idempotent retry.
    pub fn handle(
        &mut self,
        credential: &str,
        request: Request<'_>,
        recorded_at_ms: u64,
    ) -> AccessResponse {
        if credential.is_empty() || credential.len() > 16_384 {
            return error(401, "unauthenticated");
        }
        let actor = match self.verifier.verify(credential) {
            Ok(actor) => actor,
            Err(VerifyError::Invalid) => return error(401, "unauthenticated"),
            Err(VerifyError::Unavailable) => return error(503, "unavailable"),
        };
        match request {
            Request::OwnerCommand(raw) => {
                let Ok(command) = Command::parse(raw) else {
                    return error(400, "invalid_request");
                };
                match self.memory.submit_owner(&actor, command, recorded_at_ms) {
                    Ok(receipt) => ok(json!({
                        "command_id":receipt.command_id,
                        "work_id":receipt.work_id,
                        "revision":receipt.revision
                    })),
                    Err(err) => memory_error(err),
                }
            }
            Request::ScopedReply(raw) => {
                let Ok(reply) = ScopedReply::parse(raw) else {
                    return error(400, "invalid_request");
                };
                match self.memory.respond(&actor, &reply, recorded_at_ms) {
                    Ok(receipt) => ok(json!({
                        "command_id":receipt.command_id,
                        "share_id":receipt.share_id,
                        "snapshot_revision":receipt.snapshot_revision
                    })),
                    Err(err) => memory_error(err),
                }
            }
            Request::OwnerView(raw) => {
                let Ok(work) = Id::parse(raw) else {
                    return error(400, "invalid_request");
                };
                match self.memory.owner_view(&actor, &work) {
                    Ok(Some(view)) => ok(owner_json(&view)),
                    Ok(None) => error(404, "not_found"),
                    Err(err) => memory_error(err),
                }
            }
            Request::SharedView { work, share } => {
                let (Ok(work), Ok(share)) = (Id::parse(work), Id::parse(share)) else {
                    return error(400, "invalid_request");
                };
                match self.memory.shared_view(&actor, &work, &share) {
                    Ok(Some(view)) => ok(shared_json(&view)),
                    Ok(None) => error(404, "not_found"),
                    Err(err) => memory_error(err),
                }
            }
        }
    }
}

fn ok(body: Value) -> AccessResponse {
    AccessResponse { status: 200, body }
}

fn error(status: u16, code: &'static str) -> AccessResponse {
    AccessResponse {
        status,
        body: json!({"error":code}),
    }
}

fn memory_error(err: MemoryError) -> AccessResponse {
    match err {
        MemoryError::Domain(Rejection::Denied) => error(404, "not_found"),
        MemoryError::Domain(
            Rejection::AlreadyExists
            | Rejection::StaleRevision
            | Rejection::WrongSnapshot
            | Rejection::CommandCollision
            | Rejection::DuplicateShare
            | Rejection::NoChange
            | Rejection::Revoked,
        ) => error(409, "conflict"),
        MemoryError::CommitUncertain => error(503, "outcome_uncertain_retry_same_id"),
        _ => error(503, "unavailable"),
    }
}

fn shared_json(view: &SharedView) -> Value {
    let responses: Vec<_> = view
        .responses
        .iter()
        .map(|r| {
            json!({
                "snapshot_revision":r.snapshot_revision,
                "response":r.response,
                "comment":r.comment,
                "recorded_at_ms":r.recorded_at_ms
            })
        })
        .collect();
    json!({
        "share_id":view.share_id,
        "snapshot_revision":view.snapshot_revision,
        "title":view.title,
        "scope_text":view.scope_text,
        "responses":responses
    })
}

fn owner_json(view: &OwnerView) -> Value {
    let shares: Vec<_> = view
        .shares
        .iter()
        .map(|s| {
            json!({
                "recipient_id":s.recipient_id,
                "revoked":s.revoked,
                "disclosed":shared_json(&s.disclosed)
            })
        })
        .collect();
    json!({
        "work_id":view.work_id,
        "revision":view.revision,
        "title":view.title,
        "body":view.body,
        "shares":shares
    })
}
