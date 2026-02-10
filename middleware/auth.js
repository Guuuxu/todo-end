/**
 * JWT 认证中间件
 */

const jwt = require('jsonwebtoken')
const jwtConfig = require('../config/jwt')
const { error } = require('../utils/response')

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return error(res, '未提供认证令牌', 401, 401)
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, jwtConfig.secret)

    req.user = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
    }

    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return error(res, '令牌已过期', 401, 401)
    }
    if (err.name === 'JsonWebTokenError') {
      return error(res, '无效的令牌', 401, 401)
    }
    return error(res, '认证失败', 401, 401)
  }
}

module.exports = authMiddleware
