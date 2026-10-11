const pool = require('../config/db');

/** High-level summary cards: total income, total expense, net savings, txn count. */
async function summary(req, res, next) {
  try {
    const { startDate, endDate } = dateRange(req);

    const [[row]] = await pool.query(
      `SELECT
         COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS totalIncome,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS totalExpense,
         COUNT(*) AS transactionCount
       FROM transactions
       WHERE user_id = ? AND txn_date BETWEEN ? AND ?`,
      [req.user.id, startDate, endDate]
    );

    res.json({
      startDate,
      endDate,
      totalIncome: Number(row.totalIncome),
      totalExpense: Number(row.totalExpense),
      netSavings: Number(row.totalIncome) - Number(row.totalExpense),
      transactionCount: row.transactionCount,
    });
  } catch (err) {
    next(err);
  }
}

/** Spending broken down by category — powers the dashboard pie/donut chart. */
async function spendingByCategory(req, res, next) {
  try {
    const { startDate, endDate } = req.query.period
      ? isoRange(periodRange(req.query.period))
      : dateRange(req);

    const [rows] = await pool.query(
      `SELECT c.id AS categoryId, c.name AS categoryName, c.color,
              SUM(t.amount) AS total
       FROM transactions t
       JOIN categories c ON c.id = t.category_id
       WHERE t.user_id = ? AND t.type = 'expense' AND t.txn_date BETWEEN ? AND ?
       GROUP BY c.id, c.name, c.color
       ORDER BY total DESC`,
      [req.user.id, startDate, endDate]
    );

    res.json({ startDate, endDate, categories: rows.map((r) => ({ ...r, total: Number(r.total) })) });
  } catch (err) {
    next(err);
  }
}

/**
 * Income vs. expense over time — powers the trend bar chart. Granularity
 * follows the requested period: day buckets for week/month (fine enough to
 * be useful, coarse enough to stay readable), month buckets for 6months.
 * Buckets with no transactions are filled with zero so the chart's x-axis
 * is always continuous rather than skipping gaps.
 */
async function trend(req, res, next) {
  try {
    const period = ['week', 'month', '6months'].includes(req.query.period) ? req.query.period : 'month';
    const { start, end, granularity } = periodRange(period);
    const startDate = toLocalISODate(start);
    const endDate = toLocalISODate(end);

    const bucketExpr = granularity === 'day' ? 'DATE(txn_date)' : "DATE_FORMAT(txn_date, '%Y-%m-01')";

    const [rows] = await pool.query(
      `SELECT ${bucketExpr} AS bucket,
              SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS income,
              SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expense
       FROM transactions
       WHERE user_id = ? AND txn_date BETWEEN ? AND ?
       GROUP BY bucket
       ORDER BY bucket ASC`,
      [req.user.id, startDate, endDate]
    );

    const byBucket = new Map(rows.map((r) => [r.bucket, r]));
    const buckets = granularity === 'day' ? eachDay(start, end) : eachMonthStart(start, end);

    const series = buckets.map((bucket) => {
      const row = byBucket.get(bucket);
      return {
        bucket,
        income: row ? Number(row.income) : 0,
        expense: row ? Number(row.expense) : 0,
      };
    });

    res.json({ period, granularity, series });
  } catch (err) {
    next(err);
  }
}

// YYYY-MM-DD from local date parts — toISOString() would convert to UTC
// first, silently shifting the date back a day in timezones west of UTC.
function toLocalISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function dateRange(req) {
  const now = new Date();
  const defaultStart = toLocalISODate(new Date(now.getFullYear(), now.getMonth(), 1));
  const defaultEnd = toLocalISODate(now);
  return {
    startDate: req.query.startDate || defaultStart,
    endDate: req.query.endDate || defaultEnd,
  };
}

function isoRange({ start, end }) {
  return { startDate: toLocalISODate(start), endDate: toLocalISODate(end) };
}

/** Resolves a 'week' | 'month' | '6months' token to a concrete date range + bucket granularity. */
function periodRange(period) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (period === 'week') {
    const start = new Date(today);
    start.setDate(start.getDate() - 6);
    return { start, end: today, granularity: 'day' };
  }

  if (period === '6months') {
    const start = new Date(today.getFullYear(), today.getMonth() - 5, 1);
    return { start, end: today, granularity: 'month' };
  }

  // 'month' — from the 1st of the current month through today
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  return { start, end: today, granularity: 'day' };
}

function eachDay(start, end) {
  const days = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    days.push(toLocalISODate(d));
  }
  return days;
}

function eachMonthStart(start, end) {
  const months = [];
  for (let d = new Date(start.getFullYear(), start.getMonth(), 1); d <= end; d.setMonth(d.getMonth() + 1)) {
    months.push(toLocalISODate(d));
  }
  return months;
}

module.exports = { summary, spendingByCategory, trend };
