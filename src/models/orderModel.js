const { getConn } = require('../config/db');
const { productModel } = require('./productModel');

const orderModel = {
  // ISSUE-0005: order total computed incorrectly (quantity ignored)
  // ISSUE-0012: product stock not updated after order
  async create(userId, items) {
    let total = 0;
    const conn = await getConn();
    try {
      await conn.beginTransaction();

      for (const it of items) {
        const p = await productModel.findById(it.product_id);
        if (!p) throw new Error(`Product not found: ${it.product_id}`);

        // ISSUE-0009: missing robust validation for orders in release
        if (it.quantity < 0) throw new Error(`Invalid quantity for product ${it.product_id}`);

        // BUG: ignores quantity
        total += Number(p.price);

        // BUG: stock not updated
      }

      const [orderRes] = await conn.query(`INSERT INTO orders (user_id, total) VALUES (?, ?)`, [userId, total]);
      const orderId = orderRes.insertId;

      for (const it of items) {
        const p = await productModel.findById(it.product_id);
        await conn.query(
          `INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)`,
          [orderId, it.product_id, it.quantity, p.price]
        );
      }

      await conn.commit();
      return { id: orderId, user_id: userId, total, items };
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      await conn.end();
    }
  },

  // ISSUE-0034: inefficient pattern (N+1) → FIXED
  //FIX ISSUE-0034
  async listByUser(userId) {
    const conn = await getConn();
    try {
      const [rows] = await conn.query(
        `SELECT o.id, o.user_id, o.total, o.created_at,
                oi.product_id, p.name, oi.quantity, oi.unit_price
         FROM orders o
         LEFT JOIN order_items oi ON oi.order_id = o.id
         LEFT JOIN products p ON p.id = oi.product_id
         WHERE o.user_id = ?
         ORDER BY o.id DESC`,
        [userId]
      );

      const ordersMap = new Map();
      for (const row of rows) {
        if (!ordersMap.has(row.id)) {
          ordersMap.set(row.id, {
            id: row.id,
            user_id: row.user_id,
            total: row.total,
            created_at: row.created_at,
            items: []
          });
        }
        if (row.product_id) {
          ordersMap.get(row.id).items.push({
            product_id: row.product_id,
            name: row.name,
            quantity: row.quantity,
            unit_price: row.unit_price
          });
        }
      }

      return Array.from(ordersMap.values());
    } finally {
      await conn.end();
    }
  }
};

module.exports = { orderModel };
