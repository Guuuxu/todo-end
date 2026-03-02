/**
 * Todo 控制器
 */

const { query } = require('../config/database')
const { success, error } = require('../utils/response')

const getMyTodos = async (req, res, next) => {
  try {
    // 未登录时直接返回空数组
    if (!req.user?.id) {
      return success(res, [])
    }

    const userId = req.user.id

    const todos = await query(
      `SELECT 
        t.*,
        (SELECT COUNT(*) FROM todo_watchers WHERE todo_id = t.id) as watcher_count,
        (SELECT COUNT(*) FROM likes WHERE todo_id = t.id) as like_count,
        (SELECT COUNT(*) FROM comments WHERE todo_id = t.id) as comment_count,
        (SELECT COUNT(*) FROM likes WHERE todo_id = t.id AND user_id = ?) as is_liked
      FROM todos t
      WHERE t.user_id = ?
      ORDER BY t.created_at DESC`,
      [userId, userId],
    )

    // 将 is_liked 转换为布尔值
    todos.forEach((todo) => {
      todo.is_liked = todo.is_liked > 0
    })

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
        u.avatar as creator_avatar,
        (SELECT COUNT(*) FROM todo_watchers WHERE todo_id = t.id) as watcher_count,
        (SELECT COUNT(*) FROM likes WHERE todo_id = t.id) as like_count,
        (SELECT COUNT(*) FROM comments WHERE todo_id = t.id) as comment_count,
        (SELECT COUNT(*) FROM likes WHERE todo_id = t.id AND user_id = ?) as is_liked
      FROM todos t
      INNER JOIN todo_watchers tw ON t.id = tw.todo_id
      INNER JOIN users u ON t.user_id = u.id
      WHERE tw.watcher_id = ?
      ORDER BY t.created_at DESC`,
      [userId, userId],
    )

    // 将 is_liked 转换为布尔值
    todos.forEach((todo) => {
      todo.is_liked = todo.is_liked > 0
    })

    success(res, todos)
  } catch (err) {
    next(err)
  }
}

const getTodoById = async (req, res, next) => {
  try {
    const todoId = req.params.id
    const currentUserId = req.user ? req.user.id : null

    // 构建 SQL 查询
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
    
    sql += ` FROM todos t WHERE t.id = ?`
    params.push(todoId)

    const todos = await query(sql, params)

    if (todos.length === 0) {
      return error(res, 'Todo 不存在', 1, 404)
    }

    const todo = todos[0]

    // 如果已登录，检查权限（未登录时允许所有人查看）
    if (currentUserId) {
      const isCreator = todo.user_id === currentUserId
      const isWatcher = await query(
        'SELECT id FROM todo_watchers WHERE todo_id = ? AND watcher_id = ?',
        [todoId, currentUserId],
      )

      if (!isCreator && isWatcher.length === 0) {
        return error(res, '无权访问此 Todo', 1, 403)
      }

      // 将 is_liked 转换为布尔值
      todo.is_liked = todo.is_liked > 0
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

const getUserTodos = async (req, res, next) => {
  try {
    const targetUserId = parseInt(req.params.user_id)
    const currentUserId = req.user ? req.user.id : null

    if (!targetUserId) {
      return error(res, '请提供有效的用户ID', 1, 400)
    }

    // 构建 SQL 查询
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

    success(res, todos)
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
  getUserTodos,
  getWatchingTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
}
