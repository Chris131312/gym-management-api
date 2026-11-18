require("./setup");
const test = require("node:test");
const assert = require("node:assert/strict");

// Scripted fake pool whose client records every statement of a transaction
const log = [];
let script = [];
const client = {
  query: async (sql, params) => {
    log.push({ sql: String(sql).trim().split(/\s+/).slice(0, 3).join(" "), full: sql, params });
    const next = script.shift();
    if (next instanceof Error) throw next;
    return next || { rows: [], rowCount: 0 };
  },
  release: (err) => log.push({ sql: "RELEASE", err }),
};
const fakePool = { connect: async () => client, query: client.query };
const dbPath = require.resolve("../config/db");
require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: fakePool };

const { deleteMember } = require("../controllers/memberController");
const { deleteMembership, updateMembership, createMembership, getMembershipsByMember } = require("../controllers/membershipController");
const { getCheckinsByMember } = require("../controllers/checkinController");
const { todayInGym, addMonthsToDate } = require("../utils/dates");
const { NotFoundError } = require("../utils/errors");

const res = () => ({
  statusCode: null,
  status(c) { this.statusCode = c; return this; },
  json(b) { this.body = b; return this; },
});
const req = (id) => ({ params: { id }, user: { id: 1, full_name: "Admin" } });
const UUID = "2b1f8a52-5c5e-4a39-9d0f-3f0e5b6c7a11";
const verbs = () => log.map((l) => l.sql.split(" ")[0]);

test.beforeEach(() => { log.length = 0; script = []; });

test("deleteMember soft-deletes and audits inside one transaction", async () => {
  script = [
    { rows: [] }, // BEGIN
    { rows: [{ id: UUID, first_name: "A", last_name: "B", email: "a@b.c", phone_number: "1" }] },
    { rows: [] }, // audit insert
  ];
  const r = res();
  await deleteMember(req(UUID), r);

  assert.equal(r.statusCode, 200);
  assert.deepEqual(verbs(), ["BEGIN", "UPDATE", "INSERT", "COMMIT", "RELEASE"]);
  assert.match(log[1].full, /deleted_at = CURRENT_TIMESTAMP/);
  assert.ok(!log.some((l) => /DELETE FROM members/.test(l.full)));
});

test("deleteMember on a missing/already-deleted member rolls back with 404", async () => {
  script = [{ rows: [] }, { rows: [] }];
  await assert.rejects(deleteMember(req(UUID), res()), NotFoundError);
  assert.deepEqual(verbs(), ["BEGIN", "UPDATE", "ROLLBACK", "RELEASE"]);
});

test("a failing audit insert rolls the delete back", async () => {
  script = [
    { rows: [] },
    { rows: [{ id: "1", plan_name: "P", price: 1, member_id: UUID }] },
    { rows: [] }, // is_active re-sync
    new Error("audit insert failed"),
  ];
  await assert.rejects(deleteMembership(req(UUID), res()), /audit insert failed/);
  assert.deepEqual(verbs(), ["BEGIN", "DELETE", "UPDATE", "INSERT", "ROLLBACK", "RELEASE"]);
});

test("deleteMembership re-syncs the member's is_active in the same transaction", async () => {
  script = [
    { rows: [] },
    { rows: [{ id: "1", plan_name: "P", price: 1, member_id: UUID }] },
    { rows: [] },
    { rows: [] },
  ];
  await deleteMembership(req("1"), res());
  assert.deepEqual(verbs(), ["BEGIN", "DELETE", "UPDATE", "INSERT", "COMMIT", "RELEASE"]);
  assert.match(log[2].full, /UPDATE members\s+SET is_active = EXISTS/);
  assert.equal(log[2].params[0], UUID);
});

test("updateMembership re-syncs is_active and audits atomically", async () => {
  script = [
    { rows: [] },
    { rows: [{ id: "1", plan_name: "P", price: 1, member_id: UUID }] },
    { rows: [] },
    { rows: [] },
  ];
  const r = res();
  await updateMembership(
    { ...req("1"), body: { plan_name: "P", price: 1, start_date: "2026-01-01", end_date: "2027-01-01" } },
    r,
  );
  assert.equal(r.statusCode, 200);
  assert.deepEqual(verbs(), ["BEGIN", "UPDATE", "UPDATE", "INSERT", "COMMIT", "RELEASE"]);
});

test("updateMembership on a missing membership rolls back with 404", async () => {
  script = [{ rows: [] }, { rows: [] }];
  await assert.rejects(
    updateMembership({ ...req("1"), body: { plan_name: "P", price: 1, start_date: "2026-01-01", end_date: "2027-01-01" } }, res()),
    NotFoundError,
  );
  assert.deepEqual(verbs(), ["BEGIN", "UPDATE", "ROLLBACK", "RELEASE"]);
});

test("createMembership takes name, price and dates from the plan, not the client", async () => {
  script = [
    { rows: [] }, // BEGIN
    { rows: [{}] }, // member lock
    { rows: [{ name: "Annual", price: "300.00", duration_months: 12 }] }, // plan
    { rows: [{ id: "m1", plan_name: "Annual", price: "300.00", start_date: "x", end_date: "y" }] }, // insert
    { rows: [] }, // reactivate
    { rows: [] }, // COMMIT handled below
  ];
  const r = res();
  await createMembership(
    {
      user: { id: 1, full_name: "Reception" },
      // a tampered client: free plan, expiry far in the future
      body: { member_id: UUID, plan_id: 7, price: 0, plan_name: "Free", end_date: "2099-01-01" },
    },
    r,
  );

  assert.equal(r.statusCode, 201);
  const planQuery = log.find((l) => /FROM membership_plans/.test(l.full || ""));
  assert.deepEqual(planQuery.params, [7]);
  assert.match(planQuery.full, /is_active = true/);

  const insert = log.find((l) => /INSERT INTO memberships/.test(l.full || ""));
  const today = todayInGym();
  assert.deepEqual(insert.params, [UUID, "Annual", "300.00", today, addMonthsToDate(today, 12)]);
});

test("createMembership rejects an unknown or inactive plan and writes nothing", async () => {
  script = [{ rows: [] }, { rows: [{}] }, { rows: [] }];
  await assert.rejects(
    createMembership({ user: { id: 1, full_name: "R" }, body: { member_id: UUID, plan_id: 99 } }, res()),
    NotFoundError,
  );
  assert.ok(!log.some((l) => /INSERT INTO memberships/.test(l.full || "")));
  assert.deepEqual(verbs(), ["BEGIN", "SELECT", "SELECT", "ROLLBACK", "RELEASE"]);
});

test("a failed ROLLBACK keeps the original error and discards the connection", async () => {
  script = [{ rows: [] }, { rows: [] }, new Error("connection lost")]; // BEGIN, UPDATE (no rows), ROLLBACK fails
  await assert.rejects(deleteMember(req(UUID), res()), NotFoundError);
  const release = log.find((l) => l.sql === "RELEASE");
  assert.match(release.err.message, /connection lost/, "release(err) destroys the client");
});

test("a clean transaction releases the connection back to the pool", async () => {
  script = [{ rows: [] }, { rows: [] }];
  await assert.rejects(deleteMember(req(UUID), res()), NotFoundError);
  assert.equal(log.find((l) => l.sql === "RELEASE").err, undefined);
});

test("membership and check-in history of a missing/deleted member is a 404", async () => {
  for (const handler of [getMembershipsByMember, getCheckinsByMember]) {
    log.length = 0;
    script = [{ rows: [] }]; // member lookup finds nothing
    await assert.rejects(handler({ params: { member_id: UUID } }, res()), NotFoundError);
    assert.match(log[0].full, /FROM members WHERE id = \$1 AND deleted_at IS NULL/);
    assert.equal(log.length, 1, "no history query after the 404");
  }
});

test("editing or deleting a membership of a deleted member finds nothing", async () => {
  script = [{ rows: [] }, { rows: [] }];
  await assert.rejects(deleteMembership(req("1"), res()), NotFoundError);
  assert.match(log[1].full, /member_id IN \(SELECT id FROM members WHERE deleted_at IS NULL\)/);

  log.length = 0;
  script = [{ rows: [] }, { rows: [] }];
  await assert.rejects(
    updateMembership({ ...req("1"), body: { plan_name: "P", price: 1, start_date: "2026-01-01", end_date: "2027-01-01" } }, res()),
    NotFoundError,
  );
  assert.match(log[1].full, /member_id IN \(SELECT id FROM members WHERE deleted_at IS NULL\)/);
});
