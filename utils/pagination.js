const clampInt = (value, fallback, min, max) => {
  const n = parseInt(value, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(Math.max(n, min), max);
};

const parsePagination = (query, { defaultLimit = 10, maxLimit = 100 } = {}) => {
  const page = clampInt(query.page, 1, 1, 1_000_000);
  const limit = clampInt(query.limit, defaultLimit, 1, maxLimit);
  return { page, limit, offset: (page - 1) * limit };
};

// Escapes LIKE/ILIKE wildcards so user input is matched literally.
const escapeLike = (value) => value.replace(/[\\%_]/g, "\\$&");

module.exports = { parsePagination, escapeLike };
