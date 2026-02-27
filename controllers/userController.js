/**
 * 用户控制器
 */

const { query } = require('../config/database')
const { success, error } = require('../utils/response')

const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user.id

    const users = await query(
      'SELECT id, username, email, avatar, created_at FROM users WHERE id = ?',
      [userId],
    )

    if (users.length === 0) {
      return error(res, '用户不存在', 1, 404)
    }

    success(res, users[0])
  } catch (err) {
    next(err)
  }
}

const searchUsers = async (req, res, next) => {
  try {
    const { username } = req.query

    if (!username) {
      return error(res, '请提供搜索关键词')
    }

    const users = await query(
      'SELECT id, username, email, avatar FROM users WHERE username LIKE ? LIMIT 10',
      [`%${username}%`],
    )

    success(res, users)
  } catch (err) {
    next(err)
  }
}

const updateUser = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { username, avatar } = req.body

    const result = await query(
      'UPDATE users SET username = ?, avatar = ? WHERE id = ?',
      [username, avatar, userId],
    )

    success(res, result, '用户信息更新成功')
  } catch (err) {
    next(err)
  }
}

module.exports = { getCurrentUser, searchUsers, updateUser }
