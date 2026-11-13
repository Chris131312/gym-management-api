const express = require("express");
const router = express.Router();
const validate = require("../middleware/validate");
const asyncHandler = require("../middleware/asyncHandler");
const protect = require("../middleware/protect");
const restrictTo = require("../middleware/restrictTo");
const {
  registerSchema,
  loginSchema,
  updateUserSchema,
  changePasswordSchema,
} = require("../schemas/authSchema");
const { intIdParam } = require("../schemas/commonSchema");
const { loginLimiter } = require("../middleware/rateLimiters");
const {
  register,
  login,
  getUsers,
  updateUser,
  deleteUser,
  changePassword,
} = require("../controllers/authController");

// POST /api/auth/register (admin only)
router.post(
  "/register",
  asyncHandler(protect),
  restrictTo("admin"),
  validate(registerSchema),
  asyncHandler(register),
);

// POST /api/auth/login (public)
router.post(
  "/login",
  loginLimiter,
  validate(loginSchema),
  asyncHandler(login),
);

// GET /api/auth/users (admin only)
router.get(
  "/users",
  asyncHandler(protect),
  restrictTo("admin"),
  asyncHandler(getUsers),
);

// PUT /api/auth/users/:id (admin only)
router.put(
  "/users/:id",
  asyncHandler(protect),
  restrictTo("admin"),
  validate(intIdParam, "params"),
  validate(updateUserSchema),
  asyncHandler(updateUser),
);

// DELETE /api/auth/users/:id (admin only)
router.delete(
  "/users/:id",
  asyncHandler(protect),
  restrictTo("admin"),
  validate(intIdParam, "params"),
  asyncHandler(deleteUser),
);
// PUT /api/auth/change-password (authenticated users)
router.put(
  "/change-password",
  asyncHandler(protect),
  validate(changePasswordSchema),
  asyncHandler(changePassword),
);
module.exports = router;
