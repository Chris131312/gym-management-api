const pool = require("../config/db");
const { GYM_TIMEZONE, todayInGym } = require("../utils/dates");

const getStats = async (req, res) => {
  const today = todayInGym();

  const [totalMembersRes, activeMembersRes, revenueRes, checkinsTodayRes] =
    await Promise.all([
      pool.query("SELECT COUNT(*) FROM members WHERE deleted_at IS NULL"),
      pool.query(
        "SELECT COUNT(*) FROM members WHERE is_active = true AND deleted_at IS NULL",
      ),
      pool.query("SELECT SUM(price) FROM memberships"),
      // Range comparison (index-friendly) over the gym's local day
      pool.query(
        `SELECT COUNT(*) FROM check_ins
         WHERE check_in_time >= $1::date::timestamp AT TIME ZONE $2
           AND check_in_time < ($1::date + 1)::timestamp AT TIME ZONE $2`,
        [today, GYM_TIMEZONE],
      ),
    ]);

  res.status(200).json({
    success: true,
    data: {
      totalMembers: parseInt(totalMembersRes.rows[0].count),
      activeMembers: parseInt(activeMembersRes.rows[0].count),
      totalRevenue: revenueRes.rows[0].sum
        ? parseFloat(revenueRes.rows[0].sum)
        : 0,
      checkinsToday: parseInt(checkinsTodayRes.rows[0].count),
    },
  });
};

const getCharts = async (req, res) => {
  const today = todayInGym();

  const [weeklyCheckins, monthlyRevenue] = await Promise.all([
    // Always 7 rows (today and the 6 days before), zero-filled
    pool.query(
      `SELECT
         TO_CHAR(d.date, 'Dy') AS day,
         d.date,
         COALESCE(c.count, 0) AS count
       FROM (
         SELECT ($1::date - g) AS date FROM generate_series(0, 6) AS g
       ) d
       LEFT JOIN (
         SELECT (check_in_time AT TIME ZONE $2)::date AS date, COUNT(*) AS count
         FROM check_ins
         WHERE check_in_time >= ($1::date - 6)::timestamp AT TIME ZONE $2
         GROUP BY 1
       ) c ON c.date = d.date
       ORDER BY d.date`,
      [today, GYM_TIMEZONE],
    ),
    pool.query(
      `SELECT
         TO_CHAR(DATE_TRUNC('month', start_date), 'Mon') AS month,
         DATE_TRUNC('month', start_date) AS date,
         SUM(price) AS revenue,
         COUNT(*) AS sales
       FROM memberships
       WHERE start_date >= DATE_TRUNC('month', $1::date) - INTERVAL '5 months'
       GROUP BY DATE_TRUNC('month', start_date), TO_CHAR(DATE_TRUNC('month', start_date), 'Mon')
       ORDER BY DATE_TRUNC('month', start_date)`,
      [today],
    ),
  ]);

  res.status(200).json({
    success: true,
    data: {
      weeklyCheckins: weeklyCheckins.rows.map((row) => ({
        day: row.day,
        count: parseInt(row.count),
      })),
      monthlyRevenue: monthlyRevenue.rows.map((row) => ({
        month: row.month,
        revenue: parseFloat(row.revenue),
        sales: parseInt(row.sales),
      })),
    },
  });
};

const getAlerts = async (req, res) => {
  const result = await pool.query(
    `SELECT
       m.id AS member_id,
       m.first_name,
       m.last_name,
       m.email,
       ms.plan_name,
       ms.end_date,
       CASE
         WHEN ms.end_date < $1::date THEN 'expired'
         WHEN ms.end_date <= $1::date + 7 THEN 'expiring_soon'
       END AS alert_type,
       (ms.end_date - $1::date) AS days_remaining
     FROM members m
     INNER JOIN memberships ms ON m.id = ms.member_id
     WHERE m.deleted_at IS NULL
     AND ms.id = (
       SELECT id FROM memberships
       WHERE member_id = m.id
       ORDER BY end_date DESC
       LIMIT 1
     )
     AND ms.end_date BETWEEN $1::date - 30 AND $1::date + 7
     ORDER BY ms.end_date ASC`,
    [todayInGym()],
  );

  const alerts = result.rows.map((row) => ({
    memberId: row.member_id,
    name: `${row.first_name} ${row.last_name}`,
    email: row.email,
    plan: row.plan_name,
    endDate: row.end_date,
    alertType: row.alert_type,
    daysRemaining: parseInt(row.days_remaining),
  }));

  const expiringSoon = alerts.filter((a) => a.alertType === "expiring_soon");
  const expired = alerts.filter((a) => a.alertType === "expired");

  res.status(200).json({
    success: true,
    data: {
      expiringSoon,
      expired,
      totalAlerts: alerts.length,
    },
  });
};

module.exports = {
  getStats,
  getCharts,
  getAlerts,
};
