/**
 * 全局错误处理中间件
 */

const errorHandler = (err, req, res, next) => {
  console.error('错误详情:', err)

  let statusCode = err.statusCode || 500
  let message = err.message || '服务器内部错误'

  // 数据库错误处理
  if (err.code === 'ER_DUP_ENTRY') {
    statusCode = 400
    message = '数据已存在，请勿重复操作'
  }

  res.status(statusCode).json({
    code: 1,
    message,
    data: null,
  })
}

module.exports = errorHandler
