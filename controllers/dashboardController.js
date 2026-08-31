const pool = require("../config/db");

const getStats = async (req, res) => {
  const totalMembersRes = await pool.query("SELECT COUNT(*) FROM members");
  const totalMembers = parseInt(totalMembersRes.rows[0].count);

  const activeMembersRes = await pool.query(
    "SELECT COUNT(*) FROM members WHERE is_active = true",
  );
  const activeMembers = parseInt(activeMembersRes.rows[0].count);

  const revenueRes = await pool.query("SELECT SUM(price) FROM memberships");
  const totalRevenue = revenueRes.rows[0].sum
    ? parseFloat(revenueRes.rows[0].sum)
    : 0;

  const checkinsTodayRes = await pool.query(
    "SELECT COUNT(*) FROM check_ins WHERE DATE(check_in_time) = CURRENT_DATE",
  );
  const checkinsToday = parseInt(checkinsTodayRes.rows[0].count);

  res.status(200).json({
    success: true,
    data: {
      totalMembers,
      activeMembers,
      totalRevenue,
      checkinsToday,
    },
  });
};

const getCharts = async (req, res) => {
  const weeklyCheckins = await pool.query(`
    SELECT
      TO_CHAR(DATE(check_in_time), 'Dy') AS day,
      DATE(check_in_time) AS date,
      COUNT(*) AS count
    FROM check_ins
    WHERE check_in_time >= CURRENT_DATE - INTERVAL '6 days'
    GROUP BY DATE(check_in_time), TO_CHAR(DATE(check_in_time), 'Dy')
    ORDER BY DATE(check_in_time)
  `);

  const monthlyRevenue = await pool.query(`
    SELECT
      TO_CHAR(DATE_TRUNC('month', start_date), 'Mon') AS month,
      DATE_TRUNC('month', start_date) AS date,
      SUM(price) AS revenue,
      COUNT(*) AS sales
    FROM memberships
    WHERE start_date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 months'
    GROUP BY DATE_TRUNC('month', start_date), TO_CHAR(DATE_TRUNC('month', start_date), 'Mon')
    ORDER BY DATE_TRUNC('month', start_date)
  `);

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
  const result = await pool.query(`
    SELECT
      m.id AS member_id,
      m.first_name,
      m.last_name,
      m.email,
      ms.plan_name,
      ms.end_date,
      CASE
        WHEN ms.end_date < CURRENT_DATE THEN 'expired'
        WHEN ms.end_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'expiring_soon'
      END AS alert_type,
      (ms.end_date - CURRENT_DATE) AS days_remaining
    FROM members m
    INNER JOIN memberships ms ON m.id = ms.member_id
    WHERE ms.id = (
      SELECT id FROM memberships
      WHERE member_id = m.id
      ORDER BY end_date DESC
      LIMIT 1
    )
    AND ms.end_date BETWEEN CURRENT_DATE - INTERVAL '30 days'
                        AND CURRENT_DATE + INTERVAL '7 days'
    ORDER BY ms.end_date ASC
  `);

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
