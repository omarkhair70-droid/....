//! Transactional persistence for a trusted, isolated world.
//! No transport, identity provider, external effects, or production credentials.
#![forbid(unsafe_code)]

use postgres::{Client, IsolationLevel, Transaction};
use world_kernel::{Kernel, OwnerView, Receipt, Recorded, Rejection, ScopedReceipt, SharedView};
use world_language::{Command, Id, Operation, ScopedReply, StoredCommand};

// Deliberately bounded full-replay baseline: no unbounded production workload.
const MAX_EVENTS: i64 = 5_000;
const MAX_BYTES: i64 = 64 * 1024 * 1024;
const MAX_PRINCIPALS: usize = 5_000;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum MemoryError {
    Database,
    CommitUncertain,
    CorruptHistory,
    Capacity,
    Domain(Rejection),
}

impl From<postgres::Error> for MemoryError {
    fn from(_: postgres::Error) -> Self {
        // Do not expose SQL diagnostics or private payloads.
        Self::Database
    }
}

impl From<Rejection> for MemoryError {
    fn from(value: Rejection) -> Self {
        Self::Domain(value)
    }
}

/// Owned by an authenticated server boundary, never a browser or an AI worker.
/// The supplied client must use a trusted runtime role and isolated database.
/// Mutable principal membership is explicitly unsupported in this slice.
pub struct Memory {
    client: Client,
}

impl Memory {
    pub fn new(client: Client) -> Self {
        Self { client }
    }

    fn transact<T>(
        &mut self,
        apply: impl FnOnce(&mut Kernel) -> Result<T, MemoryError>,
    ) -> Result<T, MemoryError> {
        let mut tx = self
            .client
            .build_transaction()
            .isolation_level(IsolationLevel::ReadCommitted)
            .start()?;
        tx.batch_execute(
            "SET LOCAL lock_timeout = '5s'; SET LOCAL statement_timeout = '15s';",
        )?;
        // Every adapter operation takes the same lock before reading the log.
        // Read Committed gives later statements the latest committed version.
        let head: i64 = tx
            .query_one(
                "SELECT last_seq FROM world_private.stream_head WHERE singleton FOR UPDATE",
                &[],
            )?
            .try_get(0)?;
        let (mut kernel, bytes) = load(&mut tx, head)?;
        let before = kernel.history().len();
        let result = apply(&mut kernel)?;
        let after = kernel.history().len();
        if after == before + 1 {
            let next = head.checked_add(1).ok_or(MemoryError::Capacity)?;
            if next > MAX_EVENTS {
                return Err(MemoryError::Capacity);
            }
            let raw = kernel.history()[before]
                .to_json()
                .map_err(|_| MemoryError::CorruptHistory)?;
            let raw_size = i64::try_from(raw.len()).map_err(|_| MemoryError::Capacity)?;
            if bytes + raw_size > MAX_BYTES {
                return Err(MemoryError::Capacity);
            }
            let stored = StoredCommand::parse(&raw).map_err(|_| MemoryError::CorruptHistory)?;
            let revision =
                i64::try_from(stored.accepted_revision).map_err(|_| MemoryError::CorruptHistory)?;
            tx.execute(
                "INSERT INTO world_private.events
                 (seq, actor_id, command_id, work_id, revision, record_text)
                 VALUES ($1, $2, $3, $4, $5, $6)",
                &[
                    &next,
                    &stored.actor.as_str(),
                    &stored.command.command_id().as_str(),
                    &stored.command.work_id().as_str(),
                    &revision,
                    &raw,
                ],
            )?;
            let changed = tx.execute(
                "UPDATE world_private.stream_head SET last_seq = $1
                 WHERE singleton AND last_seq = $2",
                &[&next, &head],
            )?;
            if changed != 1 {
                return Err(MemoryError::CorruptHistory);
            }
        } else if after != before {
            return Err(MemoryError::CorruptHistory);
        }
        // On ambiguous commit result the caller may retry the identical command
        // with the same ID. Never claim success before COMMIT is acknowledged.
        tx.commit().map_err(|_| MemoryError::CommitUncertain)?;
        Ok(result)
    }

    pub fn submit_owner(
        &mut self,
        actor: &Id,
        command: Command,
        recorded_at_ms: u64,
    ) -> Result<Receipt, MemoryError> {
        if matches!(command.operation(), Operation::RespondToShare(_)) {
            return Err(Rejection::Denied.into());
        }
        self.transact(|kernel| Ok(kernel.submit(actor, command, recorded_at_ms)?))
    }

    pub fn respond(
        &mut self,
        actor: &Id,
        request: &ScopedReply,
        recorded_at_ms: u64,
    ) -> Result<ScopedReceipt, MemoryError> {
        self.transact(|kernel| Ok(kernel.respond(actor, request, recorded_at_ms)?))
    }

    pub fn owner_view(
        &mut self,
        actor: &Id,
        work_id: &Id,
    ) -> Result<Option<OwnerView>, MemoryError> {
        self.transact(|kernel| Ok(kernel.owner_view(actor, work_id)))
    }

    pub fn shared_view(
        &mut self,
        actor: &Id,
        work_id: &Id,
        share_id: &Id,
    ) -> Result<Option<SharedView>, MemoryError> {
        self.transact(|kernel| Ok(kernel.shared_view(actor, work_id, share_id)))
    }
}

fn load(tx: &mut Transaction<'_>, head: i64) -> Result<(Kernel, i64), MemoryError> {
    if head < 0 {
        return Err(MemoryError::CorruptHistory);
    }
    if head > MAX_EVENTS {
        return Err(MemoryError::Capacity);
    }
    let totals = tx.query_one(
        "SELECT count(*), COALESCE(sum(octet_length(record_text)::bigint), 0)::bigint
         FROM world_private.events",
        &[],
    )?;
    let count: i64 = totals.try_get(0)?;
    let bytes: i64 = totals.try_get(1)?;
    if count != head || bytes < 0 {
        return Err(MemoryError::CorruptHistory);
    }
    if bytes > MAX_BYTES {
        return Err(MemoryError::Capacity);
    }
    let rows = tx.query(
        "SELECT principal_id FROM world_private.principals ORDER BY principal_id LIMIT 5001",
        &[],
    )?;
    if rows.len() > MAX_PRINCIPALS {
        return Err(MemoryError::Capacity);
    }
    let principals: Vec<Id> = rows
        .iter()
        .map(|row| {
            let raw: String = row.try_get(0)?;
            Id::parse(&raw).map_err(|_| MemoryError::CorruptHistory)
        })
        .collect::<Result<_, MemoryError>>()?;
    let rows = tx.query(
        "SELECT seq, actor_id, command_id, work_id, revision, record_text
         FROM world_private.events ORDER BY seq",
        &[],
    )?;
    let mut records: Vec<Recorded> = Vec::with_capacity(rows.len());
    for (index, row) in rows.iter().enumerate() {
        let seq: i64 = row.try_get(0)?;
        let actor: String = row.try_get(1)?;
        let command: String = row.try_get(2)?;
        let work: String = row.try_get(3)?;
        let revision: i64 = row.try_get(4)?;
        let raw: String = row.try_get(5)?;
        let stored = StoredCommand::parse(&raw).map_err(|_| MemoryError::CorruptHistory)?;
        if seq != i64::try_from(index + 1).map_err(|_| MemoryError::CorruptHistory)?
            || stored.actor.as_str() != actor
            || stored.command.command_id().as_str() != command
            || stored.command.work_id().as_str() != work
            || i64::try_from(stored.accepted_revision).ok() != Some(revision)
        {
            return Err(MemoryError::CorruptHistory);
        }
        records.push(Recorded::parse(&raw).map_err(|_| MemoryError::CorruptHistory)?);
    }
    if i64::try_from(records.len()).ok() != Some(head) {
        return Err(MemoryError::CorruptHistory);
    }
    let kernel = Kernel::replay(principals, &records).map_err(|_| MemoryError::CorruptHistory)?;
    Ok((kernel, bytes))
}
