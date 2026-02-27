/**
 * 排行榜控制器
 */

const { query } = require('../config/database')
const { success } = require('../utils/response')

const getRankings = async (req, res, next) => {
  try {
    const { type } = req.query

    // 根据 type 参数决定排序方式
    let orderBy = 'ORDER BY score DESC, completed_todos DESC'
    if (type === 'completed') {
      // 按完成数排序
      orderBy = 'ORDER BY completed_todos DESC, total_streak DESC'
    } else if (type === 'likes') {
      // 按点赞数排序（使用子查询表达式）
      orderBy = `ORDER BY (SELECT COUNT(*) FROM likes l 
         INNER JOIN todos t2 ON l.todo_id = t2.id 
         WHERE t2.user_id = u.id) DESC, completed_todos DESC`
    }

    const rankings = await query(
      `SELECT 
        u.id,
        u.username,
        u.avatar,
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
      GROUP BY u.id, u.username, u.avatar
      HAVING total_todos > 0
      ${orderBy}
      LIMIT 20`,
    )

    // 为每个用户查询待办事项
    const rankedList = await Promise.all(
      rankings.map(async (item, index) => {
        const todos = await query(
          `SELECT 
            t.*,
            (SELECT COUNT(*) FROM todo_watchers WHERE todo_id = t.id) as watcher_count,
            (SELECT COUNT(*) FROM likes WHERE todo_id = t.id) as like_count,
            (SELECT COUNT(*) FROM comments WHERE todo_id = t.id) as comment_count
          FROM todos t
          WHERE t.user_id = ?
          ORDER BY t.created_at DESC`,
          [item.id],
        )

        return {
          rank: index + 1,
          ...item,
          todos,
        }
      }),
    )

    success(res, rankedList)
  } catch (err) {
    next(err)
  }
}

const getMyRanking = async (req, res, next) => {
  try {
    const userId = req.user.id

    const result = await query(
      `SELECT 
        u.id,
        u.username,
        u.avatar,
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
      GROUP BY u.id, u.username, u.avatar`,
      [userId],
    )

    const userRanking = result[0] || {}

    // 如果用户存在，查询其待办事项
    if (userRanking.id) {
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

      userRanking.todos = todos
    }

    success(res, userRanking)
  } catch (err) {
    next(err)
  }
}

module.exports = { getRankings, getMyRanking }
