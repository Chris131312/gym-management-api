const pool = require("../config/db");
const { NotFoundError } = require("../utils/errors");
const { logAction } = require("../utils/auditLog");
const { withTransaction } = require("../utils/transaction");
const { todayInGym, addMonthsToDate } = require("../utils/dates");
const { syncMemberActive } = require("../utils/memberships");

const getMembershipsByMember = async (req, res) => {
  const { member_id } = req.params;

  const result = await pool.query(
    "SELECT * FROM memberships WHERE member_id = $1 ORDER BY end_date DESC",
    [member_id],
  );

  res.status(200).json(result.rows);
};

const createMembership = async (req, res) => {
  const { member_id, plan_id } = req.body;

  // Insert + reactivate must succeed or fail together
  const membership = await withTransaction(async (client) => {
    const member = await client.query(
      "SELECT 1 FROM members WHERE id = $1 AND deleted_at IS NULL FOR UPDATE",
      [member_id],
    );
    if (member.rows.length === 0) {
      throw new NotFoundError("Member");
    }

    // Name, price and duration come from the plan, never from the client
    const planResult = await client.query(
      `SELECT name, price, duration_months FROM membership_plans
       WHERE id = $1 AND is_active = true`,
      [plan_id],
    );
    if (planResult.rows.length === 0) {
      throw new NotFoundError("Plan");
    }
    const plan = planResult.rows[0];

    const startDate = todayInGym();
    const endDate = addMonthsToDate(startDate, plan.duration_months);

    const result = await client.query(
      `INSERT INTO memberships (member_id, plan_name, price, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [member_id, plan.name, plan.price, startDate, endDate],
    );

    // The new plan is valid from today, so the member can check in now
    await client.query("UPDATE members SET is_active = true WHERE id = $1", [
      member_id,
    ]);

    return result.rows[0];
  });

  await logAction({
    userId: req.user.id,
    userName: req.user.full_name,
    action: "create",
    entityType: "membership",
    entityId: membership.id,
    entityLabel: membership.plan_name,
    details: {
      plan_id,
      price: parseFloat(membership.price),
      member_id,
      start_date: membership.start_date,
      end_date: membership.end_date,
    },
  });

  res.status(201).json({
    success: true,
    message: "Membership added successfully",
    data: membership,
  });
};

const updateMembership = async (req, res) => {
  const { id } = req.params;
  const { plan_name, price, start_date, end_date } = req.body;

  // Update, is_active re-sync and audit succeed or fail together
  const membership = await withTransaction(async (client) => {
    const result = await client.query(
      `UPDATE memberships SET plan_name = $1, price = $2, start_date = $3, end_date = $4
       WHERE id = $5 RETURNING *`,
      [plan_name, price, start_date, end_date, id],
    );

    if (result.rows.length === 0) {
      throw new NotFoundError("Membership");
    }

    const updated = result.rows[0];

    await syncMemberActive(client, updated.member_id, todayInGym());

    await logAction(
      {
        userId: req.user.id,
        userName: req.user.full_name,
        action: "update",
        entityType: "membership",
        entityId: updated.id,
        entityLabel: updated.plan_name,
        details: { price, member_id: updated.member_id, start_date, end_date },
      },
      client,
    );

    return updated;
  });

  res.status(200).json({
    success: true,
    message: "Membership updated successfully",
    data: membership,
  });
};

const deleteMembership = async (req, res) => {
  const { id } = req.params;

  const membership = await withTransaction(async (client) => {
    const result = await client.query(
      "DELETE FROM memberships WHERE id = $1 RETURNING *",
      [id],
    );

    if (result.rows.length === 0) {
      throw new NotFoundError("Membership");
    }

    const deleted = result.rows[0];

    await syncMemberActive(client, deleted.member_id, todayInGym());

    await logAction(
      {
        userId: req.user.id,
        userName: req.user.full_name,
        action: "delete",
        entityType: "membership",
        entityId: deleted.id,
        entityLabel: deleted.plan_name,
        details: { price: deleted.price, member_id: deleted.member_id },
      },
      client,
    );

    return deleted;
  });

  res.status(200).json({
    success: true,
    message: "Membership deleted successfully",
    data: membership,
  });
};

module.exports = {
  getMembershipsByMember,
  createMembership,
  updateMembership,
  deleteMembership,
};
