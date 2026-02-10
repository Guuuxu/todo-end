/**
 * 排行榜路由
 */

const express = require('express')
const router = express.Router()
const rankingController = require('../controllers/rankingController')
const authMiddleware = require('../middleware/auth')

router.get('/', authMiddleware, rankingController.getRankings)
router.get('/me', authMiddleware, rankingController.getMyRanking)

module.exports = router
