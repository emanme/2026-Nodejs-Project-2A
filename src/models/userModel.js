const { getConn } = require('../config/db');

const userModel = {
  async findByEmail(email) {
    const conn = await getConn();
    try {
      const [rows] = await conn.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
      return rows[0] || null;
    } finally {
      await conn.end();
    }
  },
  async findById(id) {
    const conn = await getConn();
    try {
      const [rows] = await conn.query('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
      return rows[0] || null;
    } finally {
      await conn.end();
    }
  },
  async create({ email, name, password_hash, role }) {
    const conn = await getConn();
    try {
      const [r] = await conn.query(
        'INSERT INTO users (email, name, password_hash, role) VALUES (?, ?, ?, ?)',
        [email, name, password_hash, role]
      );
      return { id: r.insertId, email, name, role };
    } finally {
      await conn.end();
    }
  }
};

module.exports = { userModel };
