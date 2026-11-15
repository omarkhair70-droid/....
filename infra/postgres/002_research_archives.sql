-- Isolated synthetic environment only. Apply as migration owner after 001.
BEGIN;
CREATE TABLE world_private.research_archives (
    work_id text NOT NULL,
    archive_id text NOT NULL CHECK (archive_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'),
    actor_id text NOT NULL REFERENCES world_private.principals(principal_id),
    work_revision bigint NOT NULL,
    record_text text NOT NULL CHECK (octet_length(record_text) BETWEEN 1 AND 4194304),
    PRIMARY KEY (work_id, archive_id),
    FOREIGN KEY (work_id, work_revision) REFERENCES world_private.events(work_id, revision)
);
REVOKE ALL ON world_private.research_archives FROM PUBLIC;
GRANT SELECT, INSERT ON world_private.research_archives TO world_runtime;
COMMIT;
