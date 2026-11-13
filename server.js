require("dotenv").config();

const validateEnv = require("./config/validateEnv");
validateEnv();

const pool = require("./config/db");
const app = require("./app");

const PORT = process.env.PORT || 3000;

pool.query("SELECT NOW()", (err) => {
  if (err) {
    console.error("Error connecting to the database:", err.message);
    process.exit(1);
  }
  console.log("Successfully connected to the PostgreSQL database.");
});

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

const shutdown = (signal) => {
  console.log(`${signal} received, shutting down gracefully...`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
  // Don't hang forever on stuck connections
  setTimeout(() => process.exit(1), 10_000).unref();
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
