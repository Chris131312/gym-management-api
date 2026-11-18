# Gym Management API

Express 5 + PostgreSQL REST API for a gym front desk: members, memberships,
check-ins, staff accounts, plans, audit log and dashboard stats.
The React dashboard lives in `gym-dashboard/`.

## Setup

```bash
npm install
cp .env.example .env        # then fill it in
psql "$DATABASE_URL" -f db/schema.sql   # fresh database only
npm run migrate                          # applies pending db/migrations/*.sql
npm run dev
```

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string (required) |
| `JWT_SECRET` | Signing key, 32+ chars (required; startup fails in production if shorter) |
| `JWT_EXPIRES_IN` | Token lifetime, default `7d` |
| `FRONTEND_URL` | Allowed CORS origin(s), comma-separated |
| `GYM_TIMEZONE` | IANA timezone that defines "today" (default `UTC`) |
| `TRUST_PROXY` | Number of reverse-proxy hops (default `1` in production) |

## Scripts

- `npm run dev` / `npm start`: run the API
- `npm run migrate`: apply pending SQL migrations (tracked in `schema_migrations`)
- `npm test`: unit + HTTP tests (no database required)

## Business rules worth knowing

- A check-in needs an **active member _and_ a membership covering today**
  (`start_date <= today <= end_date`, in `GYM_TIMEZONE`).
- Only admins can edit/delete memberships, delete members and plans, and manage staff.
- Deleting a member is a **soft delete** (`deleted_at`): their memberships and
  check-ins are kept, so payment history and revenue stay intact. Their email
  can be registered again.
- Deletes and their audit-log entry share one transaction: if the audit insert
  fails, the delete is rolled back.
- Failed logins are rate limited (10 per 15 min per IP); failed
  change-password attempts, 5 per 15 min per user.
- **Selling a membership** (`POST /api/memberships`) takes only `member_id` and
  `plan_id`. Name, price and dates come from the active plan (starts today in
  `GYM_TIMEZONE`, ends `duration_months` later), so a client can't set its own
  price or expiry. Admins adjust an existing membership with `PUT`.
- Changing a password **revokes every token issued before it** (the response
  includes a fresh token for the current session). Requires migration 004.
- CI (`.github/workflows/ci.yml`) runs the backend tests and the frontend
  lint + build, plus `npm audit` on production dependencies, on every push and PR.

## Endpoints

All routes except `/api/health` and `POST /api/auth/login` need
`Authorization: Bearer <token>`. IDs of members, memberships and check-ins are
UUIDs; users and plans use integers.

`/api/auth` · `/api/members` · `/api/memberships` · `/api/checkins` ·
`/api/dashboard` · `/api/audit-logs` · `/api/settings`
