require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { getConn } = require('../src/config/db');

(async () => {
  const sqlPath = path.join(__dirname, 'init.sql');
  const sql = fs.readFileSync(sqlPath, 'utf-8');

  const conn = await getConn();
  try {
    await conn.query(sql);

    const seed = [
      { name: 'USB-C Cable', category: 'Accessories', price: 199.00, stock: 50, image_url: null },
      { name: 'Wireless Mouse', category: 'Peripherals', price: 599.00, stock: 30, image_url: null },
      { name: 'Mechanical Keyboard', category: 'Peripherals', price: 1999.00, stock: 20, image_url: null }
    ];

    for (const p of seed) {
      await conn.query(
        `INSERT INTO products (name, category, price, stock, image_url)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE price=VALUES(price), stock=VALUES(stock)`,
        [p.name, p.category, p.price, p.stock, p.image_url]
      );
    }

    console.log('[db:init] OK');
  } catch (e) {
    console.error('[db:init] FAILED', e);
    process.exitCode = 1;
  } finally {
    await conn.end();
  }
})();
