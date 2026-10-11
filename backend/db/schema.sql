-- Personal Finance Dashboard schema
-- Indexes are chosen to match the app's actual query patterns:
--   * transactions are always filtered by user_id + date range -> composite index
--   * dashboard aggregates GROUP BY category within a user/date range -> covering index
--   * budgets are looked up by user_id + period -> unique composite key doubles as index

CREATE DATABASE IF NOT EXISTS finance_dashboard
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE finance_dashboard;

CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(191) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  currency      VARCHAR(8) NOT NULL DEFAULT 'INR',
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS categories (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED NULL, -- NULL = global/default category, otherwise user-defined
  name       VARCHAR(60) NOT NULL,
  type       ENUM('income', 'expense') NOT NULL DEFAULT 'expense',
  color      VARCHAR(7) NOT NULL DEFAULT '#6366f1',
  icon       VARCHAR(40) NOT NULL DEFAULT 'tag',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_categories_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_categories_user_name (user_id, name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS transactions (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id       INT UNSIGNED NOT NULL,
  category_id   INT UNSIGNED NULL,
  type          ENUM('income', 'expense') NOT NULL,
  amount        DECIMAL(12,2) NOT NULL,
  description   VARCHAR(255) NOT NULL DEFAULT '',
  merchant      VARCHAR(120) NULL,
  txn_date      DATE NOT NULL,
  auto_categorized TINYINT(1) NOT NULL DEFAULT 0,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_transactions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_transactions_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  -- Covers "list/paginate a user's transactions in a date range" (the hottest query path)
  INDEX idx_txn_user_date (user_id, txn_date DESC),
  -- Covers "sum spending by category for a user in a date range" (dashboard pie chart)
  INDEX idx_txn_user_category_date (user_id, category_id, txn_date)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS budgets (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id      INT UNSIGNED NOT NULL,
  category_id  INT UNSIGNED NOT NULL,
  period       CHAR(7) NOT NULL, -- 'YYYY-MM'
  amount_limit DECIMAL(12,2) NOT NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_budgets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_budgets_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  UNIQUE KEY uq_budget_user_category_period (user_id, category_id, period)
) ENGINE=InnoDB;

-- Money moved INTO investments (SIPs, stock buys, FD deposits, ...) — distinct
-- from the "Investments" transaction category, which is for returns/payouts
-- coming back OUT. Tracked separately so contributions accumulate into a
-- running "total invested" figure without polluting expense analytics.
CREATE TABLE IF NOT EXISTS investments (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id       INT UNSIGNED NOT NULL,
  name          VARCHAR(120) NOT NULL,
  amount        DECIMAL(12,2) NOT NULL,
  invested_date DATE NOT NULL,
  notes         VARCHAR(255) NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_investments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_investments_user_date (user_id, invested_date DESC)
) ENGINE=InnoDB;
