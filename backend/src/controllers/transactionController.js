const pool = require('../config/db');
const { suggestCategory } = require('../utils/mlClient');

const MAX_PAGE_SIZE = 100;

async function listTransactions(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(req.query.pageSize, 10) || 20));
    const offset = (page - 1) * pageSize;

    // Columns qualified with t. — categories also has user_id and type
    // columns, which the joined query below would otherwise resolve ambiguously.
    const filters = ['t.user_id = ?'];
    const params = [req.user.id];

    if (req.query.type && ['income', 'expense'].includes(req.query.type)) {
      filters.push('t.type = ?');
      params.push(req.query.type);
    }
    if (req.query.categoryId) {
      filters.push('t.category_id = ?');
      params.push(req.query.categoryId);
    }
    if (req.query.startDate) {
      filters.push('t.txn_date >= ?');
      params.push(req.query.startDate);
    }
    if (req.query.endDate) {
      filters.push('t.txn_date <= ?');
      params.push(req.query.endDate);
    }
    if (req.query.search) {
      filters.push('(t.description LIKE ? OR t.merchant LIKE ?)');
      params.push(`%${req.query.search}%`, `%${req.query.search}%`);
    }

    const whereClause = filters.join(' AND ');

    // Single round trip for total count, capped by the same filters as the page query
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM transactions t WHERE ${whereClause}`,
      params
    );

    const [rows] = await pool.query(
      `SELECT t.id, t.type, t.amount, t.description, t.merchant, t.txn_date,
              t.auto_categorized, t.category_id,
              c.name AS category_name, c.color AS category_color, c.icon AS category_icon
       FROM transactions t
       LEFT JOIN categories c ON c.id = t.category_id
       WHERE ${whereClause}
       ORDER BY t.txn_date DESC, t.id DESC
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    res.json({
      transactions: rows,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (err) {
    next(err);
  }
}

async function createTransaction(req, res, next) {
  try {
    let { type, amount, description, merchant, txnDate, categoryId } = req.body;

    if (!type || !['income', 'expense'].includes(type)) {
      return res.status(400).json({ error: 'type must be income or expense' });
    }
    if (!amount || Number.isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ error: 'amount must be a positive number' });
    }
    if (!txnDate) {
      return res.status(400).json({ error: 'txnDate is required (YYYY-MM-DD)' });
    }

    let autoCategorized = 0;
    if (!categoryId && type === 'expense' && (description || merchant)) {
      const suggestion = await suggestCategory(description || merchant);
      if (suggestion) {
        categoryId = suggestion.categoryId;
        autoCategorized = 1;
      }
    }

    const [result] = await pool.query(
      `INSERT INTO transactions (user_id, category_id, type, amount, description, merchant, txn_date, auto_categorized)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, categoryId || null, type, amount, description || '', merchant || null, txnDate, autoCategorized]
    );

    res.status(201).json({
      transaction: {
        id: result.insertId,
        type,
        amount,
        description: description || '',
        merchant: merchant || null,
        txnDate,
        categoryId: categoryId || null,
        autoCategorized: Boolean(autoCategorized),
      },
    });
  } catch (err) {
    next(err);
  }
}

async function updateTransaction(req, res, next) {
  try {
    const { type, amount, description, merchant, txnDate, categoryId } = req.body;

    const [result] = await pool.query(
      `UPDATE transactions
       SET type = COALESCE(?, type),
           amount = COALESCE(?, amount),
           description = COALESCE(?, description),
           merchant = COALESCE(?, merchant),
           txn_date = COALESCE(?, txn_date),
           category_id = ?,
           auto_categorized = 0
       WHERE id = ? AND user_id = ?`,
      [type, amount, description, merchant, txnDate, categoryId || null, req.params.id, req.user.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

function csvField(value) {
  const str = value === null || value === undefined ? '' : String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

async function exportTransactions(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT t.txn_date, t.type, t.amount, t.description, t.merchant,
              COALESCE(c.name, 'Uncategorized') AS category_name
       FROM transactions t
       LEFT JOIN categories c ON c.id = t.category_id
       WHERE t.user_id = ?
       ORDER BY t.txn_date DESC, t.id DESC`,
      [req.user.id]
    );

    const header = 'Date,Type,Category,Description,Merchant,Amount';
    const lines = rows.map((r) =>
      [r.txn_date, r.type, r.category_name, r.description, r.merchant, r.amount].map(csvField).join(',')
    );
    const csv = [header, ...lines].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="transactions-${Date.now()}.csv"`);
    res.send(csv);
  } catch (err) {
    next(err);
  }
}

async function deleteTransaction(req, res, next) {
  try {
    const [result] = await pool.query(
      'DELETE FROM transactions WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { listTransactions, createTransaction, updateTransaction, deleteTransaction, exportTransactions };
