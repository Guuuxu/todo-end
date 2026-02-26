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
const {
  validateCreateTodo,
  validateComment,
} = require('../middleware/validator')

router.use(authMiddleware)

// Todo CRUD
router.get('/list', todoController.getMyTodos)
router.get('/watching', todoController.getWatchingTodos)
router.get('/:id', todoController.getTodoById)
router.post('/', validateCreateTodo, todoController.createTodo)
router.put('/:id', todoController.updateTodo)
router.delete('/:id', todoController.deleteTodo)

// 监督功能
router.post('/:id/watch', watcherController.addWatcher)
router.get('/:id/watchers', watcherController.getWatchers)
router.delete('/:id/watch/:watcherId', watcherController.removeWatcher)

// 评论功能
router.get('/:id/comments', commentController.getComments)
router.post('/:id/comments', validateComment, commentController.createComment)

// 点赞功能
router.post('/:id/like', likeController.likeTodo)
router.delete('/:id/like', likeController.unlikeTodo)

module.exports = router
