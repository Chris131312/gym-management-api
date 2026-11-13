const { Pool } = require("pg");
require("dotenv").config();

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
