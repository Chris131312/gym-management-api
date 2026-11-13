require("./setup");
const test = require("node:test");
const assert = require("node:assert/strict");

// Replace the pg pool with a scripted fake before the controller loads it
const calls = [];
let responses = [];
const fakePool = {
  query: async (sql, params) => {
    calls.push({ sql, params });
    return responses.shift();
  },
};
const dbPath = require.resolve("../config/db");
require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: fakePool };

const { registerCheckin } = require("../controllers/checkinController");
const { ForbiddenError, NotFoundError } = require("../utils/errors");

const makeRes = () => ({
  statusCode: null,
  status(c) { this.statusCode = c; return this; },
  json(b) { this.body = b; return this; },
});

const MEMBER = "2b1f8a52-5c5e-4a39-9d0f-3f0e5b6c7a11";

test.beforeEach(() => {
  calls.length = 0;
  responses = [];
});

test("unknown member -> NotFound", async () => {
  responses = [{ rows: [] }];
  await assert.rejects(
    registerCheckin({ body: { member_id: MEMBER } }, makeRes()),
    NotFoundError,
  );
});

test("inactive member is denied", async () => {
  responses = [{ rows: [{ id: MEMBER, is_active: false }] }];
  await assert.rejects(
    registerCheckin({ body: { member_id: MEMBER } }, makeRes()),
    ForbiddenError,
  );
});

test("active member with expired/missing membership is denied and NOT checked in", async () => {
  responses = [{ rows: [{ id: MEMBER, is_active: true }] }, { rows: [] }];
  await assert.rejects(
    registerCheckin({ body: { member_id: MEMBER } }, makeRes()),
    /Membership expired or not found/,
  );
  assert.equal(calls.length, 2);
  assert.ok(!calls.some((c) => /INSERT INTO check_ins/.test(c.sql)));
});

test("active member with a valid membership is checked in", async () => {
  responses = [
    { rows: [{ id: MEMBER, is_active: true }] },
    { rows: [{ "?column?": 1 }] },
    { rows: [{ id: "c1", member_id: MEMBER }] },
  ];
  const res = makeRes();
  await registerCheckin({ body: { member_id: MEMBER } }, res);
  assert.equal(res.statusCode, 201);
  assert.ok(calls[2].sql.includes("INSERT INTO check_ins"));
  // membership lookup is bound to today's gym date
  assert.match(calls[1].params[1], /^\d{4}-\d{2}-\d{2}$/);
});
