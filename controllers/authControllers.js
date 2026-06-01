const bcrypy = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const { NotFoundError, ConflictError } = require("../utils/errors");

const SALT_ROUNDS = 10;

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
  );
};
const register = async (req, res) => {
  const { email, password, full_name, role } = req.body;

  // 1. Check if email already exists
  const existingUser = await pool.query(
    "SELECT id FROM users WHERE email = $1",
    [email],
  );

  if (existingUser.rows.length > 0) {
    throw new ConflictError("A user with this email already exists");
  }
};
