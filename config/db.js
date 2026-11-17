const { Pool, types } = require("pg");
require("dotenv").config();

// Return DATE columns as plain "YYYY-MM-DD" strings. The default parser builds
// a JS Date at server-local midnight, which shifts the day once serialized to
// UTC JSON and read in a different timezone.
types.setTypeParser(types.builtins.DATE, (value) => value);

// DATABASE_URL presence is enforced by config/validateEnv.js at startup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// pg discards the broken idle client and the pool keeps working, so just log:
// a transient network blip shouldn't take the whole API down.
pool.on("error", (err) => {
  console.error("Unexpected database error on idle client:", err.message);
});

module.exports = pool;
