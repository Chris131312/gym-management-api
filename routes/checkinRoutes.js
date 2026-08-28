const express = require("express");
const router = express.Router();
const asyncHandler = require("../middleware/asyncHandler");
const protect = require("../middleware/protect");
const {
  registerCheckin,
  getRecentCheckins,
  getCheckinsByMember,
} = require("../controllers/checkinController");

router.post("/", asyncHandler(protect), asyncHandler(registerCheckin));

router.get("/", asyncHandler(protect), asyncHandler(getRecentCheckins));

router.get(
  "/member/:member_id",
  asyncHandler(protect),
  asyncHandler(getCheckinsByMember),
);

module.exports = router;
