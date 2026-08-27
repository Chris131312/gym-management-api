const pool = require("../config/db");
const { NotFoundError, ForbiddenError } = require("../utils/errors");

const registerCheckin = async (req, res) => {
  const { member_id } = req.body;

  const memberQuery = await pool.query("SELECT * FROM members WHERE id = $1", [
    member_id,
  ]);

  if (memberQuery.rows.length === 0) {
    throw new NotFoundError("Member");
  }

  const member = memberQuery.rows[0];

  if (member.is_active === false) {
    throw new ForbiddenError(
      "Access Denied. Member account is inactive. Please visit the front desk.",
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
  const query = `
    SELECT
      check_ins.id AS checkin_id,
      check_ins.check_in_time,
      members.first_name,
      members.last_name
    FROM check_ins
    INNER JOIN members ON check_ins.member_id = members.id
    ORDER BY check_ins.check_in_time DESC
  `;

  const recentCheckIns = await pool.query(query);

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
