require("./setup");
const test = require("node:test");
const assert = require("node:assert/strict");

const { parsePagination, escapeLike } = require("../utils/pagination");
const { isValidTimezone, todayInGym } = require("../utils/dates");
const validate = require("../middleware/validate");
const { intIdParam } = require("../schemas/commonSchema");

test("parsePagination clamps hostile values", () => {
  assert.deepEqual(parsePagination({}), { page: 1, limit: 10, offset: 0 });
  assert.deepEqual(parsePagination({ page: "-3", limit: "-5" }), {
    page: 1,
    limit: 1,
    offset: 0,
  });
  assert.equal(parsePagination({ limit: "1000000" }).limit, 100);
  assert.equal(parsePagination({ limit: "abc" }, { defaultLimit: 20 }).limit, 20);
  assert.equal(parsePagination({ page: "3", limit: "10" }).offset, 20);
});

test("escapeLike neutralizes wildcards", () => {
  assert.equal(escapeLike("50%_off\\"), "50\\%\\_off\\\\");
});

test("timezone helpers", () => {
  assert.equal(isValidTimezone("America/Mexico_City"), true);
  assert.equal(isValidTimezone("Mars/Olympus"), false);
  assert.match(todayInGym(), /^\d{4}-\d{2}-\d{2}$/);
});

test("validate() on params coerces and rejects", () => {
  const run = (params) => {
    const req = { params };
    const res = {
      statusCode: 200,
      status(c) { this.statusCode = c; return this; },
      json(b) { this.body = b; return this; },
    };
    let called = false;
    validate(intIdParam, "params")(req, res, () => { called = true; });
    return { req, res, called };
  };

  const good = run({ id: "7" });
  assert.equal(good.called, true);
  assert.equal(good.req.params.id, 7);

  const bad = run({ id: "abc" });
  assert.equal(bad.called, false);
  assert.equal(bad.res.statusCode, 400);
  assert.equal(bad.res.body.error, "Invalid id");
});
