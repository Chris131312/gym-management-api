const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const {
  NotFoundError,
  ConflictError,
  ForbiddenError,
} = require("../utils/errors");

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

  const existingUser = await pool.query(
    "SELECT id FROM users WHERE email = $1",
    [email],
  );

  if (existingUser.rows.length > 0) {
    throw new ConflictError("A user with this email already exists");
  }

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

  const result = await pool.query(
    `INSERT INTO users (email, password_hash, full_name, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, full_name, role, is_active, created_at`,
    [email, password_hash, full_name, role],
  );

  const newUser = result.rows[0];
  const token = generateToken(newUser);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: {
      user: newUser,
      token,
    },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);

  if (result.rows.length === 0) {
    throw new NotFoundError("Invalid email or password");
  }

  const user = result.rows[0];

  if (!user.is_active) {
    throw new NotFoundError("Account is deactivated. Contact an administrator");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    throw new NotFoundError("Invalid email or password");
  }

  const token = generateToken(user);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        is_active: user.is_active,
      },
      token,
    },
  });
};

const getUsers = async (req, res) => {
  const result = await pool.query(
    "SELECT id, email, full_name, role, is_active, created_at FROM users ORDER BY created_at DESC",
  );

  res.status(200).json({
    success: true,
    data: result.rows,
  });
};
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { full_name, email, role, is_active } = req.body;

  // Prevent admin from changing their own role
  if (parseInt(id) === req.user.id && role && role !== req.user.role) {
    throw new ForbiddenError("You cannot change your own role");
  }

  const result = await pool.query(
    `UPDATE users
     SET full_name = COALESCE($1, full_name),
         email = COALESCE($2, email),
         role = COALESCE($3, role),
         is_active = COALESCE($4, is_active)
     WHERE id = $5
     RETURNING id, email, full_name, role, is_active, created_at`,
    [full_name, email, role, is_active, id],
  );

  if (result.rows.length === 0) {
    throw new NotFoundError("User");
  }

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: result.rows[0],
  });
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  // Prevent admin from deleting themselves
  if (parseInt(id) === req.user.id) {
    throw new ForbiddenError("You cannot delete your own account");
  }

  const result = await pool.query(
    "DELETE FROM users WHERE id = $1 RETURNING id, email, full_name",
    [id],
  );

  if (result.rows.length === 0) {
    throw new NotFoundError("User");
  }

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
    data: result.rows[0],
  });
};
module.exports = {
  register,
  login,
  getUsers,
  updateUser,
  deleteUser,
};
