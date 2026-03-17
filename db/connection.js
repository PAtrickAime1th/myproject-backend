const mysql = require('mysql2/promise');
require('dotenv').config();

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'quiz_app',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Helper function to execute queries
const executeQuery = async (query, params = []) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(query, params);
    return rows;
  } finally {
    connection.release();
  }
};

module.exports = { pool, executeQuery };