/**
 * 评论路由
 */

const express = require('express')
const router = express.Router()
const commentController = require('../controllers/commentController')
const authMiddleware = require('../middleware/auth')

router.delete('/:id', authMiddleware, commentController.deleteComment)

module.exports = router
