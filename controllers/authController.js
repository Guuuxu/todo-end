/**
 * 认证控制器
 */

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { query } = require('../config/database')
const jwtConfig = require('../config/jwt')
const { success, error } = require('../utils/response')

/**
 * 用户注册
 */
const register = async (req, res, next) => {
  try {
    const { username, email, password, avatar } = req.body

    // 检查用户名是否已存在
    const existingUser = await query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email],
    )

    if (existingUser.length > 0) {
      return error(res, '用户名或邮箱已被注册')
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10)

    // 插入新用户
    const result = await query(
      'INSERT INTO users (username, email, password, avatar) VALUES (?, ?, ?, ?)',
      [
        username,
        email,
        hashedPassword,
        avatar || 'https://via.placeholder.com/150',
      ],
    )

    success(
      res,
      {
        id: result.insertId,
        username,
        email,
      },
      '注册成功',
    )
  } catch (err) {
    next(err)
  }
}

/**
 * 用户登录
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    const users = await query(
      'SELECT id, username, email, password, avatar FROM users WHERE email = ?',
      [email],
    )

    if (users.length === 0) {
      return error(res, '邮箱或密码错误', 1, 401)
    }

    const user = users[0]

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return error(res, '邮箱或密码错误', 1, 401)
    }

    // 生成 JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn },
    )

    success(
      res,
      {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
        },
      },
      '登录成功',
    )
  } catch (err) {
    next(err)
  }
}

module.exports = { register, login }
