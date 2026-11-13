const pool = require("../config/db");
const { NotFoundError, ForbiddenError } = require("../utils/errors");
const { todayInGym } = require("../utils/dates");
const { parsePagination } = require("../utils/pagination");

const registerCheckin = async (req, res) => {
  const { member_id } = req.body;

  const memberQuery = await pool.query(
    "SELECT * FROM members WHERE id = $1 AND deleted_at IS NULL",
    [member_id],
  );

  if (memberQuery.rows.length === 0) {
    throw new NotFoundError("Member");
  }

  const member = memberQuery.rows[0];

  if (member.is_active === false) {
    throw new ForbiddenError(
      "Access Denied. Member account is inactive. Please visit the front desk.",
    );
  }

  // is_active alone isn't enough: nothing flips it off when a plan expires
  const activeMembership = await pool.query(
    `SELECT 1 FROM memberships
     WHERE member_id = $1
       AND (start_date IS NULL OR start_date <= $2::date)
       AND end_date >= $2::date
     LIMIT 1`,
    [member_id, todayInGym()],
  );

  if (activeMembership.rows.length === 0) {
    throw new ForbiddenError(
      "Access Denied. Membership expired or not found. Please visit the front desk.",
    );
  }

  const newCheckIn = await pool.query(
    "INSERT INTO check_ins (member_id) VALUES ($1) RETURNING *",
    [member_id],
  );

  res.status(201).json({
    success: true,
    message: "Access Granted! Have a great workout.",
    data: newCheckIn.rows[0],
  });
};

const getRecentCheckins = async (req, res) => {
  const { limit } = parsePagination(req.query, {
    defaultLimit: 50,
    maxLimit: 200,
  });

  const recentCheckIns = await pool.query(
    `SELECT
       check_ins.id AS checkin_id,
       check_ins.check_in_time,
       members.first_name,
       members.last_name
     FROM check_ins
     INNER JOIN members ON check_ins.member_id = members.id
     WHERE members.deleted_at IS NULL
     ORDER BY check_ins.check_in_time DESC
     LIMIT $1`,
    [limit],
  );

  res.status(200).json({
    success: true,
    count: recentCheckIns.rowCount,
    data: recentCheckIns.rows,
  });
};

const getCheckinsByMember = async (req, res) => {
  const { member_id } = req.params;

  const totalResult = await pool.query(
    "SELECT COUNT(*) FROM check_ins WHERE member_id = $1",
    [member_id],
  );

  const recentResult = await pool.query(
    `SELECT id, check_in_time
     FROM check_ins
     WHERE member_id = $1
     ORDER BY check_in_time DESC
     LIMIT 30`,
    [member_id],
  );

  res.status(200).json({
    success: true,
    data: {
      totalCheckins: parseInt(totalResult.rows[0].count),
      recent: recentResult.rows,
    },
  });
};

module.exports = {
  registerCheckin,
  getRecentCheckins,
  getCheckinsByMember,
};
