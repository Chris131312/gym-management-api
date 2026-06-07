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
};

const result = await pool.query("SELECT * FROM users WHERE email = $1", [
  email,
]);

if (result.rows.length === 0) {
    throw new NotFoundError("Invalid email or password");
  }

  const user = result.rows[0]

if(!user.is_active){
  throw new NotFoundError("Account is deactivated. Contact an administrator")
}