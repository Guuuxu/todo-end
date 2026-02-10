/**
 * 社交型 Todo 自律监督系统 - 主入口文件
 */

const express = require('express')
const cors = require('cors')
require('dotenv').config()

const { testConnection } = require('./config/database')
const errorHandler = require('./middleware/errorHandler')

// 导入路由
const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/users')
const todoRoutes = require('./routes/todos')
const commentRoutes = require('./routes/comments')
const rankingRoutes = require('./routes/rankings')

const app = express()
const PORT = process.env.PORT || 3000

// 中间件配置
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 请求日志
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  next()
})

// 路由挂载
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/todos', todoRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/rankings', rankingRoutes)

// 根路径
app.get('/', (req, res) => {
  res.json({
    message: '欢迎使用社交型 Todo 自律监督系统 API',
    version: '1.0.0',
  })
})

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    code: 1,
    message: '接口不存在',
    data: null,
  })
})

// 全局错误处理
app.use(errorHandler)

// 启动服务器
const startServer = async () => {
  try {
    await testConnection()
    app.listen(PORT, () => {
      console.log(`\n🚀 服务器启动成功！`)
      console.log(`📍 地址: http://localhost:${PORT}\n`)
    })
  } catch (error) {
    console.error('服务器启动失败:', error)
    process.exit(1)
  }
}

startServer()

module.exports = app
