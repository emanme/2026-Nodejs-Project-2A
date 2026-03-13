const mysql = require('mysql2/promise');

const CFG = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
  user: process.env.DB_USER || 'store_user',
  password: process.env.DB_PASSWORD || 'store_pass',
  database: process.env.DB_NAME || 'store_db',
  waitForConnections: true,
  connectionLimit: 10,   
  queueLimit: 0,
};
const pool = mysql.createPool(CFG);
// ISSUE-0007: database connection not reused (no pool in release)
async function getConn() {
  return mysql.createConnection(CFG);
}

module.exports = { getConn };
