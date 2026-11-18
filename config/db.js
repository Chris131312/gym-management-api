const { Pool, types } = require("pg");
require("dotenv").config();

// Return DATE columns as plain "YYYY-MM-DD" strings. The default parser builds
// a JS Date at server-local midnight, which shifts the day once serialized to
// UTC JSON and read in a different timezone.
types.setTypeParser(types.builtins.DATE, (value) => value);

// DATABASE_URL presence is enforced by config/validateEnv.js at startup
// Without timeouts a hung database leaves every request waiting forever and
// the pool exhausted; failing fast turns that into a clean 500/503.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: Number(process.env.DB_CONNECT_TIMEOUT_MS) || 5_000,
  statement_timeout: Number(process.env.DB_STATEMENT_TIMEOUT_MS) || 15_000,
});

// pg discards the broken idle client and the pool keeps working, so just log:
// a transient network blip shouldn't take the whole API down.
pool.on("error", (err) => {
  console.error("Unexpected database error on idle client:", err.message);
});

module.exports = pool;
