const pool = require('../config/db');

function currentPeriod() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

async function listBudgets(req, res, next) {
  try {
    const period = req.query.period || currentPeriod();

    const [rows] = await pool.query(
      `SELECT b.id, b.category_id, c.name AS category_name, c.color AS category_color,
              b.period, b.amount_limit,
              COALESCE(SUM(t.amount), 0) AS spent
       FROM budgets b
       JOIN categories c ON c.id = b.category_id
       LEFT JOIN transactions t
         ON t.category_id = b.category_id
        AND t.user_id = b.user_id
        AND t.type = 'expense'
        AND DATE_FORMAT(t.txn_date, '%Y-%m') = b.period
       WHERE b.user_id = ? AND b.period = ?
       GROUP BY b.id, b.category_id, c.name, c.color, b.period, b.amount_limit
       ORDER BY c.name`,
      [req.user.id, period]
    );

    const budgets = rows.map((r) => ({
      ...r,
      remaining: Number(r.amount_limit) - Number(r.spent),
      percentUsed: r.amount_limit > 0 ? Math.round((Number(r.spent) / Number(r.amount_limit)) * 100) : 0,
    }));

    res.json({ period, budgets });
  } catch (err) {
    next(err);
  }
}

async function upsertBudget(req, res, next) {
  try {
    const { categoryId, period, amountLimit } = req.body;
    if (!categoryId || !period || !amountLimit) {
      return res.status(400).json({ error: 'categoryId, period and amountLimit are required' });
    }

    await pool.query(
      `INSERT INTO budgets (user_id, category_id, period, amount_limit)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE amount_limit = VALUES(amount_limit)`,
      [req.user.id, categoryId, period, amountLimit]
    );

    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
}

async function deleteBudget(req, res, next) {
  try {
    const [result] = await pool.query(
      'DELETE FROM budgets WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Budget not found' });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { listBudgets, upsertBudget, deleteBudget };
