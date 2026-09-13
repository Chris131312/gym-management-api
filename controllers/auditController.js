const pool = require("../config/db");

const getAuditLogs = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  const entityType = req.query.entityType || "all";

  const conditions = [];
  const params = [];
  let paramCount = 0;

  if (entityType !== "all") {
    paramCount++;
    conditions.push(`entity_type = $${paramCount}`);
    params.push(entityType);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM audit_logs ${whereClause}`,
    params,
  );
  const totalLogs = parseInt(countResult.rows[0].count);

  const logsResult = await pool.query(
    `SELECT * FROM audit_logs ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
    [...params, limit, offset],
  );

  res.status(200).json({
    success: true,
    page,
    limit,
    totalLogs,
    totalPages: Math.ceil(totalLogs / limit),
    data: logsResult.rows,
  });
};

module.exports = { getAuditLogs };
