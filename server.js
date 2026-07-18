require("dotenv").config();

const validateEnv = require("./config/validateEnv");
validateEnv();

const express = require("express");
const cors = require("cors");
const pool = require("./config/db");

const validate = require("./middleware/validate");
const asyncHandler = require("./middleware/asyncHandler");
const errorHandler = require("./middleware/errorHandler");

const {
  createMemberSchema,
  updateMemberSchema,
} = require("./schemas/memberSchema");
const { NotFoundError, ForbiddenError } = require("./utils/errors");
const authRoutes = require("./routes/authRoutes");
const protect = require("./middleware/protect");
const restrictTo = require("./middleware/restrictTo");
const { success } = require("zod");

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(express.json());
app.use("/api/auth", authRoutes);

// Health Check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Gym Management API is running smoothly.",
  });
});

// CREATE MEMBER
app.post(
  "/api/members",
  asyncHandler(protect),
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

// READ ALL MEMBERS (with search and filters)
app.get(
  "/api/members",
  asyncHandler(protect),
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";
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
      params.push(`%${search.trim()}%`);
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
  asyncHandler(protect),
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
  asyncHandler(protect),
  restrictTo("admin"),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const deleteMember = await pool.query(
      "DELETE FROM members WHERE id = $1 RETURNING *",
      [id],
    );
    if (deleteMember.rows.length === 0) {
      throw new NotFoundError("Member");
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
  asyncHandler(protect),
  asyncHandler(async (req, res) => {
    const { member_id } = req.body;

    const memberQuery = await pool.query(
      "SELECT * FROM members WHERE id = $1",
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
  asyncHandler(protect),
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
      count: recentCheckIns.rowCount,
      data: recentCheckIns.rows,
    });
  }),
);

// GET MEMBERSHIPS BY MEMBER ID
app.get(
  "/api/memberships/:member_id",
  asyncHandler(protect),
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
  asyncHandler(protect),
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
      success: true,
      message: "Membership added successfully",
      data: result.rows[0],
    });
  }),
);

// GET DASHBOARD STATS
app.get(
  "/api/dashboard/stats",
  asyncHandler(protect),
  restrictTo("admin"),
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
// GET DASHBOARD CHARTS DATA
app.get(
  "/api/dashboard/charts",
  asyncHandler(protect),
  restrictTo("admin"),
  asyncHandler(async (req, res) => {
    // Weekly check-ins (last 7 days)
    const weeklyCheckins = await pool.query(`
      SELECT
        TO_CHAR(DATE(check_in_time), 'Dy') AS day,
        DATE(check_in_time) AS date,
        COUNT(*) AS count
      FROM check_ins
      WHERE check_in_time >= CURRENT_DATE - INTERVAL '6 days'
      GROUP BY DATE(check_in_time), TO_CHAR(DATE(check_in_time), 'Dy')
      ORDER BY DATE(check_in_time)
    `);

    // Monthly revenue (last 6 months)
    const monthlyRevenue = await pool.query(`
      SELECT
        TO_CHAR(DATE_TRUNC('month', start_date), 'Mon') AS month,
        DATE_TRUNC('month', start_date) AS date,
        SUM(price) AS revenue,
        COUNT(*) AS sales
      FROM memberships
      WHERE start_date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 months'
      GROUP BY DATE_TRUNC('month', start_date), TO_CHAR(DATE_TRUNC('month', start_date), 'Mon')
      ORDER BY DATE_TRUNC('month', start_date)
    `);

    res.status(200).json({
      success: true,
      data: {
        weeklyCheckins: weeklyCheckins.rows.map((row) => ({
          day: row.day,
          count: parseInt(row.count),
        })),
        monthlyRevenue: monthlyRevenue.rows.map((row) => ({
          month: row.month,
          revenue: parseFloat(row.revenue),
          sales: parseInt(row.sales),
        })),
      },
    });
  }),
);
// UPDATE MEMBERSHIP
app.put(
  "/api/memberships/:id",
  asyncHandler(protect),
  asyncHandler(async (req, res) => {
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
  }),
);
// GET DASHBOARD ALERTS (expiring/expired memberships)
app.get(
  "/api/dashboard/alerts",
  asyncHandler(protect),
  restrictTo("admin"),
  asyncHandler(async (req, res) => {
    const result = await pool.query(`
      SELECT
        m.id AS member_id,
        m.first_name,
        m.last_name,
        m.email,
        ms.plan_name,
        ms.end_date,
        CASE
          WHEN ms.end_date < CURRENT_DATE THEN 'expired'
          WHEN ms.end_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'expiring_soon'
        END AS alert_type,
        (ms.end_date - CURRENT_DATE) AS days_remaining
      FROM members m
      INNER JOIN memberships ms ON m.id = ms.member_id
      WHERE ms.id = (
        SELECT id FROM memberships
        WHERE member_id = m.id
        ORDER BY end_date DESC
        LIMIT 1
      )
      AND ms.end_date BETWEEN CURRENT_DATE - INTERVAL '30 days'
                          AND CURRENT_DATE + INTERVAL '7 days'
      ORDER BY ms.end_date ASC
    `);

    const alerts = result.rows.map((row) => ({
      memberId: row.member_id,
      name: `${row.first_name} ${row.last_name}`,
      email: row.email,
      plan: row.plan_name,
      endDate: row.end_date,
      alertType: row.alert_type,
      daysRemaining: parseInt(row.days_remaining),
    }));

    const expiringSoon = alerts.filter((a) => a.alertType === "expiring_soon");
    const expired = alerts.filter((a) => a.alertType === "expired");

    res.status(200).json({
      success: true,
      data: {
        expiringSoon,
        expired,
        totalAlerts: alerts.length,
      },
    });
  }),
);

// DELETE MEMBERSHIP (admin only)
app.delete(
  "/api/memberships/:id",
  asyncHandler(protect),
  restrictTo("admin"),
  asyncHandler(async (req, res) => {
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
  }),
);

// 404 HANDLER
app.use((req, res, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.path}`));
});

// ERROR HANDLER
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
