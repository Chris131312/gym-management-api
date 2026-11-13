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
  release: () => log.push({ sql: "RELEASE" }),
};
const fakePool = { connect: async () => client, query: client.query };
const dbPath = require.resolve("../config/db");
require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: fakePool };

const { deleteMember } = require("../controllers/memberController");
const { deleteMembership } = require("../controllers/membershipController");
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
    new Error("audit insert failed"),
  ];
  await assert.rejects(deleteMembership(req(UUID), res()), /audit insert failed/);
  assert.deepEqual(verbs(), ["BEGIN", "DELETE", "INSERT", "ROLLBACK", "RELEASE"]);
});
