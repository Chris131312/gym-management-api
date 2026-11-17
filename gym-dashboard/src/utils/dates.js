// Calendar dates travel as "YYYY-MM-DD" strings. They are handled here in local
// time, never through toISOString(), which would convert to UTC and flip the
// day in the evening for anyone west of Greenwich.

const pad = (n) => String(n).padStart(2, "0");

export const toDateString = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const todayString = () => toDateString(new Date());

// "2026-12-01" (or an ISO timestamp) -> Date at local midnight
export const parseDateString = (value) => {
  const [year, month, day] = String(value).slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day);
};

// Adds whole months, clamping to the last day (Jan 31 + 1 month = Feb 28/29)
export const addMonths = (date, months) => {
  const result = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(
    result.getFullYear(),
    result.getMonth() + 1,
    0,
  ).getDate();
  result.setDate(Math.min(date.getDate(), lastDay));
  return result;
};

// Whole calendar days from today until the given date (negative if past)
export const daysUntil = (value) => {
  const today = parseDateString(todayString());
  return Math.round((parseDateString(value) - today) / 86400000);
};

export const formatDate = (value) =>
  (value instanceof Date ? value : parseDateString(value)).toLocaleDateString(
    "en-US",
    { year: "numeric", month: "short", day: "numeric" },
  );
