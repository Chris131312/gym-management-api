const express = require("express");
const router = express.Router();
const asyncHandler = require("../middleware/asyncHandler");
const protect = require("../middleware/protect");
const restrictTo = require("../middleware/restrictTo");
const { getAuditLogs } = require("../controllers/auditController");

router.get(
  "/",
  asyncHandler(protect),
  restrictTo("admin"),
  asyncHandler(getAuditLogs),
);

module.exports = router;
