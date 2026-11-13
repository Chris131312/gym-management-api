const express = require("express");
const router = express.Router();
const asyncHandler = require("../middleware/asyncHandler");
const protect = require("../middleware/protect");
const restrictTo = require("../middleware/restrictTo");
const validate = require("../middleware/validate");
const {
  updateGymSettingsSchema,
  createPlanSchema,
  updatePlanSchema,
} = require("../schemas/settingsSchema");
const { intIdParam } = require("../schemas/commonSchema");
const {
  getGymSettings,
  updateGymSettings,
  getPlans,
  getAllPlans,
  createPlan,
  updatePlan,
  deletePlan,
} = require("../controllers/settingsController");

// Gym info (admin only)
router.get(
  "/gym",
  asyncHandler(protect),
  restrictTo("admin"),
  asyncHandler(getGymSettings),
);
router.put(
  "/gym",
  asyncHandler(protect),
  restrictTo("admin"),
  validate(updateGymSettingsSchema),
  asyncHandler(updateGymSettings),
);

// Plans (read: any authenticated user; write: admin only)
router.get("/plans", asyncHandler(protect), asyncHandler(getPlans));
router.get(
  "/plans/all",
  asyncHandler(protect),
  restrictTo("admin"),
  asyncHandler(getAllPlans),
);
router.post(
  "/plans",
  asyncHandler(protect),
  restrictTo("admin"),
  validate(createPlanSchema),
  asyncHandler(createPlan),
);
router.put(
  "/plans/:id",
  asyncHandler(protect),
  restrictTo("admin"),
  validate(intIdParam, "params"),
  validate(updatePlanSchema),
  asyncHandler(updatePlan),
);
router.delete(
  "/plans/:id",
  asyncHandler(protect),
  restrictTo("admin"),
  validate(intIdParam, "params"),
  asyncHandler(deletePlan),
);

module.exports = router;
