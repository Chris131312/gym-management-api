require("dotenv").config();

const validateEnv = require("./config/validateEnv");
validateEnv();

const express = require("express");
const cors = require("cors");
const poll = require("./config/db");

const validate = require("./middleware/validate");
const asyncHandler = require("./middleware/asyncHandler");
const errorHandler = require("./middleware/errorHandler");

const {
  createMemberSchema,
  updatedMemberSchema,
} = require("./schemas/memberSchema");
const { NotfoundError, ForbiddenError } = require("./utils/errors");
const { success } = require("zod");
const { is } = require("zod/locales");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

//Health Check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Gym Management API is running smoothly.",
  });
});

//CREATE MEMBER
app.post(
  "/api/members",
  validate(createMemberSchema),
  asyncHandler(async (req, res) => {
    const { first_name, last_name, email, phone_number, is_active } = req.body;

    const newMember = await pool.query(
      "INSERT INTO members (first_name, last_name, email, phone_number, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [first_name, last_name, email, phone_number, is_active],
    );
    res.status(201).json({
      success: true,
      message: "Member registered successfully!",
      data: newMember.rows[0],
    });
  }),
);

// READ ALL MEMBERS
app.get(
  "/api/members",
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const countResult = await pool.query("SELECT COUNT(*) FROM members");
    const totalMembers = parseInt(countResult.rows[0].count);

    const allMembers = await pool.query(
      "SELECT * FROM members ORDER BY created_at DESC LIMIT $1 OFFSET $2",
      [limit, offset],
    );

    res.status(200).json({
      success: true,
      limit: limit,
      page: page,
      totalMembers: totalMembers,
      totalPages: Math.ceil(totalMembers / limit),
      data: allMembers.rows,
    });
  }),
);

// GET MEMBER BY ID
app.get(
  "/api/members/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM members WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      throw new NotFoundError("Member");
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  }),
);

// UPDATE MEMBER
app.put(
  "/api/members/:id",
  validate(updateMemberSchema),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { first_name, last_name, email, phone_number, is_active } = req.body;

    const updatedMember = await pool.query(
      "UPDATE members SET first_name = $1, last_name = $2, email = $3, phone_number = $4, is_active = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *",
      [first_name, last_name, email, phone_number, is_active, id],
    );

    if (updatedMember.rows.length === 0) {
      throw new NotFoundError("Member");
    }

    res.status(200).json({
      success: true,
      message: "Member updated successfully!",
      data: updatedMember.rows[0],
    });
  }),
);

// DELETE MEMBER
app.delete(
  "/api/members/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const deleteMember = await pool.query(
      "DELETE FROM members WHERE id = $1 RETURNING *",
      [id],
    );
    if (deleteMember.rows.length === 0) {
      throw new NotfoundError("Member");
    }
    res.status(200).json({
      success: true,
      message: "Member deleted successfully!",
      data: deleteMember.rows[0],
    });
  }),
);

// REGISTER CHECK-IN
app.post(
  "/api/checkins",
  asyncHandler(async (req, res) => {
    const { member_id } = req.body;

    const memberQuery = await pool.query(
      "SELECT * FROM members WHERE id = $1",
      [member_id],
    );
    if (memberQuery.rows.length === 0) {
      throw new NotfoundError("Member");
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
  }),
);

// READ CHECK-INS WITH MEMBER INFO
app.get(
  "/api/checkins",
  asyncHandler(async (req, res) => {
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
      count: recentCheckIns.rowsCount,
      data: recentCheckIns.rows,
    });
  }),
);

// GET MEMBERSHIPS BY MEMBER ID
app.get(
  "/api/memberships/:member_id",
  asyncHandler(async (req, res) => {
    const { member_id } = req.params;

    const result = await pool.query(
      "SELECT * FROM memberships WHERE member_id = $1 ORDER BY end_date DESC",
      [member_id],
    );

    res.status(200).json(result.rows);
  }),
);

// POST (SELL/RENEW) MEMBERSHIP
app.post(
  "/api/memberships",
  asyncHandler(async (req, res) => {
    const { member_id, plan_name, price, start_date, end_date } = req.body;

    const result = await pool.query(
      `INSERT INTO memberships (member_id, plan_name, price, start_date, end_date) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [member_id, plan_name, price, start_date, end_date],
    );

    await pool.query("UPDATE members SET is_active = true WHERE id = $1", [
      member_id,
    ]);

    res.status(201).json({
      message: "Membership added successfully",
      membership: result.rows[0],
    });
  }),
);
// GET DASHBOARD STATS
app.get(
  "/api/dashboard/stats",
  asyncHandler(async (req, res) => {
    const totalMembersRes = await pool.query("SELECT COUNT(*) FROM members");
    const totalMembers = parseInt(totalMembersRes.rows[0].count);

    const activeMembersRes = await pool.query(
      "SELECT COUNT(*) FROM members WHERE is_active = true",
    );
    const activeMembers = parseInt(activeMembersRes.rows[0].count);

    const revenueRes = await pool.query("SELECT SUM(price) FROM memberships");
    const totalRevenue = revenueRes.rows[0].sum
      ? parseFloat(revenueRes.rows[0].sum)
      : 0;

    const checkinsTodayRes = await pool.query(
      "SELECT COUNT(*) FROM check_ins WHERE DATE(check_in_time) = CURRENT_DATE",
    );
    const checkinsToday = parseInt(checkinsTodayRes.rows[0].count);

    res.status(200).json({
      success: true,
      data: {
        totalMembers,
        activeMembers,
        totalRevenue,
        checkinsToday,
      },
    });
  }),
);
