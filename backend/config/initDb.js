const { pool } = require('./db');

const initDb = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS menu_items (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price INTEGER NOT NULL,
      description TEXT,
      is_available BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- For tables created earlier without the role column
    ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';

    -- Make sure the oldest account is the admin if no admin exists yet
    UPDATE users SET role = 'admin'
    WHERE id = (SELECT MIN(id) FROM users)
      AND NOT EXISTS (SELECT 1 FROM users WHERE role = 'admin');

    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
  `);

  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM menu_items');
  if (rows[0].count === 0) {
    await pool.query(`
      INSERT INTO menu_items (name, category, price) VALUES
      ('Chicken Shawarma', 'Shawarma', 100),
      ('Masala Dosa', 'South Indian', 70),
      ('Mango Milkshake', 'Milkshake', 80)
    `);
    console.log('Seeded sample menu items');
  }

  console.log('Tables ready: users, menu_items');
};

module.exports = initDb;