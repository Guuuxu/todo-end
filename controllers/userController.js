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

const getUserById = async (req, res, next) => {
  try {
    const targetUserId = parseInt(req.params.id)
    const currentUserId = req.user ? req.user.id : null

    if (!targetUserId) {
      return error(res, '请提供有效的用户ID', 1, 400)
    }

    // 获取用户基本信息和统计数据
    const result = await query(
      `SELECT 
        u.id,
        u.username,
        u.avatar,
        u.created_at,
        COUNT(t.id) as total_todos,
        SUM(CASE WHEN t.is_completed = 1 THEN 1 ELSE 0 END) as completed_todos,
        SUM(t.streak_count) as total_streak,
        (SUM(CASE WHEN t.is_completed = 1 THEN 1 ELSE 0 END) * 10 + 
         SUM(t.streak_count) * 5) as score,
        (SELECT COUNT(*) FROM likes l 
         INNER JOIN todos t2 ON l.todo_id = t2.id 
         WHERE t2.user_id = u.id) as total_likes,
        (SELECT COUNT(*) FROM comments c 
         INNER JOIN todos t3 ON c.todo_id = t3.id 
         WHERE t3.user_id = u.id) as total_comments
      FROM users u
      LEFT JOIN todos t ON u.id = t.user_id
      WHERE u.id = ?
      GROUP BY u.id, u.username, u.avatar, u.created_at`,
      [targetUserId],
    )

    if (result.length === 0) {
      return error(res, '用户不存在', 1, 404)
    }

    const userInfo = result[0]

    // 获取该用户的待办事项列表
    let sql = `SELECT 
        t.*,
        (SELECT COUNT(*) FROM todo_watchers WHERE todo_id = t.id) as watcher_count,
        (SELECT COUNT(*) FROM likes WHERE todo_id = t.id) as like_count,
        (SELECT COUNT(*) FROM comments WHERE todo_id = t.id) as comment_count`
    
    const params = []
    
    if (currentUserId) {
      sql += `, (SELECT COUNT(*) FROM likes WHERE todo_id = t.id AND user_id = ?) as is_liked`
      params.push(currentUserId)
    }
    
    sql += ` FROM todos t WHERE t.user_id = ? ORDER BY t.created_at DESC`
    params.push(targetUserId)

    const todos = await query(sql, params)

    // 将 is_liked 转换为布尔值（仅当有登录用户时）
    if (currentUserId) {
      todos.forEach((todo) => {
        todo.is_liked = todo.is_liked > 0
      })
    }

    // 组合返回数据
    userInfo.todos = todos

    success(res, userInfo)
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

module.exports = { getCurrentUser, getUserById, searchUsers, updateUser }
