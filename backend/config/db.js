require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is missing. Check your .env file.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err.message);
});

const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() AS time, current_database() AS db');
    client.release();
    console.log('Supabase connected');
    console.log('Database:', result.rows[0].db);
    console.log('Server time:', result.rows[0].time);
    return true;
  } catch (err) {
    console.error('Supabase connection failed');
    console.error('Reason:', err.message);
    return false;
  }
};

module.exports = { pool, testConnection };