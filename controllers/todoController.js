/**
 * Todo 控制器
 */

const { query } = require('../config/database')
const { success, error } = require('../utils/response')

const getMyTodos = async (req, res, next) => {
  try {
    const userId = req.user.id

    const todos = await query(
      `SELECT 
        t.*,
        (SELECT COUNT(*) FROM todo_watchers WHERE todo_id = t.id) as watcher_count,
        (SELECT COUNT(*) FROM likes WHERE todo_id = t.id) as like_count,
        (SELECT COUNT(*) FROM comments WHERE todo_id = t.id) as comment_count
      FROM todos t
      WHERE t.user_id = ?
      ORDER BY t.created_at DESC`,
      [userId],
    )

    success(res, todos)
  } catch (err) {
    next(err)
  }
}

const getWatchingTodos = async (req, res, next) => {
  try {
    const userId = req.user.id

    const todos = await query(
      `SELECT 
        t.*,
        u.username as creator_name,
        u.avatar as creator_avatar
      FROM todos t
      INNER JOIN todo_watchers tw ON t.id = tw.todo_id
      INNER JOIN users u ON t.user_id = u.id
      WHERE tw.watcher_id = ?
      ORDER BY t.created_at DESC`,
      [userId],
    )

    success(res, todos)
  } catch (err) {
    next(err)
  }
}

const getTodoById = async (req, res, next) => {
  try {
    const todoId = req.params.id
    const userId = req.user.id

    const todos = await query('SELECT * FROM todos WHERE id = ?', [todoId])

    if (todos.length === 0) {
      return error(res, 'Todo 不存在', 1, 404)
    }

    const todo = todos[0]

    // 权限检查
    const isCreator = todo.user_id === userId
    const isWatcher = await query(
      'SELECT id FROM todo_watchers WHERE todo_id = ? AND watcher_id = ?',
      [todoId, userId],
    )

    if (!isCreator && isWatcher.length === 0) {
      return error(res, '无权访问此 Todo', 1, 403)
    }

    success(res, todo)
  } catch (err) {
    next(err)
  }
}

const createTodo = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { title, description } = req.body

    const result = await query(
      'INSERT INTO todos (user_id, title, description) VALUES (?, ?, ?)',
      [userId, title, description || ''],
    )

    success(
      res,
      {
        id: result.insertId,
        user_id: userId,
        title,
        description,
      },
      'Todo 创建成功',
    )
  } catch (err) {
    next(err)
  }
}

const updateTodo = async (req, res, next) => {
  try {
    const todoId = req.params.id
    const userId = req.user.id
    const { title, description, is_completed } = req.body

    const todos = await query(
      'SELECT * FROM todos WHERE id = ? AND user_id = ?',
      [todoId, userId],
    )

    if (todos.length === 0) {
      return error(res, 'Todo 不存在或无权修改', 1, 404)
    }

    const todo = todos[0]
    const updates = []
    const params = []

    if (title !== undefined) {
      updates.push('title = ?')
      params.push(title)
    }

    if (description !== undefined) {
      updates.push('description = ?')
      params.push(description)
    }

    if (is_completed !== undefined) {
      updates.push('is_completed = ?')
      params.push(is_completed ? 1 : 0)

      if (is_completed && !todo.is_completed) {
        updates.push('streak_count = streak_count + 1')
      }
      if (!is_completed && todo.is_completed) {
        updates.push('streak_count = 0')
      }
    }

    if (updates.length === 0) {
      return error(res, '没有需要更新的字段')
    }

    params.push(todoId)

    await query(`UPDATE todos SET ${updates.join(', ')} WHERE id = ?`, params)

    success(res, null, 'Todo 更新成功')
  } catch (err) {
    next(err)
  }
}

const deleteTodo = async (req, res, next) => {
  try {
    const todoId = req.params.id
    const userId = req.user.id

    const todos = await query(
      'SELECT id FROM todos WHERE id = ? AND user_id = ?',
      [todoId, userId],
    )

    if (todos.length === 0) {
      return error(res, 'Todo 不存在或无权删除', 1, 404)
    }

    await query('DELETE FROM todos WHERE id = ?', [todoId])

    success(res, null, 'Todo 删除成功')
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getMyTodos,
  getWatchingTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
}
