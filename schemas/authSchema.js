const { z } = require("zod");

const registerSchema = z.object({
  email: z
    .string({ error: "Email is required" })
    .trim()
    .toLowerCase()
    .email({ error: "Invalid email format" })
    .max(255, { error: "Email is too long" }),

  password: z
    .string({ error: "Password is required" })
    .min(8, { error: "Password must be at least 8 characters" })
    .max(72, { error: "Password must be at most 72 characters" }),

  full_name: z
    .string({ error: "Full name is required" })
    .trim()
    .min(2, { error: "Full name must be at least 2 characters" })
    .max(255, { error: "Full name is too long" }),

  role: z.enum(["admin", "receptionist"], {
    error: "Role must be 'admin' or receptionist",
  }),
});

const loginSchema = z.object({
  email: z
    .string({ error: "Email is required" })
    .trim()
    .toLowerCase()
    .email({ error: "Invalid email format" }),

  password: z.string({ error: "Password is required" }).min(1, {
    error: "Password is required",
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
};
