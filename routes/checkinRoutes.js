const express = require("express");
const router = express.Router();
const asyncHandler = require("../middleware/asyncHandler");
const protect = require("../middleware/protect");
const validate = require("../middleware/validate");
const { checkinSchema } = require("../schemas/checkinSchema");
const { memberIdParam } = require("../schemas/commonSchema");
const {
  registerCheckin,
  getRecentCheckins,
  getCheckinsByMember,
} = require("../controllers/checkinController");

router.post(
  "/",
  asyncHandler(protect),
  validate(checkinSchema),
  asyncHandler(registerCheckin),
);

router.get("/", asyncHandler(protect), asyncHandler(getRecentCheckins));

router.get(
  "/member/:member_id",
  asyncHandler(protect),
  validate(memberIdParam, "params"),
  asyncHandler(getCheckinsByMember),
);

module.exports = router;
