/**
 * Todo 路由
 */

const express = require('express')
const router = express.Router()
const todoController = require('../controllers/todoController')
const watcherController = require('../controllers/watcherController')
const commentController = require('../controllers/commentController')
const likeController = require('../controllers/likeController')
const authMiddleware = require('../middleware/auth')
const optionalAuthMiddleware = require('../middleware/optionalAuth')
const {
  validateCreateTodo,
  validateComment,
} = require('../middleware/validator')

// Todo CRUD
// 具体路由必须在动态路由 /:id 之前定义，避免路由冲突

// 获取待办事项列表：通过 token 判断是否登录，未登录时返回空数组
router.get('/list', optionalAuthMiddleware, todoController.getMyTodos)
// 获取我监督的 Todo：需要登录（必须在 /:id 之前）
router.get('/watching', authMiddleware, todoController.getWatchingTodos)
// 获取指定用户的待办事项：无需登录（必须在 /:id 之前）
router.get('/user/:user_id', optionalAuthMiddleware, todoController.getUserTodos)

// 动态路由
// 查看评论：无需登录（必须在 /:id 之前，避免路由冲突）
router.get('/:id/comments', commentController.getComments)
// 查看待办详情：无需登录
router.get('/:id', todoController.getTodoById)

// 其他需要登录的接口
router.use(authMiddleware)
router.post('/', validateCreateTodo, todoController.createTodo)
router.put('/:id', todoController.updateTodo)
// 完成待办：标记完成或取消完成（必须在 /:id 之前，避免路由冲突）
router.post('/:id/complete', todoController.completeTodo)
router.delete('/:id', todoController.deleteTodo)

// 监督功能
router.post('/:id/watch', watcherController.addWatcher)
router.get('/:id/watchers', watcherController.getWatchers)
router.delete('/:id/watch/:watcherId', watcherController.removeWatcher)

// 评论功能
router.post('/:id/comments', validateComment, commentController.createComment)

// 点赞功能
router.post('/:id/like', likeController.likeTodo)
router.delete('/:id/like', likeController.unlikeTodo)

module.exports = router
