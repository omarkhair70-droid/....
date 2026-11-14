//! Versioned internal history and a separate recipient-scoped command.
use super::{Command, Id, MAX_COMMAND_BYTES, MAX_REVISION, Operation, Reply, WireError, text_len};
use serde::{Deserialize, Serialize};
use serde_json::value::RawValue;

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct ReplyWire {
    schema_version: String,
    command_id: Id,
    work_id: Id,
    payload: Reply,
}

/// An immutable-snapshot response. Deliberately has no aggregate revision.
#[derive(Clone, PartialEq, Eq)]
pub struct ScopedReply {
    command_id: Id,
    work_id: Id,
    reply: Reply,
}

impl ScopedReply {
    pub fn parse(raw: &str) -> Result<Self, WireError> {
        if raw.len() > MAX_COMMAND_BYTES {
            return Err(WireError::TooLarge);
        }
        let wire: ReplyWire = serde_json::from_str(raw).map_err(|_| WireError::InvalidShape)?;
        if wire.schema_version != "0.1"
            || !(1..=MAX_REVISION).contains(&wire.payload.snapshot_revision)
            || !wire
                .payload
                .comment
                .as_ref()
                .is_none_or(|c| text_len(c, 0, 3_000))
        {
            return Err(WireError::InvalidValue);
        }
        Ok(Self {
            command_id: wire.command_id,
            work_id: wire.work_id,
            reply: wire.payload,
        })
    }

    pub fn command_id(&self) -> &Id {
        &self.command_id
    }

    pub fn work_id(&self) -> &Id {
        &self.work_id
    }

    pub fn reply(&self) -> &Reply {
        &self.reply
    }

    /// Trusted boundary only. Binding to the current internal revision is not
    /// a new decision by the recipient; the disclosed snapshot never changes.
    pub fn bind(&self, expected_revision: u64) -> Result<Command, WireError> {
        if !(1..=MAX_REVISION).contains(&expected_revision) {
            return Err(WireError::InvalidValue);
        }
        Ok(Command {
            schema_version: "0.1".to_owned(),
            command_id: self.command_id.clone(),
            work_id: self.work_id.clone(),
            expected_revision,
            operation: Operation::RespondToShare(self.reply.clone()),
        })
    }
}

const MAX_RECORD_BYTES: usize = MAX_COMMAND_BYTES + 1024;

/// Internal storage envelope, not a public API or proof of authenticity.
pub struct StoredCommand {
    pub actor: Id,
    pub command: Command,
    pub recorded_at_ms: u64,
    pub accepted_revision: u64,
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct RecordWire {
    record_version: String,
    actor: Id,
    recorded_at_ms: u64,
    accepted_revision: u64,
    command: Box<RawValue>,
}

#[derive(Serialize)]
struct RecordOut<'a> {
    record_version: &'static str,
    actor: &'a Id,
    recorded_at_ms: u64,
    accepted_revision: u64,
    command: &'a Command,
}

impl StoredCommand {
    fn check(&self) -> Result<(), WireError> {
        if self.recorded_at_ms > MAX_REVISION
            || !(1..=MAX_REVISION).contains(&self.accepted_revision)
            || self.command.expected_revision().checked_add(1) != Some(self.accepted_revision)
        {
            return Err(WireError::InvalidValue);
        }
        Ok(())
    }

    pub fn parse(raw: &str) -> Result<Self, WireError> {
        if raw.len() > MAX_RECORD_BYTES {
            return Err(WireError::TooLarge);
        }
        let wire: RecordWire = serde_json::from_str(raw).map_err(|_| WireError::InvalidShape)?;
        if wire.record_version != "0.1" {
            return Err(WireError::InvalidValue);
        }
        let record = Self {
            actor: wire.actor,
            command: Command::parse(wire.command.get())?,
            recorded_at_ms: wire.recorded_at_ms,
            accepted_revision: wire.accepted_revision,
        };
        record.check()?;
        Ok(record)
    }

    pub fn to_json(&self) -> Result<String, WireError> {
        self.check()?;
        let raw = serde_json::to_string(&RecordOut {
            record_version: "0.1",
            actor: &self.actor,
            recorded_at_ms: self.recorded_at_ms,
            accepted_revision: self.accepted_revision,
            command: &self.command,
        })
        .map_err(|_| WireError::InvalidShape)?;
        if raw.len() > MAX_RECORD_BYTES {
            return Err(WireError::TooLarge);
        }
        Ok(raw)
    }
}
