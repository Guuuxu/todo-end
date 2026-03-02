/**
 * 可选 JWT 认证中间件
 * 如果 token 存在且有效，设置 req.user；如果不存在或无效，不设置但不报错
 */

const jwt = require('jsonwebtoken')
const jwtConfig = require('../config/jwt')

const optionalAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      try {
        const decoded = jwt.verify(token, jwtConfig.secret)
        req.user = {
          id: decoded.id,
          username: decoded.username,
          email: decoded.email,
        }
      } catch (err) {
        // token 无效或过期，但不报错，继续执行
        req.user = null
      }
    }

    next()
  } catch (err) {
    // 发生其他错误，继续执行
    next()
  }
}

module.exports = optionalAuthMiddleware

