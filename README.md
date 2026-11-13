# Gym Management API

Express 5 + PostgreSQL REST API for a gym front desk: members, memberships,
check-ins, staff accounts, plans, audit log and dashboard stats.
The React dashboard lives in `gym-dashboard/`.

## Setup

```bash
npm install
cp .env.example .env        # then fill it in
psql "$DATABASE_URL" -f db/schema.sql
psql "$DATABASE_URL" -f db/migrations/001_add_indexes.sql
psql "$DATABASE_URL" -f db/migrations/002_audit_entity_id_text.sql
npm run dev
```

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string (required) |
| `JWT_SECRET` | Signing key, 32+ chars (required) |
| `JWT_EXPIRES_IN` | Token lifetime, default `7d` |
| `FRONTEND_URL` | Allowed CORS origin(s), comma-separated |
| `GYM_TIMEZONE` | IANA timezone that defines "today" (default `UTC`) |
| `TRUST_PROXY` | Number of reverse-proxy hops (default `1` in production) |

## Scripts

- `npm run dev` / `npm start`: run the API
- `npm test`: unit + HTTP tests (no database required)

## Business rules worth knowing

- A check-in needs an **active member _and_ a membership covering today**
  (`start_date <= today <= end_date`, in `GYM_TIMEZONE`).
- Only admins can delete members, memberships and plans, and manage staff.
  Deleting a member cascades to their memberships and check-ins.
- Failed logins are rate limited (10 per 15 min per IP).

## Endpoints

All routes except `/api/health` and `POST /api/auth/login` need
`Authorization: Bearer <token>`. IDs of members, memberships and check-ins are
UUIDs; users and plans use integers.

`/api/auth` · `/api/members` · `/api/memberships` · `/api/checkins` ·
`/api/dashboard` · `/api/audit-logs` · `/api/settings`
