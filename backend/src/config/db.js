const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'finance_dashboard',
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
  decimalNumbers: true,
  // txn_date is a plain calendar DATE with no time component. Without this,
  // mysql2 hands back a JS Date at local midnight, and JSON.stringify (via
  // Date#toJSON -> toISOString) converts that to UTC — shifting the date to
  // the previous day for any timezone ahead of UTC. Keep it a plain string.
  dateStrings: ['DATE'],
});

module.exports = pool;
