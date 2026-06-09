const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const { UnauthorizedError } = require("../utils/errors");

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
};
