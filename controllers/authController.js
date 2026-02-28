/**
 * 认证控制器
 */

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const https = require('https')
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

/**
 * 微信授权登录
 */
const wechatLogin = async (req, res, next) => {
  try {
    const { code } = req.body

    if (!code) {
      return error(res, '缺少 code 参数', 1, 400)
    }

    // 从环境变量获取微信配置
    const appid = process.env.WECHAT_APPID
    const secret = process.env.WECHAT_SECRET

    if (!appid || !secret) {
      return error(res, '微信配置未设置', 1, 500)
    }

    // 通过 code 换取 openid
    const openid = await getWechatOpenId(code, appid, secret)

    if (!openid) {
      return error(res, '微信授权失败', 1, 401)
    }

    // 查找或创建用户
    let users = await query(
      'SELECT id, username, email, avatar, openid FROM users WHERE openid = ?',
      [openid],
    )

    let user

    if (users.length === 0) {
      // 新用户，创建账号
      // 生成唯一的默认用户名和邮箱（使用 openid 确保唯一性）
      const timestamp = Date.now()
      const defaultUsername = `微信用户_${openid.substring(0, 8)}_${timestamp}`
      const defaultEmail = `wx_${openid}_${timestamp}@wechat.temp`

      const result = await query(
        'INSERT INTO users (username, email, password, openid, avatar) VALUES (?, ?, ?, ?, ?)',
        [
          defaultUsername,
          defaultEmail,
          '', // 微信用户不需要密码
          openid,
          'https://via.placeholder.com/150',
        ],
      )

      user = {
        id: result.insertId,
        username: defaultUsername,
        email: defaultEmail,
        avatar: 'https://via.placeholder.com/150',
        openid,
      }
    } else {
      // 已存在用户
      user = users[0]
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
      '微信登录成功',
    )
  } catch (err) {
    next(err)
  }
}

/**
 * 通过 code 获取微信 openid
 */
function getWechatOpenId(code, appid, secret) {
  return new Promise((resolve, reject) => {
    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`

    https
      .get(url, (res) => {
        let data = ''

        res.on('data', (chunk) => {
          data += chunk
        })

        res.on('end', () => {
          try {
            const result = JSON.parse(data)

            if (result.errcode) {
              console.error('[微信登录] 获取 openid 失败:', result)
              resolve(null)
            } else {
              resolve(result.openid)
            }
          } catch (err) {
            console.error('[微信登录] 解析响应失败:', err)
            reject(err)
          }
        })
      })
      .on('error', (err) => {
        console.error('[微信登录] 请求失败:', err)
        reject(err)
      })
  })
}

module.exports = { register, login, wechatLogin }
