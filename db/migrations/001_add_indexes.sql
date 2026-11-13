-- The original schema only had primary-key and unique indexes, so every
-- check-in lookup, dashboard chart and audit page was a sequential scan.
CREATE INDEX IF NOT EXISTS idx_check_ins_member_time
  ON check_ins (member_id, check_in_time DESC);
CREATE INDEX IF NOT EXISTS idx_check_ins_time
  ON check_ins (check_in_time);
CREATE INDEX IF NOT EXISTS idx_memberships_member_end
  ON memberships (member_id, end_date DESC);
CREATE INDEX IF NOT EXISTS idx_memberships_start
  ON memberships (start_date);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created
  ON audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type
  ON audit_logs (entity_type);
