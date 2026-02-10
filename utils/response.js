/**
 * 统一响应格式工具
 */

const success = (res, data = null, message = 'success') => {
  res.json({
    code: 0,
    message,
    data,
  })
}

const error = (res, message = 'error', code = 1, statusCode = 400) => {
  res.status(statusCode).json({
    code,
    message,
    data: null,
  })
}

module.exports = { success, error }
