const { z } = require("zod");

const checkinSchema = z.object({
  member_id: z
    .string({ error: "Member ID is required" })
    .trim()
    .pipe(z.uuid({ error: "Invalid member ID" })),
});

module.exports = { checkinSchema };
