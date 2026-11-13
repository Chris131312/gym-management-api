-- Deleting a member used to hard-delete them and, through ON DELETE CASCADE,
-- every membership and check-in (wiping payment history and dashboard revenue).
-- Members are now soft-deleted via deleted_at.
ALTER TABLE members ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- A deleted member must not block re-registering the same email
ALTER TABLE members DROP CONSTRAINT IF EXISTS members_email_key;
CREATE UNIQUE INDEX IF NOT EXISTS members_email_active_key
  ON members (email) WHERE deleted_at IS NULL;
