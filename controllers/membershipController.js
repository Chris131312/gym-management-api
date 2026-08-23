const pool = require("../config/db");
const { NotFoundError } = require("../utils/errors");

const getMembershipsByMember = async (req, res) => {
  const { member_id } = req.params;

  const result = await pool.query(
    "SELECT * FROM memberships WHERE member_id = $1 ORDER BY end_date DESC",
    [member_id],
  );

  res.status(200).json(result.rows);
};

const createMembership = async (req, res) => {
  const { member_id, plan_name, price, start_date, end_date } = req.body;

  const result = await pool.query(
    `INSERT INTO memberships (member_id, plan_name, price, start_date, end_date)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [member_id, plan_name, price, start_date, end_date],
  );

  await pool.query("UPDATE members SET is_active = true WHERE id = $1", [
    member_id,
  ]);

  res.status(201).json({
    success: true,
    message: "Membership added successfully",
    data: result.rows[0],
  });
};

const updateMembership = async (req, res) => {
  const { id } = req.params;
  const { plan_name, price, start_date, end_date } = req.body;

  const result = await pool.query(
    `UPDATE memberships SET plan_name = $1, price = $2, start_date = $3, end_date = $4
     WHERE id = $5 RETURNING *`,
    [plan_name, price, start_date, end_date, id],
  );

  if (result.rows.length === 0) {
    throw new NotFoundError("Membership");
  }

  res.status(200).json({
    success: true,
    message: "Membership updated successfully",
    data: result.rows[0],
  });
};

const deleteMembership = async (req, res) => {
  const { id } = req.params;

  const result = await pool.query(
    "DELETE FROM memberships WHERE id = $1 RETURNING *",
    [id],
  );

  if (result.rows.length === 0) {
    throw new NotFoundError("Membership");
  }

  res.status(200).json({
    success: true,
    message: "Membership deleted successfully",
    data: result.rows[0],
  });
};

module.exports = {
  getMembershipsByMember,
  createMembership,
  updateMembership,
  deleteMembership,
};
