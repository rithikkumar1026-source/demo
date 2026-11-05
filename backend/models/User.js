const { pool } = require('../config/db');

const User = {
  // The very first user becomes admin, everyone after is a normal user
  async create(email, passwordHash) {
    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash, role)
       VALUES ($1, $2, CASE WHEN (SELECT COUNT(*) FROM users) = 0 THEN 'admin' ELSE 'user' END)
       RETURNING id, email, role, created_at`,
      [email, passwordHash]
    );
    return rows[0];
  },

  async findByEmail(email) {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return rows[0];
  },

  async findById(id) {
    const { rows } = await pool.query(
      'SELECT id, email, role, created_at FROM users WHERE id = $1',
      [id]
    );
    return rows[0];
  },

  async count() {
    const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM users');
    return rows[0].count;
  },
};

module.exports = User;