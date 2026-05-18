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
