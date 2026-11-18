const GYM_TIMEZONE = process.env.GYM_TIMEZONE || "UTC";

// Today's calendar date (YYYY-MM-DD) in the gym's timezone, so "today"
// does not roll over at the DB server's UTC midnight.
const todayInGym = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: GYM_TIMEZONE });

const isValidTimezone = (tz) => {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
};

// "YYYY-MM-DD" plus whole months, clamped to the last day of the target month
// (Jan 31 + 1 month = Feb 28/29). Pure string/UTC math, so no timezone shifts.
const addMonthsToDate = (dateString, months) => {
  const [year, month, day] = dateString.split("-").map(Number);
  const target = new Date(Date.UTC(year, month - 1 + months, 1));
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  target.setUTCDate(Math.min(day, lastDay));
  return target.toISOString().slice(0, 10);
};

module.exports = { GYM_TIMEZONE, todayInGym, isValidTimezone, addMonthsToDate };
