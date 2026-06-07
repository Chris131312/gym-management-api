const express = require("express");
const router = express.Router();
const validate = require("../middleware/validate");
const asyncHandler = require("../middleware/asyncHandler");
const { registerSchema, loginSchema } = require("../schemas/authSchema");
const { register, login } = require("../controllers/authControllers");

// POST /api/auth/register
router.post("/register", validate(registerSchema), asyncHandler(register));

// POST /api/auth/login
router.post("/login", validate(loginSchema), asyncHandler(login));

module.exports = router;
