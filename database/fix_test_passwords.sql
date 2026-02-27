-- ================================================
-- 修复测试账号密码
-- 如果数据库中已有测试用户，运行此脚本更新密码
-- ================================================

USE social_todo;

-- 更新测试用户的密码为正确的 bcrypt 哈希值
-- 密码：password123
UPDATE users SET password = '$2a$10$YK2onAaZ.Je50396/nGtiO6pRR6kqTvcK3rz4O3OvxdrOci1H9Waq' 
WHERE email IN ('zhangsan@example.com', 'lisi@example.com', 'wangwu@example.com');

-- 验证更新结果
SELECT id, username, email, LEFT(password, 20) as password_preview FROM users 
WHERE email IN ('zhangsan@example.com', 'lisi@example.com', 'wangwu@example.com');

