-- 迁移脚本：为 todos 表添加 description 列
-- 如果列已存在，执行此脚本会报错，可以安全忽略

USE social_todo;

-- 添加 description 列
-- 注意：如果列已存在，会报错 "Duplicate column name 'description'"，可以忽略
ALTER TABLE todos 
ADD COLUMN description TEXT 
AFTER title;

