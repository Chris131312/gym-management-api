const pool = require("../config/db");
const { NotFoundError } = require("../utils/errors");
const { logAction } = require("../utils/auditLog");

// ─── Gym Info ────────────────────────────────────────────

const getGymSettings = async (req, res) => {
  const result = await pool.query("SELECT * FROM gym_settings WHERE id = 1");

  res.status(200).json({
    success: true,
    data: result.rows[0],
  });
};

const updateGymSettings = async (req, res) => {
  const { gym_name, address, phone, email } = req.body;

  const result = await pool.query(
    `UPDATE gym_settings
     SET gym_name = COALESCE($1, gym_name),
         address = COALESCE($2, address),
         phone = COALESCE($3, phone),
         email = COALESCE($4, email),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = 1
     RETURNING *`,
    [gym_name, address, phone, email],
  );

  await logAction({
    userId: req.user.id,
    userName: req.user.full_name,
    action: "update",
    entityType: "settings",
    entityId: 1,
    entityLabel: "Gym Information",
    details: req.body,
  });

  res.status(200).json({
    success: true,
    message: "Gym settings updated successfully",
    data: result.rows[0],
  });
};

// ─── Membership Plans ────────────────────────────────────

const getPlans = async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM membership_plans WHERE is_active = true ORDER BY sort_order ASC",
  );

  res.status(200).json({
    success: true,
    data: result.rows,
  });
};

const getAllPlans = async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM membership_plans ORDER BY sort_order ASC",
  );

  res.status(200).json({
    success: true,
    data: result.rows,
  });
};

const createPlan = async (req, res) => {
  const { name, price, duration_months, description, sort_order } = req.body;

  const result = await pool.query(
    `INSERT INTO membership_plans (name, price, duration_months, description, sort_order)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [name, price, duration_months, description, sort_order || 0],
  );

  const plan = result.rows[0];

  await logAction({
    userId: req.user.id,
    userName: req.user.full_name,
    action: "create",
    entityType: "plan",
    entityId: plan.id,
    entityLabel: plan.name,
    details: { price: plan.price, duration_months: plan.duration_months },
  });

  res.status(201).json({
    success: true,
    message: "Plan created successfully",
    data: plan,
  });
};

const updatePlan = async (req, res) => {
  const { id } = req.params;
  const { name, price, duration_months, description, is_active, sort_order } =
    req.body;

  const result = await pool.query(
    `UPDATE membership_plans
     SET name = COALESCE($1, name),
         price = COALESCE($2, price),
         duration_months = COALESCE($3, duration_months),
         description = COALESCE($4, description),
         is_active = COALESCE($5, is_active),
         sort_order = COALESCE($6, sort_order)
     WHERE id = $7
     RETURNING *`,
    [name, price, duration_months, description, is_active, sort_order, id],
  );

  if (result.rows.length === 0) {
    throw new NotFoundError("Plan");
  }

  const plan = result.rows[0];

  await logAction({
    userId: req.user.id,
    userName: req.user.full_name,
    action: "update",
    entityType: "plan",
    entityId: plan.id,
    entityLabel: plan.name,
    details: { price: plan.price },
  });

  res.status(200).json({
    success: true,
    message: "Plan updated successfully",
    data: plan,
  });
};

const deletePlan = async (req, res) => {
  const { id } = req.params;

  const result = await pool.query(
    "DELETE FROM membership_plans WHERE id = $1 RETURNING *",
    [id],
  );

  if (result.rows.length === 0) {
    throw new NotFoundError("Plan");
  }

  const plan = result.rows[0];

  await logAction({
    userId: req.user.id,
    userName: req.user.full_name,
    action: "delete",
    entityType: "plan",
    entityId: plan.id,
    entityLabel: plan.name,
    details: { price: plan.price },
  });

  res.status(200).json({
    success: true,
    message: "Plan deleted successfully",
    data: plan,
  });
};

module.exports = {
  getGymSettings,
  updateGymSettings,
  getPlans,
  getAllPlans,
  createPlan,
  updatePlan,
  deletePlan,
};
