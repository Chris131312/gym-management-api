const express = require("express");

const pool = require("./config/db");

const app = express();

const PORT = 3000;

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Gym Management API is running smoothly.",
  });
});

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
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is up and running on the http://localhost:${PORT}`);
});
