require("./setup");
const test = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

let userRow;
const queries = [];
const fakePool = {
  query: async (sql, params) => {
    queries.push({ sql, params });
    if (/FROM users WHERE id/.test(sql)) return { rows: userRow ? [userRow] : [] };
    return { rows: [] };
  },
};
const dbPath = require.resolve("../config/db");
require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: fakePool };

const protect = require("../middleware/protect");
const { changePassword } = require("../controllers/authController");

const nowSec = () => Math.floor(Date.now() / 1000);
const tokenIssuedAt = (iat) =>
  jwt.sign({ id: 1, iat }, process.env.JWT_SECRET, { algorithm: "HS256", expiresIn: "1h" });
const reqWith = (token) => ({ headers: { authorization: `Bearer ${token}` } });
const baseUser = { id: 1, email: "a@b.co", full_name: "A", role: "admin", is_active: true };

test.beforeEach(() => { queries.length = 0; });

test("a token issued before the password change is rejected", async () => {
  userRow = { ...baseUser, password_changed_at: new Date((nowSec() - 10) * 1000) };
  await assert.rejects(
    protect(reqWith(tokenIssuedAt(nowSec() - 60)), {}, () => {}),
    /Password was changed/,
  );
});

test("a token issued after the change (or with no change on record) passes", async () => {
  for (const changedAt of [new Date((nowSec() - 60) * 1000), null]) {
    userRow = { ...baseUser, password_changed_at: changedAt };
    const req = reqWith(tokenIssuedAt(nowSec() - 10));
    let called = false;
    await protect(req, {}, () => { called = true; });
    assert.ok(called);
    assert.equal(req.user.id, 1);
    assert.ok(!("password_changed_at" in req.user), "internal field is not exposed on req.user");
  }
});

test("a token issued in the same second as the change still passes", async () => {
  const t = nowSec();
  userRow = { ...baseUser, password_changed_at: new Date(t * 1000 + 700) };
  let called = false;
  await protect(reqWith(tokenIssuedAt(t)), {}, () => { called = true; });
  assert.ok(called);
});

test("changePassword stamps the change and returns a token that survives it", async () => {
  const hash = bcrypt.hashSync("old-password-1", 4);
  userRow = { ...baseUser, password_hash: hash, password_changed_at: null };
  const res = {
    statusCode: null,
    status(c) { this.statusCode = c; return this; },
    json(b) { this.body = b; return this; },
  };
  await changePassword(
    {
      user: { id: 1, email: "a@b.co", full_name: "A", role: "admin" },
      body: { currentPassword: "old-password-1", newPassword: "new-password-2" },
    },
    res,
  );

  assert.equal(res.statusCode, 200);
  const update = queries.find((q) => /SET password_hash/.test(q.sql));
  assert.match(update.sql, /password_changed_at = \$2/);
  const changedAt = update.params[1];
  assert.ok(changedAt instanceof Date);

  // The fresh token must pass protect against the stamp just written...
  userRow = { ...baseUser, password_changed_at: changedAt };
  let called = false;
  await protect(reqWith(res.body.data.token), {}, () => { called = true; });
  assert.ok(called, "new token accepted");
  // ...while one issued a minute earlier does not
  await assert.rejects(
    protect(reqWith(tokenIssuedAt(nowSec() - 60)), {}, () => {}),
    /Password was changed/,
  );
});

test("a wrong current password does not stamp anything", async () => {
  userRow = { ...baseUser, password_hash: bcrypt.hashSync("right-password", 4) };
  await assert.rejects(
    changePassword(
      { user: baseUser, body: { currentPassword: "wrong", newPassword: "new-password-2" } },
      {},
    ),
    /Current password is incorrect/,
  );
  assert.ok(!queries.some((q) => /SET password_hash/.test(q.sql)));
});
