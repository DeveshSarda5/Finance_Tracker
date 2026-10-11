require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  const schema = fs.readFileSync(path.join(__dirname, '../../db/schema.sql'), 'utf8');
  const seed = fs.readFileSync(path.join(__dirname, '../../db/seed.sql'), 'utf8');

  console.log('Applying schema...');
  await connection.query(schema);
  console.log('Applying seed data...');
  await connection.query(seed);

  await connection.end();
  console.log('Database ready.');
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
