const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const {
  NotFoundError,
  ConflictError,
  ForbiddenError,
  UnauthorizedError,
  ValidationError,
} = require("../utils/errors");
const { logAction } = require("../utils/auditLog");
const { escapeLike } = require("../utils/pagination");

const SALT_ROUNDS = 10;

// Compared against when the email is unknown so response time doesn't reveal
// whether an account exists.
const DUMMY_HASH = bcrypt.hashSync("timing-equalizer", SALT_ROUNDS);

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
  );
};

const register = async (req, res) => {
  const { email, password, full_name, role } = req.body;

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

  let result;
  try {
    result = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, full_name, role, is_active, created_at`,
      [email, password_hash, full_name, role],
    );
  } catch (error) {
    if (error.code === "23505") {
      throw new ConflictError("A user with this email already exists");
    }
    throw error;
  }

  const newUser = result.rows[0];

  await logAction({
    userId: req.user?.id || null,
    userName: req.user?.full_name || "System",
    action: "create",
    entityType: "user",
    entityId: newUser.id,
    entityLabel: newUser.full_name,
    details: { email: newUser.email, role: newUser.role },
  });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: {
      user: newUser,
    },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);

  const user = result.rows[0];

  const isPasswordValid = await bcrypt.compare(
    password,
    user ? user.password_hash : DUMMY_HASH,
  );

  if (!user || !isPasswordValid) {
    throw new UnauthorizedError("Invalid email or password");
  }

  // Only reveal the account state once the password is proven correct
  if (!user.is_active) {
    throw new UnauthorizedError(
      "Account is deactivated. Contact an administrator",
    );
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
  const search = typeof req.query.search === "string" ? req.query.search : "";

  const conditions = [];
  const params = [];

  if (search.trim()) {
    conditions.push(`(
      full_name ILIKE $1
      OR email ILIKE $1
      OR role ILIKE $1
    )`);
    params.push(`%${escapeLike(search.trim())}%`);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await pool.query(
    `SELECT id, email, full_name, role, is_active, created_at
     FROM users ${whereClause}
     ORDER BY created_at DESC`,
    params,
  );

  res.status(200).json({
    success: true,
    data: result.rows,
  });
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { full_name, email, role, is_active } = req.body;

  if (id === req.user.id) {
    if (role && role !== req.user.role) {
      throw new ForbiddenError("You cannot change your own role");
    }
    if (is_active === false) {
      throw new ForbiddenError("You cannot deactivate your own account");
    }
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

  const updatedUser = result.rows[0];

  await logAction({
    userId: req.user.id,
    userName: req.user.full_name,
    action: "update",
    entityType: "user",
    entityId: updatedUser.id,
    entityLabel: updatedUser.full_name,
    details: { fields: Object.keys(req.body) },
  });

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: result.rows[0],
  });
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  if (id === req.user.id) {
    throw new ForbiddenError("You cannot delete your own account");
  }

  const result = await pool.query(
    "DELETE FROM users WHERE id = $1 RETURNING id, email, full_name",
    [id],
  );

  if (result.rows.length === 0) {
    throw new NotFoundError("User");
  }

  const deletedUser = result.rows[0];

  await logAction({
    userId: req.user.id,
    userName: req.user.full_name,
    action: "delete",
    entityType: "user",
    entityId: deletedUser.id,
    entityLabel: deletedUser.full_name,
    details: { email: deletedUser.email },
  });

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
    data: deletedUser,
  });
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  const result = await pool.query("SELECT * FROM users WHERE id = $1", [
    userId,
  ]);

  if (result.rows.length === 0) {
    throw new NotFoundError("User");
  }

  const user = result.rows[0];

  const isCurrentValid = await bcrypt.compare(
    currentPassword,
    user.password_hash,
  );

  if (!isCurrentValid) {
    // 400, not 401: the dashboard logs the user out on any 401
    throw new ValidationError("Current password is incorrect");
  }

  const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [
    newHash,
    userId,
  ]);

  await logAction({
    userId,
    userName: req.user.full_name,
    action: "update",
    entityType: "user",
    entityId: userId,
    entityLabel: req.user.full_name,
    details: { fields: ["password"] },
  });

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
};

module.exports = {
  register,
  login,
  getUsers,
  updateUser,
  deleteUser,
  changePassword,
};
