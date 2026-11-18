const pool = require("../config/db");

const withTransaction = async (fn) => {
  const client = await pool.connect();
  let brokenConnection;
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      // Keep the original error; just make sure the dead connection is dropped
      console.error("ROLLBACK failed:", rollbackError.message);
      brokenConnection = rollbackError;
    }
    throw error;
  } finally {
    // release(err) destroys the client instead of returning it to the pool
    client.release(brokenConnection);
  }
};

module.exports = { withTransaction };
