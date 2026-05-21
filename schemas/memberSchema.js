const { z } = require("zod");

const NAME_REGEX = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s'-]+$/;

const memberBaseSchema = z.object({
  first_name: z
    .string({ error: "First name is required" })
    .trim()
    .min(2, { error: "First name must be at least 2 characters" })
    .max(50, { error: "First name must be at most 50 characters" })
    .regex(NAME_REGEX, { error: "First name contains invalid characters" }),

  last_name: z
    .string({ error: "Last name is required" })
    .trim()
    .min(2, { error: "Last name must be at least 2 characters" })
    .max(50, { error: "Last name must be at most 50 characters" })
    .regex(NAME_REGEX, { error: "Last name contains invalid characters" }),

  email: z
    .string({ error: "Email is required" })
    .trim()
    .toLowerCase()
    .email({ error: "Invalid email format" })
    .max(255, { error: "Email is too long" }),

  phone_number: z
    .string({ error: "Phone number is required" })
    .trim()
    .regex(/^\d{10}$/, { error: "Phone must be exactly 10 digits" }),
});

const createMemberSchema = memberBaseSchema.extend({
  is_active: z.boolean().optional().default(true),
});

const updateMemberSchema = memberBaseSchema.partial().extend({
  is_active: z.boolean().optional(),
});

module.exports = {
  createMemberSchema,
  updateMemberSchema,
};
