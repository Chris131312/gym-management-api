const pool = require("../config/db");
const { logAction } = require("../utils/auditLog");
const { NotFoundError } = require("../utils/errors");
const { parsePagination, escapeLike } = require("../utils/pagination");

const createMember = async (req, res) => {
  const { first_name, last_name, email, phone_number, is_active } = req.body;

  const newMember = await pool.query(
    "INSERT INTO members (first_name, last_name, email, phone_number, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [first_name, last_name, email, phone_number, is_active],
  );

  await logAction({
    userId: req.user.id,
    userName: req.user.full_name,
    action: "create",
    entityType: "member",
    entityId: newMember.rows[0].id,
    entityLabel: `${first_name} ${last_name}`,
    details: { email },
  });

  res.status(201).json({
    success: true,
    message: "Member registered successfully!",
    data: newMember.rows[0],
  });
};

const getMembers = async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query, {
    defaultLimit: 10,
    maxLimit: 100,
  });
  const search = typeof req.query.search === "string" ? req.query.search : "";
  const status = req.query.status || "all";

  const conditions = [];
  const params = [];
  let paramCount = 0;

  if (search.trim()) {
    paramCount++;
    conditions.push(`(
      first_name ILIKE $${paramCount}
      OR last_name ILIKE $${paramCount}
      OR email ILIKE $${paramCount}
      OR CONCAT(first_name, ' ', last_name) ILIKE $${paramCount}
    )`);
    params.push(`%${escapeLike(search.trim())}%`);
  }

  if (status === "active") {
    conditions.push("is_active = true");
  } else if (status === "inactive") {
    conditions.push("is_active = false");
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM members ${whereClause}`,
    params,
  );
  const totalMembers = parseInt(countResult.rows[0].count);

  const allMembers = await pool.query(
    `SELECT * FROM members ${whereClause} ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
    [...params, limit, offset],
  );

  res.status(200).json({
    success: true,
    limit,
    page,
    totalMembers,
    totalPages: Math.ceil(totalMembers / limit),
    data: allMembers.rows,
  });
};

const getMemberById = async (req, res) => {
  const { id } = req.params;
  const result = await pool.query("SELECT * FROM members WHERE id = $1", [id]);

  if (result.rows.length === 0) {
    throw new NotFoundError("Member");
  }

  res.status(200).json({
    success: true,
    data: result.rows[0],
  });
};

const updateMember = async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email, phone_number, is_active } = req.body;

  // COALESCE: the schema is partial, so omitted fields must keep their value
  const updatedMember = await pool.query(
    `UPDATE members
     SET first_name = COALESCE($1, first_name),
         last_name = COALESCE($2, last_name),
         email = COALESCE($3, email),
         phone_number = COALESCE($4, phone_number),
         is_active = COALESCE($5, is_active),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $6
     RETURNING *`,
    [first_name, last_name, email, phone_number, is_active, id],
  );

  if (updatedMember.rows.length === 0) {
    throw new NotFoundError("Member");
  }

  const member = updatedMember.rows[0];

  await logAction({
    userId: req.user.id,
    userName: req.user.full_name,
    action: "update",
    entityType: "member",
    entityId: member.id,
    entityLabel: `${member.first_name} ${member.last_name}`,
    details: { fields: Object.keys(req.body) },
  });

  res.status(200).json({
    success: true,
    message: "Member updated successfully!",
    data: member,
  });
};

const deleteMember = async (req, res) => {
  const { id } = req.params;

  const deletedMember = await pool.query(
    "DELETE FROM members WHERE id = $1 RETURNING *",
    [id],
  );

  if (deletedMember.rows.length === 0) {
    throw new NotFoundError("Member");
  }

  const member = deletedMember.rows[0];

  await logAction({
    userId: req.user.id,
    userName: req.user.full_name,
    action: "delete",
    entityType: "member",
    entityId: member.id,
    entityLabel: `${member.first_name} ${member.last_name}`,
    details: { email: member.email, phone: member.phone_number },
  });

  res.status(200).json({
    success: true,
    message: "Member deleted successfully!",
    data: member,
  });
};

module.exports = {
  createMember,
  getMembers,
  getMemberById,
  updateMember,
  deleteMember,
};
