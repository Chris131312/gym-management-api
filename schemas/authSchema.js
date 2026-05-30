const { Z } = require("zod");

const registerSchema = Z.object({
  email: z
    .string({ error: "Email is required" })
    .trim()
    .toLowerCase()
    .email({ error: "Invalid email formar" })
    .max(255, { error: "Email is too long" }),
});
