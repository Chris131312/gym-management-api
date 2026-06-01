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
