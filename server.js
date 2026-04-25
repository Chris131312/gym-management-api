const express = require("express");
const cors = require("cors");
const pool = require("./config/db");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// HEALTH CHECK
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Gym Management API is running smoothly.",
  });
});

// CREATE MEMBER
app.post("/api/members", async (req, res) => {
  try {
    const { first_name, last_name, email, phone_number } = req.body;
    const newMember = await pool.query(
      "INSERT INTO members (first_name, last_name, email, phone_number) VALUES ($1, $2, $3, $4) RETURNING *",
      [first_name, last_name, email, phone_number],
    );
    res.status(201).json({
      success: true,
      message: "Member registered successfully!",
      data: newMember.rows[0],
    });
  } catch (error) {
    console.error("Error saving member:", error.message);
    res.status(500).json({ success: false, error: "Internal server error." });
  }
});

// READ ALL MEMBERS
app.get("/api/members", async (req, res) => {
  try {
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
  } catch (error) {
    console.error("Error fetching members:", error.message);
    res.status(500).json({ success: false, error: "Internal server error." });
  }
});

// UPDATE MEMBER
app.put("/api/members/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, phone_number, is_active } = req.body;

    const updatedMember = await pool.query(
      "UPDATE members SET first_name = $1, last_name = $2, email = $3, phone_number = $4, is_active = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *",
      [first_name, last_name, email, phone_number, is_active, id],
    );

    if (updatedMember.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Member not found." });
    }

    res.status(200).json({
      success: true,
      message: "Member updated successfully!",
      data: updatedMember.rows[0],
    });
  } catch (error) {
    console.error("Error updating member:", error.message);
    res.status(500).json({ success: false, error: "Internal server error." });
  }
});

// DELETE MEMBER
app.delete("/api/members/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deleteMember = await pool.query(
      "DELETE FROM members WHERE id = $1 RETURNING *",
      [id],
    );

    if (deleteMember.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Member not found. They might have been deleted already.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Member deleted successfully!",
      data: deleteMember.rows[0],
    });
  } catch (error) {
    console.error("Error deleting member:", error.message);
    res.status(500).json({ success: false, error: "Internal server error." });
  }
});

// REGISTER CHECK-IN
app.post("/api/checkins", async (req, res) => {
  try {
    const { member_id } = req.body;

    const memberQuery = await pool.query(
      "SELECT * FROM members WHERE id = $1",
      [member_id],
    );

    if (memberQuery.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: "Access Denied. No member found with this ID.",
      });
    }

    const member = memberQuery.rows[0];

    if (member.is_active === false) {
      return res.status(403).json({
        success: false,
        error:
          "Access Denied. Member account is inactive. Please visit the front desk.",
      });
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
  } catch (error) {
    console.error("Error processing check-in:", error.message);
    res.status(500).json({ success: false, error: "Internal server error." });
  }
});

// READ CHECK-INS WITH MEMBER INFO
app.get("/api/checkins", async (req, res) => {
  try {
    const query = `
    SELECT
      check_ins.id AS checkin_id,
      check_ins.check_in_time,
      members.first_name,
      members.last_name
    FROM check_ins
    INNER JOIN members ON check_ins.member_id = members.id
    ORDER BY check_ins.check_in_time DESC;
    `;

    const recentCheckIns = await pool.query(query);

    res.status(200).json({
      success: true,
      count: recentCheckIns.rowCount,
      data: recentCheckIns.rows,
    });
  } catch (error) {
    console.error("Error fetching check-ins:", error.message);
    res.status(500).json({ success: false, error: "Internal server error." });
  }
});

// GET MEMBERSHIPS BY MEMBER ID
app.get("/api/memberships/:member_id", async (req, res) => {
  const { member_id } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM memberships WHERE member_id = $1 ORDER BY end_date DESC",
      [member_id],
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching memberships:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST (SELL/RENEW) MEMBERSHIP
app.post("/api/memberships", async (req, res) => {
  const { member_id, plan_name, price, start_date, end_date } = req.body;

  try {
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
  } catch (error) {
    console.error("Error creating membership:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is up and running on http://localhost:${PORT}`);
});
