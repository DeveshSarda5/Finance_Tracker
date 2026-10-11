const pool = require('../config/db');

async function listInvestments(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, amount, invested_date, notes
       FROM investments
       WHERE user_id = ?
       ORDER BY invested_date DESC, id DESC`,
      [req.user.id]
    );

    const [[{ total }]] = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) AS total FROM investments WHERE user_id = ?',
      [req.user.id]
    );

    res.json({ investments: rows, totalInvested: Number(total) });
  } catch (err) {
    next(err);
  }
}

async function createInvestment(req, res, next) {
  try {
    const { name, amount, investedDate, notes } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'name is required' });
    }
    if (!amount || Number.isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ error: 'amount must be a positive number' });
    }
    if (!investedDate) {
      return res.status(400).json({ error: 'investedDate is required (YYYY-MM-DD)' });
    }

    const [result] = await pool.query(
      'INSERT INTO investments (user_id, name, amount, invested_date, notes) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, name.trim(), amount, investedDate, notes || null]
    );

    res.status(201).json({
      investment: { id: result.insertId, name: name.trim(), amount, investedDate, notes: notes || null },
    });
  } catch (err) {
    next(err);
  }
}

async function deleteInvestment(req, res, next) {
  try {
    const [result] = await pool.query(
      'DELETE FROM investments WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Investment not found' });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { listInvestments, createInvestment, deleteInvestment };
