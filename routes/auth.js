/**
 * 认证路由
 */

const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const {
  validateRegister,
  validateLogin,
  validateWechatLogin,
} = require('../middleware/validator')

router.post('/register', validateRegister, authController.register)
router.post('/login', validateLogin, authController.login)
router.post('/wechat', validateWechatLogin, authController.wechatLogin)

module.exports = router
