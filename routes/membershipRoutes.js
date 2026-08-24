const express = require("express");
const router = express.Router();
const asyncHandler = require("../middleware/asyncHandler");
const protect = require("../middleware/protect");
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
  asyncHandler(getMembershipsByMember),
);

router.post("/", asyncHandler(protect), asyncHandler(createMembership));

router.put("/:id", asyncHandler(protect), asyncHandler(updateMembership));

router.delete(
  "/:id",
  asyncHandler(protect),
  restrictTo("admin"),
  asyncHandler(deleteMembership),
);

module.exports = router;
