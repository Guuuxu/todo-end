/**
 * 评论控制器
 */

const { query } = require('../config/database')
const { success, error } = require('../utils/response')

const getComments = async (req, res, next) => {
  try {
    const todoId = req.params.id

    const comments = await query(
      `SELECT 
        c.id,
        c.content,
        c.created_at,
        u.id as user_id,
        u.username,
        u.avatar
      FROM comments c
      INNER JOIN users u ON c.user_id = u.id
      WHERE c.todo_id = ?
      ORDER BY c.created_at DESC`,
      [todoId],
    )

    success(res, comments)
  } catch (err) {
    next(err)
  }
}

const createComment = async (req, res, next) => {
  try {
    const todoId = req.params.id
    const userId = req.user.id
    const { content } = req.body

    const result = await query(
      'INSERT INTO comments (todo_id, user_id, content) VALUES (?, ?, ?)',
      [todoId, userId, content],
    )

    success(
      res,
      {
        id: result.insertId,
        todo_id: todoId,
        user_id: userId,
        content,
      },
      '评论成功',
    )
  } catch (err) {
    next(err)
  }
}

const deleteComment = async (req, res, next) => {
  try {
    const commentId = req.params.id
    const userId = req.user.id

    const comments = await query(
      'SELECT id FROM comments WHERE id = ? AND user_id = ?',
      [commentId, userId],
    )

    if (comments.length === 0) {
      return error(res, '评论不存在或无权删除', 1, 404)
    }

    await query('DELETE FROM comments WHERE id = ?', [commentId])

    success(res, null, '评论删除成功')
  } catch (err) {
    next(err)
  }
}

module.exports = { getComments, createComment, deleteComment }
