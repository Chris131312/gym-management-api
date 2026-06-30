const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const { UnauthorizedError } = require("../utils/errors");

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (
    !authHeader ||
    typeof authHeader !== "string" ||
    !authHeader.startsWith("Bearer ")
  ) {
    throw new UnauthorizedError("No token provided. Please log in");
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new UnauthorizedError("Token expired. Please log in again");
    }
    throw new UnauthorizedError("Invalid token. Please log in");
  }

  const result = await pool.query(
    "SELECT id, email, full_name, role, is_active FROM users WHERE id = $1",
    [decoded.id],
  );

  if (result.rows.length === 0) {
    throw new UnauthorizedError("User no longer exists");
  }

  const user = result.rows[0];

  if (!user.is_active) {
    throw new UnauthorizedError("Account is deactivated");
  }

  req.user = user;
  next();
};

module.exports = protect;
