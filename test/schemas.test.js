require("./setup");
const test = require("node:test");
const assert = require("node:assert/strict");

const {
  updateUserSchema,
  changePasswordSchema,
} = require("../schemas/authSchema");
const { checkinSchema } = require("../schemas/checkinSchema");
const {
  createMembershipSchema,
  updateMembershipSchema,
} = require("../schemas/membershipSchema");
const {
  updateGymSettingsSchema,
  createPlanSchema,
  updatePlanSchema,
} = require("../schemas/settingsSchema");
const { intIdParam, uuidIdParam } = require("../schemas/commonSchema");
const { updateMemberSchema } = require("../schemas/memberSchema");

const UUID = "2b1f8a52-5c5e-4a39-9d0f-3f0e5b6c7a11";

test("uuid params reject non-UUIDs and accept UUIDs", () => {
  assert.equal(uuidIdParam.safeParse({ id: "abc" }).success, false);
  assert.equal(uuidIdParam.safeParse({ id: UUID }).success, true);
});

test("integer id params are coerced and bounded", () => {
  assert.equal(intIdParam.parse({ id: "42" }).id, 42);
  for (const bad of ["abc", "0", "-1", "1.5", "99999999999"]) {
    assert.equal(intIdParam.safeParse({ id: bad }).success, false, bad);
  }
});

test("check-in requires a UUID member_id", () => {
  assert.equal(checkinSchema.safeParse({ member_id: UUID }).success, true);
  assert.equal(checkinSchema.safeParse({ member_id: " " + UUID + " " }).success, true);
  assert.equal(checkinSchema.safeParse({ member_id: "123" }).success, false);
  assert.equal(checkinSchema.safeParse({}).success, false);
});

test("membership rejects negative price and end before start", () => {
  const ok = {
    member_id: UUID,
    plan_name: "Monthly",
    price: 30,
    start_date: "2026-01-01",
    end_date: "2026-02-01",
  };
  assert.equal(createMembershipSchema.safeParse(ok).success, true);
  assert.equal(createMembershipSchema.safeParse({ ...ok, price: -1 }).success, false);
  assert.equal(
    createMembershipSchema.safeParse({ ...ok, end_date: "2025-12-31" }).success,
    false,
  );
  assert.equal(
    createMembershipSchema.safeParse({ ...ok, start_date: "2026-02-30" }).success,
    false,
  );
  const { member_id, ...fields } = ok;
  assert.equal(updateMembershipSchema.safeParse(fields).success, true);
});

test("plans: partial update keeps omitted fields undefined", () => {
  const parsed = updatePlanSchema.parse({ price: 10 });
  assert.deepEqual(parsed, { price: 10 });
  assert.equal(createPlanSchema.safeParse({ name: "x", price: 5 }).success, false);
  assert.equal(
    createPlanSchema.safeParse({ name: "x", price: 5, duration_months: 1.5 }).success,
    false,
  );
});

test("gym settings allow clearing email but reject malformed ones", () => {
  assert.equal(updateGymSettingsSchema.safeParse({ email: "" }).success, true);
  assert.equal(updateGymSettingsSchema.safeParse({ email: "nope" }).success, false);
  assert.equal(updateGymSettingsSchema.safeParse({ gym_name: "  " }).success, false);
});

test("updateUser only accepts known roles and normalizes email", () => {
  assert.equal(updateUserSchema.safeParse({ role: "owner" }).success, false);
  assert.equal(updateUserSchema.parse({ email: " A@B.com " }).email, "a@b.com");
  assert.deepEqual(updateUserSchema.parse({}), {});
});

test("changePassword enforces length and difference", () => {
  const base = { currentPassword: "oldpassword", newPassword: "newpassword1" };
  assert.equal(changePasswordSchema.safeParse(base).success, true);
  assert.equal(changePasswordSchema.safeParse({ ...base, newPassword: "short" }).success, false);
  assert.equal(
    changePasswordSchema.safeParse({ ...base, newPassword: "oldpassword" }).success,
    false,
  );
  assert.equal(changePasswordSchema.safeParse({ newPassword: "newpassword1" }).success, false);
});

test("member partial update does not inject defaults for omitted fields", () => {
  assert.deepEqual(updateMemberSchema.parse({ is_active: false }), {
    is_active: false,
  });
});
