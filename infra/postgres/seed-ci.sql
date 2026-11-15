-- Ephemeral CI identities and role. Never run on an existing or production DB.
INSERT INTO world_private.principals VALUES
('00000000-0000-4000-8000-000000000001'),
('00000000-0000-4000-8000-000000000002'),
('00000000-0000-4000-8000-000000000003');
