const { z } = require("zod");

const NAME_REGEX = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s'-]+$/;

const memberBaseSchema = z.object({
  first_name: z
    .string({ require_error: "First name is required" })
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be at most 50 characters")
    .regex(NAME_REGEX, "First name contains invalid characters"),
});
