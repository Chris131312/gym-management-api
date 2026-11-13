const express = require("express");
const router = express.Router();
const asyncHandler = require("../middleware/asyncHandler");
const protect = require("../middleware/protect");
const validate = require("../middleware/validate");
const {
  createMembershipSchema,
  updateMembershipSchema,
} = require("../schemas/membershipSchema");
const { memberIdParam, uuidIdParam } = require("../schemas/commonSchema");
const restrictTo = require("../middleware/restrictTo");
const {
  getMembershipsByMember,
  createMembership,
  updateMembership,
  deleteMembership,
} = require("../controllers/membershipController");

router.get(
  "/:member_id",
  asyncHandler(protect),
  validate(memberIdParam, "params"),
  asyncHandler(getMembershipsByMember),
);

router.post(
  "/",
  asyncHandler(protect),
  validate(createMembershipSchema),
  asyncHandler(createMembership),
);

router.put(
  "/:id",
  asyncHandler(protect),
  validate(uuidIdParam, "params"),
  validate(updateMembershipSchema),
  asyncHandler(updateMembership),
);

router.delete(
  "/:id",
  asyncHandler(protect),
  restrictTo("admin"),
  validate(uuidIdParam, "params"),
  asyncHandler(deleteMembership),
);

module.exports = router;
