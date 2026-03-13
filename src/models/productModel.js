const { getConn } = require('../config/db');

const productModel = {

  // LIST PRODUCTS WITH PAGINATION
  async list({ page = 1, limit = 10, q = "" }) {
    const conn = await getConn();
    try {

      page = Number(page) || 1;
      limit = Number(limit) || 10;

      const like = `%${q}%`;
      const where = q ? 'WHERE name LIKE ? OR category LIKE ?' : '';
      const params = q ? [like, like] : [];

      const offset = (page - 1) * limit;

      // Get products
      const [rows] = await conn.query(
        `SELECT id, name, category, price, stock, image_url, created_at
         FROM products
         ${where}
         ORDER BY id DESC
         LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );

      // Get total count for pagination
      const [countRows] = await conn.query(
        `SELECT COUNT(*) as total FROM products ${where}`,
        params
      );

      const total = countRows[0].total;

      return {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        items: rows
      };

    } finally {
      await conn.end();
    }
  },

  // CREATE PRODUCT
  async create({ name, category, price, stock, image_url }) {
    const conn = await getConn();
    try {

      if (price < 0) throw new Error("Price cannot be negative");
      if (stock < 0) throw new Error("Stock cannot be negative");

      const [r] = await conn.query(
        `INSERT INTO products (name, category, price, stock, image_url)
         VALUES (?, ?, ?, ?, ?)`,
        [name, category, price, stock, image_url ?? null]
      );

      const [rows] = await conn.query(
        `SELECT * FROM products WHERE id=?`,
        [r.insertId]
      );

      return rows[0];

    } finally {
      await conn.end();
    }
  },

  // UPDATE PRODUCT
  async update(id, patch) {
    const conn = await getConn();
    try {

      if (patch.price < 0) throw new Error("Price cannot be negative");
      if (patch.stock < 0) throw new Error("Stock cannot be negative");

      const [r] = await conn.query(
        `UPDATE products
         SET name=?, category=?, price=?, stock=?, image_url=?
         WHERE id=?`,
        [
          patch.name,
          patch.category,
          patch.price,
          patch.stock,
          patch.image_url ?? null,
          id
        ]
      );

      if (r.affectedRows === 0) return null;

      const [rows] = await conn.query(
        `SELECT * FROM products WHERE id=?`,
        [id]
      );

      return rows[0];

    } finally {
      await conn.end();
    }
  },

  // DELETE PRODUCT
  async remove(id) {
    const conn = await getConn();
    try {

      const [r] = await conn.query(
        `DELETE FROM products WHERE id=?`,
        [id]
      );

      return r.affectedRows > 0;

    } finally {
      await conn.end();
    }
  },

  // FIND PRODUCT BY ID
  async findById(id) {
    const conn = await getConn();
    try {

      const [rows] = await conn.query(
        `SELECT * FROM products WHERE id=? LIMIT 1`,
        [id]
      );

      return rows[0] || null;

    } finally {
      await conn.end();
    }
  }

};

module.exports = { productModel };