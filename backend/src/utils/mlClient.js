const pool = require('../config/db');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
const MIN_CONFIDENCE = 0.35;

/**
 * Asks the Python ML microservice to predict a category for a transaction
 * description, then resolves that category name to an id. Never throws —
 * categorization is a nice-to-have, so any failure (service down, timeout,
 * unrecognized label) just falls back to "no suggestion".
 */
async function suggestCategory(text) {
  if (!text) return null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);

    const response = await fetch(`${ML_SERVICE_URL}/predict-category`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) return null;
    const data = await response.json();
    if (!data.category || data.confidence < MIN_CONFIDENCE) return null;

    const [rows] = await pool.query(
      'SELECT id FROM categories WHERE name = ? AND (user_id IS NULL) LIMIT 1',
      [data.category]
    );
    if (!rows[0]) return null;

    return { categoryId: rows[0].id, confidence: data.confidence };
  } catch (err) {
    return null;
  }
}

module.exports = { suggestCategory };
