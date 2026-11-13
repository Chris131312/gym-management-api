-- members and memberships have UUID ids, but audit_logs.entity_id was INTEGER,
-- so every member/membership audit INSERT failed (and was silently swallowed).
-- utils/auditLog.js works around it by storing the UUID in details.entity_id;
-- once this migration is applied, that workaround can be removed.
ALTER TABLE audit_logs
  ALTER COLUMN entity_id TYPE TEXT USING entity_id::text;
