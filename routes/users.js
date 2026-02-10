/**
 * 用户路由
 */

const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const authMiddleware = require('../middleware/auth')

router.get('/me', authMiddleware, userController.getCurrentUser)
router.get('/search', authMiddleware, userController.searchUsers)

module.exports = router
