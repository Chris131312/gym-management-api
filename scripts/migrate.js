// Applies db/migrations/*.sql in order, each in its own transaction, and
// records them in schema_migrations so reruns skip what's already applied.
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const pool = require("../config/db");

const dir = path.join(__dirname, "..", "db", "migrations");

(async () => {
  await pool.query(
    `CREATE TABLE IF NOT EXISTS schema_migrations (
       filename TEXT PRIMARY KEY,
       applied_at TIMESTAMPTZ DEFAULT now()
     )`,
  );
  const done = new Set(
    (await pool.query("SELECT filename FROM schema_migrations")).rows.map(
      (r) => r.filename,
    ),
  );

  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
    if (done.has(file)) {
      console.log(`skip     ${file}`);
      continue;
    }
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(fs.readFileSync(path.join(dir, file), "utf8"));
      await client.query("INSERT INTO schema_migrations (filename) VALUES ($1)", [file]);
      await client.query("COMMIT");
      console.log(`applied  ${file}`);
    } catch (error) {
      await client.query("ROLLBACK");
      console.error(`FAILED   ${file}: ${error.message}`);
      process.exitCode = 1;
      break;
    } finally {
      client.release();
    }
  }
  await pool.end();
})();
