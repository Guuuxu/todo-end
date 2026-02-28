-- 迁移脚本：为 users 表添加微信相关字段
-- 注意：如果列已存在，执行此脚本会报错，可以安全忽略
-- 如果 username 或 email 有 UNIQUE 约束，需要先手动删除约束

USE social_todo;

-- 添加 openid 字段（微信用户唯一标识）
ALTER TABLE users 
ADD COLUMN openid VARCHAR(100) UNIQUE 
AFTER password;

-- 添加 unionid 字段（微信开放平台统一标识，可选）
ALTER TABLE users 
ADD COLUMN unionid VARCHAR(100) 
AFTER openid;

-- 添加索引
ALTER TABLE users 
ADD INDEX idx_openid (openid);

-- 修改 email 和 username 为可空（微信登录可能没有这些信息）
-- 注意：如果字段有 UNIQUE 约束，需要先删除约束
-- 执行前请先检查：SHOW INDEX FROM users;
-- 如果有 UNIQUE 约束，先执行：
-- ALTER TABLE users DROP INDEX username;
-- ALTER TABLE users DROP INDEX email;

ALTER TABLE users 
MODIFY COLUMN email VARCHAR(100) NULL;

ALTER TABLE users 
MODIFY COLUMN username VARCHAR(50) NULL;

-- 重新添加索引（允许 NULL 值，但不设置 UNIQUE）
ALTER TABLE users 
ADD INDEX idx_username (username);

ALTER TABLE users 
ADD INDEX idx_email (email);

