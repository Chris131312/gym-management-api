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

// Guesses at the current password need a valid token, but a stolen one
// shouldn't allow unlimited tries. Keyed by user (runs after protect), and
// only failed attempts count.
const changePasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req) => `user:${req.user.id}`,
  message: {
    success: false,
    status: "fail",
    message: "Too many password attempts. Please try again in 15 minutes",
  },
});

module.exports = { loginLimiter, changePasswordLimiter };
