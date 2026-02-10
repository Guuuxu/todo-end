/**
 * 请求参数验证中间件
 */

const { error } = require('../utils/response')

const validateRegister = (req, res, next) => {
  const { username, email, password } = req.body

  if (!username || username.trim().length < 2) {
    return error(res, '用户名至少需要2个字符')
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return error(res, '请提供有效的邮箱地址')
  }

  if (!password || password.length < 6) {
    return error(res, '密码至少需要6个字符')
  }

  next()
}

const validateLogin = (req, res, next) => {
  const { email, password } = req.body

  if (!email || !password) {
    return error(res, '邮箱和密码不能为空')
  }

  next()
}

const validateCreateTodo = (req, res, next) => {
  const { title } = req.body

  if (!title || title.trim().length === 0) {
    return error(res, '待办标题不能为空')
  }

  next()
}

const validateComment = (req, res, next) => {
  const { content } = req.body

  if (!content || content.trim().length === 0) {
    return error(res, '评论内容不能为空')
  }

  next()
}

module.exports = {
  validateRegister,
  validateLogin,
  validateCreateTodo,
  validateComment,
}
