const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const { UnauthorizedError } = require("../utils/errors");

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startWith("Bearer")) {
    throw new UnauthorizedError("No token provided. Please log in");
  }

  const token = authHeader.split(" ")[1];
};
