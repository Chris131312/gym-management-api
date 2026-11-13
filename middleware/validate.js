// Validates req[source] against a Zod schema. `source` is "body" (default) or "params".
// (req.query is read-only in Express 5; use utils/pagination for query strings.)
function validate(schema, source = "body") {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const errors = result.error.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      return res.status(400).json({
        success: false,
        error: errors[0]?.message || "Validation failed",
        message: "Validation failed",
        details: errors,
      });
    }

    req[source] = result.data;
    next();
  };
}

module.exports = validate;
