-- Baseline schema, reconstructed from the live database (information_schema /
-- pg_constraint / pg_indexes) on 2026-11-13. Apply db/migrations/*.sql after it.
-- Requires PostgreSQL 13+ (gen_random_uuid() is built in).

CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR NOT NULL UNIQUE,
  password_hash VARCHAR NOT NULL,
  full_name     VARCHAR NOT NULL,
  role          VARCHAR NOT NULL CHECK (role IN ('admin', 'receptionist')),
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMP DEFAULT now()
);

CREATE TABLE members (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name          VARCHAR NOT NULL,
  last_name           VARCHAR NOT NULL,
  email               VARCHAR NOT NULL, -- unique among non-deleted members (migration 003)
  phone_number        VARCHAR,
  profile_picture_url TEXT,
  is_active           BOOLEAN DEFAULT false,
  created_at          TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at          TIMESTAMPTZ -- soft delete (migration 003)
);
CREATE UNIQUE INDEX members_email_active_key ON members (email) WHERE deleted_at IS NULL;

CREATE TABLE memberships (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id  UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  plan_name  VARCHAR NOT NULL,
  price      NUMERIC NOT NULL,
  start_date DATE DEFAULT CURRENT_DATE,
  end_date   DATE NOT NULL,
  is_active  BOOLEAN DEFAULT true
);

CREATE TABLE check_ins (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id     UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  check_in_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE membership_plans (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR NOT NULL,
  price           NUMERIC NOT NULL,
  duration_months INTEGER NOT NULL,
  description     VARCHAR,
  is_active       BOOLEAN DEFAULT true,
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMP DEFAULT now()
);

CREATE TABLE gym_settings (
  id         INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  gym_name   VARCHAR NOT NULL DEFAULT 'My Gym',
  address    VARCHAR,
  phone      VARCHAR,
  email      VARCHAR,
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE audit_logs (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER REFERENCES users(id) ON DELETE SET NULL,
  user_name    VARCHAR NOT NULL,
  action       VARCHAR NOT NULL,
  entity_type  VARCHAR NOT NULL,
  entity_id    INTEGER, -- see migrations/002: members/memberships use UUIDs
  entity_label VARCHAR,
  details      JSONB,
  created_at   TIMESTAMP DEFAULT now()
);
