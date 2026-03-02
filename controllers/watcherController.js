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

    // 检查 Todo 是否存在且是当前用户创建的
    const todos = await query(
      'SELECT id FROM todos WHERE id = ? AND user_id = ?',
      [todoId, userId],
    )

    if (todos.length === 0) {
      return error(res, 'Todo 不存在或无权操作', 1, 404)
    }

    // 不能邀请自己作为监督人
    if (watcher_id === userId) {
      return error(res, '不能邀请自己作为监督人')
    }

    // 检查被邀请的用户是否存在
    const users = await query('SELECT id FROM users WHERE id = ?', [
      watcher_id,
    ])

    if (users.length === 0) {
      return error(res, '被邀请的用户不存在', 1, 404)
    }

    // 检查是否已经是监督人
    const existingWatchers = await query(
      'SELECT id FROM todo_watchers WHERE todo_id = ? AND watcher_id = ?',
      [todoId, watcher_id],
    )

    if (existingWatchers.length > 0) {
      return error(res, '该用户已经是监督人')
    }

    await query(
      'INSERT INTO todo_watchers (todo_id, watcher_id) VALUES (?, ?)',
      [todoId, watcher_id],
    )

    success(res, null, '监督人添加成功')
  } catch (err) {
    next(err)
  }
}

const getWatchers = async (req, res, next) => {
  try {
    const todoId = req.params.id
    const userId = req.user.id

    // 检查 Todo 是否存在
    const todos = await query('SELECT id, user_id FROM todos WHERE id = ?', [
      todoId,
    ])

    if (todos.length === 0) {
      return error(res, 'Todo 不存在', 1, 404)
    }

    const todo = todos[0]

    // 权限检查：只有创建者或监督人可以查看监督人列表
    const isCreator = todo.user_id === userId
    const isWatcher = await query(
      'SELECT id FROM todo_watchers WHERE todo_id = ? AND watcher_id = ?',
      [todoId, userId],
    )

    if (!isCreator && isWatcher.length === 0) {
      return error(res, '无权查看此 Todo 的监督人', 1, 403)
    }

    const watchers = await query(
      `SELECT 
        u.id,
        u.username,
        u.avatar,
        tw.created_at as watch_since
      FROM todo_watchers tw
      INNER JOIN users u ON tw.watcher_id = u.id
      WHERE tw.todo_id = ?
      ORDER BY tw.created_at DESC`,
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
