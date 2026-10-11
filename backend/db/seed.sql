USE finance_dashboard;

-- Default global categories (user_id NULL) available to every account.
--
-- Colors follow a deliberately simple semantic scheme rather than a
-- categorical one: green for income, blue for investment income, red for
-- every expense, and orange singled out for subscriptions. Each color is
-- always paired with the category name as a visible label (badges, legends,
-- tooltips), so meaning never rides on hue alone.
--
-- Idempotency note: this can't lean on `ON DUPLICATE KEY UPDATE` against a
-- UNIQUE KEY (user_id, name) the way the categories a user creates can —
-- MySQL unique indexes treat every NULL as distinct from every other NULL,
-- so a unique key on a nullable user_id never actually catches "duplicate"
-- global categories (learned this the hard way: re-running the old version
-- of this script quietly doubled every default category). The LEFT JOIN /
-- WHERE NULL guard below re-runs safely and only inserts names that are
-- genuinely missing.
INSERT INTO categories (user_id, name, type, color, icon)
SELECT NULL, v.name, v.type, v.color, v.icon
FROM (
  SELECT 'Salary'         AS name, 'income'  AS type, '#16a34a' AS color, 'wallet'         AS icon
  UNION ALL SELECT 'Freelance',      'income',  '#16a34a', 'briefcase'
  UNION ALL SELECT 'Investments',    'income',  '#2563eb', 'trending-up'
  UNION ALL SELECT 'Food & Dining',  'expense', '#dc2626', 'utensils'
  UNION ALL SELECT 'Groceries',      'expense', '#dc2626', 'shopping-cart'
  UNION ALL SELECT 'Transportation', 'expense', '#dc2626', 'car'
  UNION ALL SELECT 'Housing',        'expense', '#dc2626', 'home'
  UNION ALL SELECT 'Utilities',      'expense', '#dc2626', 'zap'
  UNION ALL SELECT 'Entertainment',  'expense', '#dc2626', 'film'
  UNION ALL SELECT 'Shopping',       'expense', '#dc2626', 'shopping-bag'
  UNION ALL SELECT 'Health',         'expense', '#dc2626', 'heart-pulse'
  UNION ALL SELECT 'Education',      'expense', '#dc2626', 'book-open'
  UNION ALL SELECT 'Travel',         'expense', '#dc2626', 'plane'
  UNION ALL SELECT 'Subscriptions',  'expense', '#ea580c', 'repeat'
  UNION ALL SELECT 'EMI / Loans',    'expense', '#dc2626', 'landmark'
  UNION ALL SELECT 'Other',          'expense', '#dc2626', 'tag'
) AS v
LEFT JOIN categories c ON c.user_id IS NULL AND c.name = v.name
WHERE c.id IS NULL;

-- Existing installs: bring already-seeded rows in line with the new scheme
-- (the guard above only inserts missing names, it doesn't repaint existing ones).
UPDATE categories SET color = '#16a34a' WHERE user_id IS NULL AND type = 'income' AND name <> 'Investments';
UPDATE categories SET color = '#2563eb' WHERE user_id IS NULL AND name = 'Investments';
UPDATE categories SET color = '#dc2626' WHERE user_id IS NULL AND type = 'expense' AND name <> 'Subscriptions';
UPDATE categories SET color = '#ea580c' WHERE user_id IS NULL AND name = 'Subscriptions';
