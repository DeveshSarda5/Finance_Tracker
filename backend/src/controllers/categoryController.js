const pool = require('../config/db');

async function listCategories(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT id, user_id, name, type, color, icon
       FROM categories
       WHERE user_id IS NULL OR user_id = ?
       ORDER BY type, name`,
      [req.user.id]
    );
    res.json({ categories: rows });
  } catch (err) {
    next(err);
  }
}

async function createCategory(req, res, next) {
  try {
    const { name, type, color, icon } = req.body;
    if (!name || !['income', 'expense'].includes(type)) {
      return res.status(400).json({ error: 'name and a valid type (income|expense) are required' });
    }

    const [result] = await pool.query(
      'INSERT INTO categories (user_id, name, type, color, icon) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, name, type, color || '#6366f1', icon || 'tag']
    );

    res.status(201).json({
      category: { id: result.insertId, user_id: req.user.id, name, type, color: color || '#6366f1', icon: icon || 'tag' },
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'A category with this name already exists' });
    }
    next(err);
  }
}

async function deleteCategory(req, res, next) {
  try {
    const [result] = await pool.query(
      'DELETE FROM categories WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Category not found or not owned by you' });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { listCategories, createCategory, deleteCategory };
