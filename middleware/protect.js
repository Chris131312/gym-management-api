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
    decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new UnauthorizedError("Token expired. Please log in again");
    }
    throw new UnauthorizedError("Invalid token. Please log in");
  }

  const result = await pool.query(
    "SELECT id, email, full_name, role, is_active, password_changed_at FROM users WHERE id = $1",
    [decoded.id],
  );

  if (result.rows.length === 0) {
    throw new UnauthorizedError("User no longer exists");
  }

  const user = result.rows[0];

  if (!user.is_active) {
    throw new UnauthorizedError("Account is deactivated");
  }

  // A password change revokes every token issued before it. Compared in whole
  // seconds because a JWT's iat has no sub-second precision.
  if (
    user.password_changed_at &&
    !(decoded.iat >= Math.floor(user.password_changed_at.getTime() / 1000))
  ) {
    throw new UnauthorizedError("Password was changed. Please log in again");
  }

  const { password_changed_at, ...safeUser } = user;
  req.user = safeUser;
  next();
};

module.exports = protect;
