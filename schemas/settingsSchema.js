const { z } = require("zod");

const optionalText = (label, max) =>
  z
    .string({ error: `${label} must be text` })
    .trim()
    .max(max, { error: `${label} is too long` })
    .optional();

const updateGymSettingsSchema = z.object({
  gym_name: z
    .string({ error: "Gym name must be text" })
    .trim()
    .min(1, { error: "Gym name cannot be empty" })
    .max(255, { error: "Gym name is too long" })
    .optional(),
  address: optionalText("Address", 255),
  phone: optionalText("Phone", 50),
  // Empty string is allowed so the email can be cleared
  email: z
    .string({ error: "Email must be text" })
    .trim()
    .max(255, { error: "Email is too long" })
    .refine((v) => v === "" || z.email().safeParse(v).success, {
      error: "Invalid email format",
    })
    .optional(),
});

const createPlanSchema = z.object({
  name: z
    .string({ error: "Plan name is required" })
    .trim()
    .min(1, { error: "Plan name is required" })
    .max(100, { error: "Plan name is too long" }),
  price: z
    .number({ error: "Price is required" })
    .min(0, { error: "Price cannot be negative" })
    .max(99999999, { error: "Price is too large" }),
  duration_months: z
    .number({ error: "Duration is required" })
    .int({ error: "Duration must be a whole number of months" })
    .min(1, { error: "Duration must be at least 1 month" })
    .max(120, { error: "Duration is too long" }),
  description: optionalText("Description", 255),
  sort_order: z
    .number({ error: "Sort order must be a number" })
    .int({ error: "Sort order must be a whole number" })
    .min(0)
    .max(9999)
    .optional(),
  is_active: z.boolean({ error: "is_active must be true or false" }).optional(),
});

const updatePlanSchema = createPlanSchema.partial();

module.exports = {
  updateGymSettingsSchema,
  createPlanSchema,
  updatePlanSchema,
};
