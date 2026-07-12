const express = require("express");
const router = express.Router();
const validate = require("../middleware/validate");
const asyncHandler = require("../middleware/asyncHandler");
const protect = require("../middleware/protect");
const restrictTo = require("../middleware/restrictTo");
const { registerSchema, loginSchema } = require("../schemas/authSchema");
const {
  register,
  login,
  getUsers,
  updateUser,
  deleteUser,
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
router.post("/login", validate(loginSchema), asyncHandler(login));

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
  asyncHandler(updateUser),
);

// DELETE /api/auth/users/:id (admin only)
router.delete(
  "/users/:id",
  asyncHandler(protect),
  restrictTo("admin"),
  asyncHandler(deleteUser),
);

module.exports = router;
