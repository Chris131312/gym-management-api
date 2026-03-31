const express = require("express");
const pool = require("./config/db");

const app = express();
const PORT = 3000;

app.use(express.json());

//HEALTH CHECK
app.get("/api/health", (req, res) => {
  res
    .status(200)
    .json({
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
    res
      .status(201)
      .json({
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
    res
      .status(200)
      .json({
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

    res
      .status(200)
      .json({
        success: true,
        message: "Member updated successfully!",
        data: updatedMember.rows[0],
      });
  } catch (error) {
    console.error("Error updating member:", error.message);
    res.status(500).json({ success: false, error: "Internal server error." });
  }
});

app.listen(PORT, () => {
  console.log(`Server is up and running on http://localhost:${PORT}`);
});
