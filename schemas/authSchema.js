const { Z } = require("zod");

const registerSchema = Z.object({
  email: z
    .string({ error: "Email is required" })
    .trim()
    .toLowerCase()
    .email({ error: "Invalid email formar" })
    .max(255, { error: "Email is too long" }),

  password: z
    .string({ error: "Password is required" })
    .min(8, { error: "Password must be at least 8 characters" })
    .max(72, { error: "Password must be at most 72 characters" }),
});
