-- Tokens issued before a password change must stop working (a stolen token
-- used to stay valid for its whole 7 days). NULL = never changed, so existing
-- sessions are not affected when this is applied.
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMPTZ;
