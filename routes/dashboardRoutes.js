const express = require("express");
const router = express.Router();
const asyncHandler = require("../middleware/asyncHandler");
const protect = require("../middleware/protect");
const restrictTo = require("../middleware/restrictTo");
const {
  getStats,
  getCharts,
  getAlerts,
} = require("../controllers/dashboardController");

router.get(
  "/stats",
  asyncHandler(protect),
  restrictTo("admin"),
  asyncHandler(getStats),
);

router.get(
  "/charts",
  asyncHandler(protect),
  restrictTo("admin"),
  asyncHandler(getCharts),
);

router.get(
  "/alerts",
  asyncHandler(protect),
  restrictTo("admin"),
  asyncHandler(getAlerts),
);

module.exports = router;
