const { NotFoundError } = require("./errors");

// 404 unless the member exists and isn't soft-deleted; `db` is the pool or a
// transaction client.
const assertActiveMember = async (db, memberId) => {
  const result = await db.query(
    "SELECT 1 FROM members WHERE id = $1 AND deleted_at IS NULL",
    [memberId],
  );
  if (result.rows.length === 0) {
    throw new NotFoundError("Member");
  }
};

module.exports = { assertActiveMember };
