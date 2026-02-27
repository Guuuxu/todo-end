/**
 * 数据库连接配置
 */

const mysql = require('mysql2')
require('dotenv').config()

// 创建数据库连接池
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'gu123456',
  database: process.env.DB_NAME || 'social_todo',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

const promisePool = pool.promise()

/**
 * 通用查询方法
 */
const query = async (sql, params = []) => {
  try {
    const [rows] = await promisePool.query(sql, params)
    return rows
  } catch (error) {
    console.error('数据库查询错误:', error)
    throw error
  }
}

/**
 * 测试数据库连接
 */
const testConnection = async () => {
  try {
    await promisePool.query('SELECT 1')
    console.log('✅ 数据库连接成功')
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message)
    process.exit(1)
  }
}

module.exports = { pool, promisePool, query, testConnection }
