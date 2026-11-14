//! World Language v0.1. Wire shape and validated types, not authority.
#![forbid(unsafe_code)]

use serde::{Deserialize, Deserializer, Serialize, de};
use serde_json::value::RawValue;

pub const MAX_REVISION: u64 = 9_007_199_254_740_991;
pub const MAX_COMMAND_BYTES: usize = 256 * 1024;

#[derive(Clone, Debug, PartialEq, Eq, PartialOrd, Ord, Serialize)]
#[serde(transparent)]
pub struct Id(String);

impl Id {
    pub fn parse(value: &str) -> Result<Self, WireError> {
        let bytes = value.as_bytes();
        if bytes.len() != 36
            || !bytes.iter().enumerate().all(|(i, b)| {
                if matches!(i, 8 | 13 | 18 | 23) {
                    *b == b'-'
                } else {
                    b.is_ascii_digit() || (b'a'..=b'f').contains(b)
                }
            })
        {
            return Err(WireError::InvalidValue);
        }
        Ok(Self(value.to_owned()))
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl<'de> Deserialize<'de> for Id {
    fn deserialize<D: Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        let value = String::deserialize(deserializer)?;
        Self::parse(&value).map_err(|_| de::Error::custom("invalid identifier"))
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum WireError {
    TooLarge,
    InvalidShape,
    InvalidValue,
}

#[derive(Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct WorkText {
    pub title: String,
    pub body: String,
}

#[derive(Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum Permission {
    #[serde(rename = "view_respond")]
    ViewRespond,
}

#[derive(Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ShareText {
    pub share_id: Id,
    pub recipient_id: Id,
    pub title: String,
    pub scope_text: String,
    pub permission: Permission,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Response {
    InterestedInDiscussion,
    Decline,
    RequestChange,
}

fn present_string<'de, D: Deserializer<'de>>(d: D) -> Result<Option<String>, D::Error> {
    String::deserialize(d).map(Some)
}

#[derive(Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Reply {
    pub share_id: Id,
    pub snapshot_revision: u64,
    pub response: Response,
    #[serde(
        default,
        deserialize_with = "present_string",
        skip_serializing_if = "Option::is_none"
    )]
    pub comment: Option<String>,
}

#[derive(Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ShareRef {
    pub share_id: Id,
}

#[derive(Clone, PartialEq, Eq, Serialize)]
#[serde(tag = "kind", content = "payload")]
pub enum Operation {
    CreateWork(WorkText),
    ReviseWork(WorkText),
    ShareWork(ShareText),
    RespondToShare(Reply),
    RevokeShare(ShareRef),
}

#[derive(Clone, PartialEq, Eq, Serialize)]
pub struct Command {
    schema_version: String,
    command_id: Id,
    work_id: Id,
    expected_revision: u64,
    #[serde(flatten)]
    operation: Operation,
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Wire {
    schema_version: String,
    command_id: Id,
    work_id: Id,
    expected_revision: u64,
    kind: String,
    payload: Box<RawValue>,
}

fn decode<T: de::DeserializeOwned>(raw: &RawValue) -> Result<T, WireError> {
    serde_json::from_str(raw.get()).map_err(|_| WireError::InvalidShape)
}

fn text_len(value: &str, min: usize, max: usize) -> bool {
    (min..=max).contains(&value.chars().count())
}

impl Command {
    /// Parse the actual raw request, before conversion to a generic JSON map.
    /// Typed decoding rejects duplicate and unknown fields; error categories
    /// deliberately contain no caller-controlled content.
    pub fn parse(raw: &str) -> Result<Self, WireError> {
        if raw.len() > MAX_COMMAND_BYTES {
            return Err(WireError::TooLarge);
        }
        let wire: Wire = serde_json::from_str(raw).map_err(|_| WireError::InvalidShape)?;
        if wire.schema_version != "0.1" || wire.expected_revision > MAX_REVISION {
            return Err(WireError::InvalidValue);
        }
        let operation = match wire.kind.as_str() {
            "CreateWork" => Operation::CreateWork(decode(&wire.payload)?),
            "ReviseWork" => Operation::ReviseWork(decode(&wire.payload)?),
            "ShareWork" => Operation::ShareWork(decode(&wire.payload)?),
            "RespondToShare" => Operation::RespondToShare(decode(&wire.payload)?),
            "RevokeShare" => Operation::RevokeShare(decode(&wire.payload)?),
            _ => return Err(WireError::InvalidShape),
        };
        let valid = match &operation {
            Operation::CreateWork(w) | Operation::ReviseWork(w) => {
                text_len(&w.title, 1, 240) && text_len(&w.body, 1, 12_000)
            }
            Operation::ShareWork(s) => {
                text_len(&s.title, 1, 240) && text_len(&s.scope_text, 1, 6_000)
            }
            Operation::RespondToShare(r) => {
                (1..=MAX_REVISION).contains(&r.snapshot_revision)
                    && r.comment.as_ref().is_none_or(|c| text_len(c, 0, 3_000))
            }
            Operation::RevokeShare(_) => true,
        };
        if !valid || (matches!(&operation, Operation::CreateWork(_)) != (wire.expected_revision == 0))
        {
            return Err(WireError::InvalidValue);
        }
        Ok(Self {
            schema_version: wire.schema_version,
            command_id: wire.command_id,
            work_id: wire.work_id,
            expected_revision: wire.expected_revision,
            operation,
        })
    }

    pub fn command_id(&self) -> &Id {
        &self.command_id
    }

    pub fn work_id(&self) -> &Id {
        &self.work_id
    }

    pub fn expected_revision(&self) -> u64 {
        self.expected_revision
    }

    pub fn operation(&self) -> &Operation {
        &self.operation
    }

    /// Canonical typed representation for comparison and trusted persistence.
    /// Never log it or expose it to a different actor.
    pub fn to_json(&self) -> Result<String, serde_json::Error> {
        serde_json::to_string(self)
    }
}
