const { pool } = require('../config/db');

const MenuItem = {
  async getAll(category) {
    if (category) {
      const { rows } = await pool.query(
        'SELECT * FROM menu_items WHERE category = $1 ORDER BY id',
        [category]
      );
      return rows;
    }
    const { rows } = await pool.query('SELECT * FROM menu_items ORDER BY category, id');
    return rows;
  },

  async create({ name, category, price, description, is_available }) {
    const { rows } = await pool.query(
      `INSERT INTO menu_items (name, category, price, description, is_available)
       VALUES ($1, $2, $3, $4, COALESCE($5, TRUE)) RETURNING *`,
      [name, category, price, description || null, is_available]
    );
    return rows[0];
  },

  async update(id, { name, category, price, description, is_available }) {
    const { rows } = await pool.query(
      `UPDATE menu_items SET
         name = COALESCE($2, name),
         category = COALESCE($3, category),
         price = COALESCE($4, price),
         description = COALESCE($5, description),
         is_available = COALESCE($6, is_available)
       WHERE id = $1 RETURNING *`,
      [id, name, category, price, description, is_available]
    );
    return rows[0];
  },

  async remove(id) {
    const { rowCount } = await pool.query('DELETE FROM menu_items WHERE id = $1', [id]);
    return rowCount > 0;
  },
};

module.exports = MenuItem;