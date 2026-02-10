/**
 * 排行榜控制器
 */

const { query } = require('../config/database')
const { success } = require('../utils/response')

const getRankings = async (req, res, next) => {
  try {
    const rankings = await query(
      `SELECT 
        u.id,
        u.username,
        u.avatar,
        COUNT(t.id) as total_todos,
        SUM(CASE WHEN t.is_completed = 1 THEN 1 ELSE 0 END) as completed_todos,
        SUM(t.streak_count) as total_streak,
        (SUM(CASE WHEN t.is_completed = 1 THEN 1 ELSE 0 END) * 10 + 
         SUM(t.streak_count) * 5) as score
      FROM users u
      LEFT JOIN todos t ON u.id = t.user_id
      GROUP BY u.id, u.username, u.avatar
      HAVING total_todos > 0
      ORDER BY score DESC, completed_todos DESC
      LIMIT 20`,
    )

    const rankedList = rankings.map((item, index) => ({
      rank: index + 1,
      ...item,
    }))

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
         SUM(t.streak_count) * 5) as score
      FROM users u
      LEFT JOIN todos t ON u.id = t.user_id
      WHERE u.id = ?
      GROUP BY u.id, u.username, u.avatar`,
      [userId],
    )

    success(res, result[0] || {})
  } catch (err) {
    next(err)
  }
}

module.exports = { getRankings, getMyRanking }
