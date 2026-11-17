require("./setup");
const test = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const express = require("express");
const { changePasswordLimiter } = require("../middleware/rateLimiters");

test("change-password limiter counts failed attempts per user, not per IP", async () => {
  const app = express();
  // Stand-in for protect: the user comes from the header
  app.use((req, res, next) => {
    req.user = { id: Number(req.headers["x-user"]) };
    next();
  });
  app.put("/pw", changePasswordLimiter, (req, res) =>
    res.status(req.headers["x-ok"] ? 200 : 400).json({}),
  );
  const server = await new Promise((r) => {
    const s = app.listen(0, "127.0.0.1", () => r(s));
  });
  const hit = (user, ok) =>
    fetch(`http://127.0.0.1:${server.address().port}/pw`, {
      method: "PUT",
      headers: { "x-user": String(user), ...(ok && { "x-ok": "1" }) },
    });

  try {
    for (let i = 0; i < 5; i++) assert.equal((await hit(1)).status, 400);
    assert.equal((await hit(1)).status, 429, "6th failure is blocked");
    assert.equal((await hit(2)).status, 400, "another user is unaffected");
    for (let i = 0; i < 3; i++) assert.equal((await hit(3, true)).status, 200);
    for (let i = 0; i < 5; i++) await hit(3);
    assert.equal((await hit(3)).status, 429);
  } finally {
    server.close();
  }
});

const runValidateEnv = (env) =>
  spawnSync(process.execPath, ["-e", 'require("./config/validateEnv")()'], {
    cwd: require("node:path").join(__dirname, ".."),
    env: { PATH: process.env.PATH, DATABASE_URL: "postgresql://x", ...env },
    encoding: "utf8",
  });

test("a short JWT_SECRET aborts startup in production but only warns elsewhere", () => {
  const prod = runValidateEnv({ JWT_SECRET: "short", NODE_ENV: "production" });
  assert.equal(prod.status, 1);
  assert.match(prod.stderr, /at least 32 characters in production/);

  const dev = runValidateEnv({ JWT_SECRET: "short", NODE_ENV: "development" });
  assert.equal(dev.status, 0);
  assert.match(dev.stderr, /WARNING/);

  const strong = runValidateEnv({ JWT_SECRET: "x".repeat(40), NODE_ENV: "production" });
  assert.equal(strong.status, 0);
});
