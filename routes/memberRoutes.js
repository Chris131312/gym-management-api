const express = require("express");
const router = express.Router();
const validate = require("../middleware/validate");
const asyncHandler = require("../middleware/asyncHandler");
const protect = require("../middleware/protect");
const restrictTo = require("../middleware/restrictTo");
const {
  createMemberSchema,
  updateMemberSchema,
} = require("../schemas/memberSchema");
const {
  createMember,
  getMembers,
  getMemberById,
  updateMember,
  deleteMember,
} = require("../controllers/memberController");

router.post(
  "/",
  asyncHandler(protect),
  validate(createMemberSchema),
  asyncHandler(createMember),
);

router.get("/", asyncHandler(protect), asyncHandler(getMembers));

router.get("/:id", asyncHandler(protect), asyncHandler(getMemberById));

router.put(
  "/:id",
  asyncHandler(protect),
  validate(updateMemberSchema),
  asyncHandler(updateMember),
);

router.delete(
  "/:id",
  asyncHandler(protect),
  restrictTo("admin"),
  asyncHandler(deleteMember),
);

module.exports = router;
