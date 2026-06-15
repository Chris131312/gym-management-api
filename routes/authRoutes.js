const express = require("express");
const router = express.Router();
const validate = require("../middleware/validate");
const asyncHandler = require("../middleware/asyncHandler");
const protect = require("../middleware/protect");
const restrictTo = require("../middleware/restrictTo");
const { registerSchema, loginSchema } = require("../schemas/authSchema");
const { register, login } = require("../controllers/authController");
// POST /api/auth/register
router.post(
  "/register",
  asyncHandler(protect),
  restrictTo("admin"),
  validate(registerSchema),
  asyncHandler(register),
);

// POST /api/auth/login
router.post("/login", validate(loginSchema), asyncHandler(login));

module.exports = router;
