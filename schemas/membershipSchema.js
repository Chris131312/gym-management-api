const { z } = require("zod");

const isRealDate = (value) => {
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
};

const dateString = (label) =>
  z
    .string({ error: `${label} is required` })
    .regex(/^\d{4}-\d{2}-\d{2}$/, { error: `${label} must be YYYY-MM-DD` })
    .refine(isRealDate, { error: `${label} is not a valid date` });

const membershipFields = {
  plan_name: z
    .string({ error: "Plan name is required" })
    .trim()
    .min(1, { error: "Plan name is required" })
    .max(100, { error: "Plan name is too long" }),
  price: z
    .number({ error: "Price is required" })
    .min(0, { error: "Price cannot be negative" })
    .max(99999999, { error: "Price is too large" }),
  start_date: dateString("Start date"),
  end_date: dateString("End date"),
};

const endNotBeforeStart = {
  check: (data) => data.end_date >= data.start_date,
  options: {
    path: ["end_date"],
    error: "End date cannot be before start date",
  },
};

const createMembershipSchema = z
  .object({
    member_id: z.uuid({ error: "Invalid member id" }),
    ...membershipFields,
  })
  .refine(endNotBeforeStart.check, endNotBeforeStart.options);

const updateMembershipSchema = z
  .object(membershipFields)
  .refine(endNotBeforeStart.check, endNotBeforeStart.options);

module.exports = { createMembershipSchema, updateMembershipSchema };
