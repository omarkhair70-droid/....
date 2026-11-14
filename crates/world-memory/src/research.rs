//! Owner-private historical research archive, using the same transaction lock.
//! No public transport route. The authority argument must come from a trusted
//! grant service, not a request body or an AI.
use super::{Memory, MemoryError};
use world_composition::archive::{Archive, ArchiveError, Authority, Restored};
use world_kernel::Rejection;
use world_language::Id;

const MAX_ARCHIVES: i64 = 64;
const MAX_TOTAL_BYTES: i64 = 32 * 1024 * 1024;

fn archive_error(err: ArchiveError) -> MemoryError {
    match err {
        ArchiveError::Denied => Rejection::Denied.into(),
        ArchiveError::Capacity => MemoryError::Capacity,
        _ => MemoryError::InvalidArchive,
    }
}

impl Memory {
    /// Save one immutable, reviewed snapshot. Exact retry is idempotent.
    /// New archive must reference the current work revision, under the same
    /// lock as canonical work commands. The archive is not itself a work event.
    pub fn save_research(
        &mut self,
        authority: &Authority,
        archive: &Archive,
    ) -> Result<(), MemoryError> {
        self.transact(|kernel, tx| {
            let owner = kernel
                .owner_view(&authority.actor, &archive.goal.work)
                .ok_or(Rejection::Denied)?;
            if authority.scope != archive.goal.work {
                return Err(Rejection::Denied.into());
            }
            let raw = archive.encode().map_err(archive_error)?;
            archive.restore(authority).map_err(archive_error)?;
            let work = archive.goal.work.as_str();
            let id = archive.archive_id.as_str();
            if let Some(row) = tx.query_opt(
                "SELECT actor_id, record_text FROM world_private.research_archives
                 WHERE work_id = $1 AND archive_id = $2",
                &[&work, &id],
            )? {
                let actor: String = row.try_get(0)?;
                let previous: String = row.try_get(1)?;
                if actor != authority.actor.as_str() || previous != raw {
                    return Err(Rejection::CommandCollision.into());
                }
                return Ok(());
            }
            if owner.revision != archive.goal.work_revision {
                return Err(Rejection::StaleRevision.into());
            }
            let row = tx.query_one(
                "SELECT count(*), COALESCE(sum(octet_length(record_text)::bigint), 0)::bigint
                 FROM world_private.research_archives",
                &[],
            )?;
            let count: i64 = row.try_get(0)?;
            let size: i64 = row.try_get(1)?;
            if count >= MAX_ARCHIVES || size + raw.len() as i64 > MAX_TOTAL_BYTES {
                return Err(MemoryError::Capacity);
            }
            let revision = i64::try_from(owner.revision).map_err(|_| MemoryError::InvalidArchive)?;
            tx.execute(
                "INSERT INTO world_private.research_archives
                 (work_id, archive_id, actor_id, work_revision, record_text)
                 VALUES ($1, $2, $3, $4, $5)",
                &[&work, &id, &authority.actor.as_str(), &revision, &raw],
            )?;
            Ok(())
        })
    }

    /// Restore a historical result, not a current claim or current availability.
    /// Source/reviewer grants must be supplied anew. Never expose this internal
    /// output directly to an arbitrary recipient.
    pub fn read_research(
        &mut self,
        authority: &Authority,
        archive_id: &Id,
    ) -> Result<Option<Restored>, MemoryError> {
        self.transact(|kernel, tx| {
            if kernel.owner_view(&authority.actor, &authority.scope).is_none() {
                return Err(Rejection::Denied.into());
            }
            let Some(row) = tx.query_opt(
                "SELECT actor_id, work_revision, record_text FROM world_private.research_archives
                 WHERE work_id = $1 AND archive_id = $2",
                &[&authority.scope.as_str(), &archive_id.as_str()],
            )? else {
                return Ok(None);
            };
            let actor: String = row.try_get(0)?;
            let revision: i64 = row.try_get(1)?;
            let raw: String = row.try_get(2)?;
            let archive = Archive::parse(&raw).map_err(|_| MemoryError::CorruptHistory)?;
            if actor != authority.actor.as_str()
                || archive.goal.work != authority.scope
                || archive.archive_id != *archive_id
                || i64::try_from(archive.goal.work_revision).ok() != Some(revision)
            {
                return Err(MemoryError::CorruptHistory);
            }
            let restored = archive.restore(authority).map_err(archive_error)?;
            Ok(Some(restored))
        })
    }
}
