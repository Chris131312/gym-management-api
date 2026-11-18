require("./setup");
const test = require("node:test");
const assert = require("node:assert/strict");
const app = require("../app");

let server;
let base;

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, "127.0.0.1", resolve);
  });
  base = `http://127.0.0.1:${server.address().port}`;
});

test.after(() => server.close());

test("health check responds and helmet headers are set", async () => {
  const res = await fetch(`${base}/api/health`);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("x-content-type-options"), "nosniff");
  assert.equal((await res.json()).success, true);
});

test("unknown routes return a JSON 404", async () => {
  const res = await fetch(`${base}/api/nope`);
  assert.equal(res.status, 404);
  assert.equal((await res.json()).success, false);
});

test("protected routes require a token (no DB needed)", async () => {
  for (const path of ["/api/members", "/api/memberships/x", "/api/checkins", "/api/dashboard/stats"]) {
    const res = await fetch(`${base}${path}`);
    assert.equal(res.status, 401, path);
  }
});

test("login validates its body before touching the DB", async () => {
  const res = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "not-an-email" }),
  });
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.equal(body.message, "Validation failed");
  assert.ok(body.details.length >= 1);
});

test("malformed JSON is a 400, not a 500", async () => {
  const res = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{bad",
  });
  assert.equal(res.status, 400);
  assert.equal((await res.json()).message, "Request body is not valid JSON");
});

test("oversized bodies are a 413, not a 500", async () => {
  const res = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "a@b.co", password: "x".repeat(200_000) }),
  });
  assert.equal(res.status, 413);
});

test("tokens signed with a different JWT algorithm are rejected", async () => {
  const jwt = require("jsonwebtoken");
  const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET, { algorithm: "HS512" });
  const res = await fetch(`${base}/api/members`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(res.status, 401);
  assert.match((await res.json()).message, /Invalid token/);
});

test("malformed percent-encoding in a path is a 400, not a 500", async () => {
  const res = await fetch(`${base}/api/members/%E0%A4%A`);
  assert.equal(res.status, 400);
  assert.equal((await res.json()).success, false);
});

test("bad Content-Encoding is a client error (415 unknown, 400 corrupt), not a 500", async () => {
  const post = (encoding) =>
    fetch(`${base}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Content-Encoding": encoding },
      body: "{}",
    });
  assert.equal((await post("foo")).status, 415);
  assert.equal((await post("br")).status, 400); // supported, but "{}" isn't valid brotli
});

test("readiness reports 503 when the database is unreachable (liveness stays 200)", async () => {
  const ready = await fetch(`${base}/api/health/ready`);
  assert.equal(ready.status, 503);
  assert.equal((await ready.json()).database, "down");
  assert.equal((await fetch(`${base}/api/health`)).status, 200);
});

test("the pool is configured with connection and statement timeouts", () => {
  const pool = require("../config/db");
  assert.equal(pool.options.connectionTimeoutMillis, 5000);
  assert.equal(pool.options.statement_timeout, 15000);
});

// Keep last: exhausts the shared per-IP budget
test("login is rate limited after repeated failures", async () => {
  let last;
  for (let i = 0; i < 12; i++) {
    last = await fetch(`${base}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
  }
  assert.equal(last.status, 429);
});
