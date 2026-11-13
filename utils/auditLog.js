const pool = require("../config/db");

// With a transaction `client`, the insert is part of that transaction and a
// failure propagates (rolling the whole operation back). Without one it is
// best-effort: an audit failure never breaks the main operation.
const logAction = async (
  { userId, userName, action, entityType, entityId, entityLabel, details = null },
  client = null,
) => {
  // audit_logs.entity_id is an integer column, but members/memberships use UUIDs.
  // Until db/migrations/002 is applied, keep non-integer ids in `details` instead
  // of letting the INSERT fail (and the log be silently lost).
  const idIsInteger = Number.isInteger(entityId);
  const storedId = idIsInteger ? entityId : null;
  const storedDetails =
    idIsInteger || entityId == null
      ? details
      : { ...(details || {}), entity_id: entityId };

  const db = client || pool;

  try {
    await db.query(
      `INSERT INTO audit_logs
        (user_id, user_name, action, entity_type, entity_id, entity_label, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        userId,
        userName,
        action,
        entityType,
        storedId,
        entityLabel,
        storedDetails,
      ],
    );
  } catch (error) {
    if (client) throw error;
    console.error("Failed to write audit log:", error.message);
  }
};

module.exports = { logAction };
