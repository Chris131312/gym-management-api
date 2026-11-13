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
