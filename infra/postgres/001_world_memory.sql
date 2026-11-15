-- Isolated synthetic environment only. Run once as a migration owner.
-- The operator must provision the non-owner world_runtime role first.
BEGIN;
CREATE SCHEMA world_private;
REVOKE ALL ON SCHEMA world_private FROM PUBLIC;

CREATE TABLE world_private.principals (
    principal_id text PRIMARY KEY
        CHECK (principal_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')
);
CREATE TABLE world_private.stream_head (
    singleton boolean PRIMARY KEY CHECK (singleton),
    last_seq bigint NOT NULL CHECK (last_seq BETWEEN 0 AND 9007199254740991)
);
INSERT INTO world_private.stream_head VALUES (true, 0);

CREATE TABLE world_private.events (
    seq bigint PRIMARY KEY CHECK (seq > 0),
    actor_id text NOT NULL REFERENCES world_private.principals(principal_id),
    command_id text NOT NULL CHECK (command_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'),
    work_id text NOT NULL CHECK (work_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'),
    revision bigint NOT NULL CHECK (revision BETWEEN 1 AND 9007199254740991),
    record_text text NOT NULL CHECK (octet_length(record_text) BETWEEN 1 AND 263168),
    UNIQUE (actor_id, command_id),
    UNIQUE (work_id, revision)
);

REVOKE ALL ON ALL TABLES IN SCHEMA world_private FROM PUBLIC;
GRANT USAGE ON SCHEMA world_private TO world_runtime;
GRANT SELECT ON world_private.principals TO world_runtime;
GRANT SELECT, UPDATE(last_seq) ON world_private.stream_head TO world_runtime;
GRANT SELECT, INSERT ON world_private.events TO world_runtime;
COMMIT;
