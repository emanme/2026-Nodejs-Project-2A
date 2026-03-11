const mysql = require('mysql2/promise');


const CFG = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'store_db',
};


const pool = mysql.createPool(CFG);


async function getConn() {
  return pool.getConnection();
}

module.exports = { getConn, pool };
