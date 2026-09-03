const pool = require("../config/db");

const logAction = async ({
  userId,
  userName,
  action,
  entityType,
  entityId,
  entityLabel,
  details = null,
}) => {
  try {
    await pool.query(
      `INSERT INTO audit_logs
        (user_id, user_name, action, entity_type, entity_id, entity_label, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [userId, userName, action, entityType, entityId, entityLabel, details],
    );
  } catch (error) {
    // Never let audit logging crash the main operation
    console.error("Failed to write audit log:", error.message);
  }
};

module.exports = { logAction };
