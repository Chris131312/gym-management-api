// SQL predicate: `memberRef` has a membership valid on the date bound to
// `dateParam` (e.g. "$1"). With requireStarted (default) a plan that starts in
// the future doesn't count, matching the check-in rule; without it only
// expiry matters, matching how createMembership flips is_active.
const hasValidMembership = (memberRef, dateParam, { requireStarted = true } = {}) => `EXISTS (
  SELECT 1 FROM memberships ms
  WHERE ms.member_id = ${memberRef}
    ${requireStarted ? `AND (ms.start_date IS NULL OR ms.start_date <= ${dateParam}::date)` : ""}
    AND ms.end_date >= ${dateParam}::date
)`;

// Re-derives members.is_active after a membership was edited or removed, so a
// member can't stay active on a plan that no longer exists (or inactive after
// an admin extends it). Runs inside the caller's transaction.
const syncMemberActive = (client, memberId, today) =>
  client.query(
    `UPDATE members
     SET is_active = ${hasValidMembership("members.id", "$2", { requireStarted: false })},
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND deleted_at IS NULL`,
    [memberId, today],
  );

module.exports = { hasValidMembership, syncMemberActive };
