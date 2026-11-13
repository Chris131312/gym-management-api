const { z } = require("zod");

const INT_MAX = 2147483647;

// members / memberships / check_ins use UUID primary keys
const memberIdParam = z.object({
  member_id: z.uuid({ error: "Invalid member id" }),
});

const uuidIdParam = z.object({
  id: z.uuid({ error: "Invalid id" }),
});

// users / membership_plans use integer primary keys
const intIdParam = z.object({
  id: z.coerce
    .number({ error: "Invalid id" })
    .int({ error: "Invalid id" })
    .positive({ error: "Invalid id" })
    .max(INT_MAX, { error: "Invalid id" }),
});

module.exports = { memberIdParam, uuidIdParam, intIdParam };
