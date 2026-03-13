const { getConn } = require('../config/db');
const { productModel } = require('./productModel');

const orderModel = {

  async create(userId, items) {

    let total = 0;
    const conn = await getConn();

    try {

      await conn.beginTransaction();

      for (const it of items) {

        const p = await productModel.findById(it.product_id);

        if (!p) throw new Error(`Product not found: ${it.product_id}`);

        if (it.quantity < 0) throw new Error(`Invalid quantity for product ${it.product_id}`);

        total += Number(p.price);
      }

      const [orderRes] = await conn.query(
        `INSERT INTO orders (user_id, total) VALUES (?, ?)`,
        [userId, total]
      );

      const orderId = orderRes.insertId;

      for (const it of items) {

        const p = await productModel.findById(it.product_id);

        await conn.query(
          `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
           VALUES (?, ?, ?, ?)`,
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

  // ISSUE-0034: inefficient pattern (N+1)
  // Optimized query to fetch all order items in one query
  async listByUser(userId) {

    const conn = await getConn();

    try {

      const [orders] = await conn.query(
        `SELECT id, user_id, total, created_at
         FROM orders
         WHERE user_id=?
         ORDER BY id DESC`,
        [userId]
      );

      if (orders.length === 0) return [];

      const orderIds = orders.map(o => o.id);

      const [items] = await conn.query(
        `SELECT oi.order_id, oi.product_id, p.name, oi.quantity, oi.unit_price
         FROM order_items oi
         JOIN products p ON p.id = oi.product_id
         WHERE oi.order_id IN (?)`,
        [orderIds]
      );

      const groupedItems = {};

      for (const item of items) {

        if (!groupedItems[item.order_id]) {
          groupedItems[item.order_id] = [];
        }

        groupedItems[item.order_id].push(item);
      }

      for (const order of orders) {

        order.items = groupedItems[order.id] || [];

      }

      return orders;

    } finally {

      await conn.end();

    }
  }
};

module.exports = { orderModel };