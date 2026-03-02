/**
 * 用户路由
 */

const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const authMiddleware = require('../middleware/auth')

// 需要登录的接口（必须在 /:id 之前，避免路由冲突）
router.use(authMiddleware)
router.get('/me', userController.getCurrentUser)
router.put('/update', userController.updateUser)
router.get('/search', userController.searchUsers)

// 获取用户详情：无需登录（放在最后，避免拦截上面的路由）
router.get('/:id', userController.getUserById)

module.exports = router
