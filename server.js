const express = require("express");
const cors = require("cors");
const pool = require("./config/db");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

//HEALTH CHECK
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Gym Management API is running smoothly.",
  });
});

//CREATE MEMBER
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

//READ ALL MEMBERS
app.get("/api/members", async (req, res) => {
  try {
    const allMembers = await pool.query(
      "SELECT * FROM members ORDER BY created_at DESC",
    );
    res.status(200).json({
      success: true,
      count: allMembers.rowCount,
      data: allMembers.rows,
    });
  } catch (error) {
    console.error("Error fetching members:", error.message);
    res.status(500).json({ success: false, error: "Internal server error." });
  }
});

//UPDATE MEMBER
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

//DELETE MEMBER
app.delete("/api/members/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deleteMember = await pool.query(
      "DELETE FROM members WHERE id = $1 RETURNING *",
      [id],
    );

    if (deleteMember.rowCount.length === 0) {
      return res.status(404).json({
        success: false,
        message: " Member not found. They might have been deleted already.",
      });
    }
    res.status(200).json({
      success: true,
      message: "Member deleted successfully!",
      data: deleteMember.rows[0],
    });
  } catch (error) {
    console.error("Error deleting member:", error.message);
    res.status(500).json({
      success: false,
      error: "Internal server error.",
    });
  }
});

//Register Check-in
app.post("/api/checkins", async (req, res) => {
  try {
    const { member_id } = req.body;

    const membershipQuery = await pool.query(
      "SELECT * FROM memberships WHERE member_id = $1 ORDER BY end_date DESC LIMIT 1",
      [member_id],
    );

    if (membershipQuery.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: "Access Denied. No membership record found for this member.",
      });
    }
    const membership = membershipQuery.rows[0];

    const today = new Date();
    const expirationDate = new Date(membership.end_date);

    if (expirationDate < today) {
      return res.status(403).json({
        success: false,
        error: `Access Denied. Membership expired on ${expirationDate.toDateString()}. Please renew at the front desk.`,
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
    console.error("Error processing check-in", error.message);
    res.status(500).json({ success: false, error: "Internal server error." });
  }
});

//SELL MEMBERSHIPS
app.post("/api/memberships", async (req, res) => {
  try {
    const { member_id, plan_name, price, duration_in_days } = req.body;

    const newMembership = await pool.query(
      `
      INSERT INTO memberships (member_id, plan_name, price, end_date) 
            VALUES ($1, $2, $3, CURRENT_DATE + $4 * INTERVAL '1 day') 
            RETURNING *
      `,
      [member_id, plan_name, price, duration_in_days],
    );

    res.status(201).json({
      success: true,
      message: "Membership activated successfully!",
      data: newMembership.rows[0],
    });
  } catch (error) {
    console.error("Error selling membership:", error.message);
    res.status(500).json({ success: false, error: "Internal server error." });
  }
});

//Read Check-In with member info
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

app.listen(PORT, () => {
  console.log(`Server is up and running on http://localhost:${PORT}`);
});
