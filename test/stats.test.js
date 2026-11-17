require("./setup");
const test = require("node:test");
const assert = require("node:assert/strict");

const queries = [];
const fakePool = {
  query: async (sql, params) => {
    queries.push({ sql, params });
    return { rows: [{ count: "5", sum: "100" }] };
  },
};
const dbPath = require.resolve("../config/db");
require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: fakePool };

const { getStats } = require("../controllers/dashboardController");
const { hasValidMembership } = require("../utils/memberships");

test("activeMembers counts members with a valid membership, not just the flag", async () => {
  const res = {
    status() { return this; },
    json(b) { this.body = b; return this; },
  };
  await getStats({}, res);

  const active = queries.find((q) => /is_active = true/.test(q.sql));
  assert.ok(active, "active members query ran");
  assert.match(active.sql, /EXISTS \(\s*SELECT 1 FROM memberships/);
  assert.match(active.sql, /ms\.start_date <= \$1::date/);
  assert.match(active.sql, /ms\.end_date >= \$1::date/);
  assert.match(active.params[0], /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(res.body.data.activeMembers, 5);
});

test("hasValidMembership can ignore start_date (used for is_active upkeep)", () => {
  assert.ok(!/start_date/.test(hasValidMembership("m.id", "$1", { requireStarted: false })));
  assert.match(hasValidMembership("m.id", "$1"), /start_date/);
});
