const pool = require("../config/db");
const { parsePagination } = require("../utils/pagination");

const getAuditLogs = async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query, {
    defaultLimit: 20,
    maxLimit: 100,
  });
  const entityType =
    typeof req.query.entityType === "string" ? req.query.entityType : "all";

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
