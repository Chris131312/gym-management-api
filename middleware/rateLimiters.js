const { rateLimit } = require("express-rate-limit");

// Only failed attempts count, so a legitimate login never eats into the budget
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    status: "fail",
    message: "Too many login attempts. Please try again in 15 minutes",
  },
});

module.exports = { loginLimiter };
