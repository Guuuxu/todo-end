/**
 * 排行榜路由
 */

const express = require('express')
const router = express.Router()
const rankingController = require('../controllers/rankingController')
const authMiddleware = require('../middleware/auth')

// 排行榜列表：无需登录即可访问
router.get('/', rankingController.getRankings)
// 获取我的排名：无需登录，可通过 user_id 查询参数指定用户（必须在 /:user_id 之前，避免路由冲突）
router.get('/me', rankingController.getMyRanking)
// 获取指定用户的排名详情：无需登录
router.get('/:user_id', rankingController.getUserRanking)

module.exports = router
