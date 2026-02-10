/**
 * 监督控制器
 */

const { query } = require('../config/database')
const { success, error } = require('../utils/response')

const addWatcher = async (req, res, next) => {
  try {
    const todoId = req.params.id
    const userId = req.user.id
    const { watcher_id } = req.body

    if (!watcher_id) {
      return error(res, '请提供监督人ID')
    }

    const todos = await query(
      'SELECT id FROM todos WHERE id = ? AND user_id = ?',
      [todoId, userId],
    )

    if (todos.length === 0) {
      return error(res, 'Todo 不存在或无权操作', 1, 404)
    }

    if (watcher_id === userId) {
      return error(res, '不能邀请自己作为监督人')
    }

    await query(
      'INSERT INTO todo_watchers (todo_id, watcher_id) VALUES (?, ?)',
      [todoId, watcher_id],
    )

    success(res, null, '监督人添加成功')
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return error(res, '该用户已经是监督人')
    }
    next(err)
  }
}

const getWatchers = async (req, res, next) => {
  try {
    const todoId = req.params.id

    const watchers = await query(
      `SELECT 
        u.id,
        u.username,
        u.avatar,
        tw.created_at as watch_since
      FROM todo_watchers tw
      INNER JOIN users u ON tw.watcher_id = u.id
      WHERE tw.todo_id = ?`,
      [todoId],
    )

    success(res, watchers)
  } catch (err) {
    next(err)
  }
}

const removeWatcher = async (req, res, next) => {
  try {
    const todoId = req.params.id
    const watcherId = req.params.watcherId
    const userId = req.user.id

    const todos = await query(
      'SELECT id FROM todos WHERE id = ? AND user_id = ?',
      [todoId, userId],
    )

    if (todos.length === 0) {
      return error(res, 'Todo 不存在或无权操作', 1, 404)
    }

    await query(
      'DELETE FROM todo_watchers WHERE todo_id = ? AND watcher_id = ?',
      [todoId, watcherId],
    )

    success(res, null, '监督人移除成功')
  } catch (err) {
    next(err)
  }
}

module.exports = { addWatcher, getWatchers, removeWatcher }
