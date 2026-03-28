const { Pool } = require("pg");

require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("connect", () => {
  console.log("Successfully connected to the PostgreSQL database.");
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client.", err);
});

module.exports = pool;
