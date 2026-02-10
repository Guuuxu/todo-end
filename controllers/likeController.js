/**
 * 点赞控制器
 */

const { query } = require('../config/database')
const { success, error } = require('../utils/response')

const likeTodo = async (req, res, next) => {
  try {
    const todoId = req.params.id
    const userId = req.user.id

    await query('INSERT INTO likes (todo_id, user_id) VALUES (?, ?)', [
      todoId,
      userId,
    ])

    success(res, null, '点赞成功')
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return error(res, '已经点赞过了')
    }
    next(err)
  }
}

const unlikeTodo = async (req, res, next) => {
  try {
    const todoId = req.params.id
    const userId = req.user.id

    const result = await query(
      'DELETE FROM likes WHERE todo_id = ? AND user_id = ?',
      [todoId, userId],
    )

    if (result.affectedRows === 0) {
      return error(res, '尚未点赞', 1, 404)
    }

    success(res, null, '取消点赞成功')
  } catch (err) {
    next(err)
  }
}

module.exports = { likeTodo, unlikeTodo }
