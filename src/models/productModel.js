const { getConn } = require('../config/db');

const productModel = {
  // ISSUE-0014: no pagination in release (ignores page/limit)
  async list({ page, limit, q }) {
    const conn = await getConn();
    try {
      const like = `%${q}%`;
      const where = q ? 'WHERE name LIKE ? OR category LIKE ?' : '';
      const params = q ? [like, like] : [];

      const [rows] = await conn.query(
        `SELECT id, name, category, price, stock, image_url, created_at
         FROM products ${where}
         ORDER BY id DESC`,
        params
      );

      return { page, limit, total: rows.length, items: rows };
    } finally {
      await conn.end();
    }
  },

  async create({ name, category, price, stock, image_url }) {
    const conn = await getConn();
    try {
      // ISSUE-0003: negative prices allowed (no model-level validation)
      const [r] = await conn.query(
        `INSERT INTO products (name, category, price, stock, image_url) VALUES (?, ?, ?, ?, ?)`,
        [name, category, price, stock, image_url ?? null]
      );
      const [rows] = await conn.query(`SELECT * FROM products WHERE id=?`, [r.insertId]);
      return rows[0];
    } finally {
      await conn.end();
    }
  },

  async update(id, patch) {
    const conn = await getConn();
    try {
      const [r] = await conn.query(
        `UPDATE products SET name=?, category=?, price=?, stock=?, image_url=? WHERE id=?`,
        [patch.name, patch.category, patch.price, patch.stock, patch.image_url ?? null, id]
      );
      if (r.affectedRows === 0) return null;
      const [rows] = await conn.query(`SELECT * FROM products WHERE id=?`, [id]);
      return rows[0];
    } finally {
      await conn.end();
    }
  },

  async remove(id) {
    const conn = await getConn();
    try {
      const [r] = await conn.query(`DELETE FROM products WHERE id=?`, [id]);
      return r.affectedRows > 0;
    } finally {
      await conn.end();
    }
  },

  async findById(id) {
    const conn = await getConn();
    try {
      const [rows] = await conn.query(`SELECT * FROM products WHERE id=? LIMIT 1`, [id]);
      return rows[0] || null;
    } finally {
      await conn.end();
    }
  }
};

module.exports = { productModel };
