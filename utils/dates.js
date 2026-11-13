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

module.exports = { GYM_TIMEZONE, todayInGym, isValidTimezone };
