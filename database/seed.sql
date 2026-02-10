-- ================================================
-- 示例数据（可选）
-- 用于演示和测试
-- ================================================

USE social_todo;

-- 插入测试用户
-- 注意：密码是 'password123' 经过 bcrypt 加密后的结果
-- 实际使用时需要通过注册接口创建用户
INSERT INTO users (username, email, password, avatar) VALUES
('张三', 'zhangsan@example.com', '$2a$10$XqZ8J5K5K5K5K5K5K5K5KuO8J5K5K5K5K5K5K5K5K5K5K5K5K5K5K', 'https://via.placeholder.com/150'),
('李四', 'lisi@example.com', '$2a$10$XqZ8J5K5K5K5K5K5K5K5KuO8J5K5K5K5K5K5K5K5K5K5K5K5K5K5K', 'https://via.placeholder.com/150'),
('王五', 'wangwu@example.com', '$2a$10$XqZ8J5K5K5K5K5K5K5K5KuO8J5K5K5K5K5K5K5K5K5K5K5K5K5K5K', 'https://via.placeholder.com/150');

-- 插入示例 Todo
INSERT INTO todos (user_id, title, description, is_completed, streak_count) VALUES
(1, '每天跑步 5 公里', '坚持运动，保持健康', 1, 5),
(1, '学习 Node.js', '完成后端项目开发', 0, 0),
(2, '阅读技术书籍', '每天阅读 30 分钟', 1, 3),
(2, '练习算法题', '每天至少 2 道题', 0, 0);

-- 插入监督关系
INSERT INTO todo_watchers (todo_id, watcher_id) VALUES
(1, 2),  -- 李四监督张三的跑步
(3, 1);  -- 张三监督李四的阅读

-- 插入评论
INSERT INTO comments (todo_id, user_id, content) VALUES
(1, 2, '加油！坚持就是胜利！'),
(1, 2, '今天完成了吗？'),
(3, 1, '很棒，继续保持！');

-- 插入点赞
INSERT INTO likes (todo_id, user_id) VALUES
(1, 2),
(3, 1);

-- 查看插入结果
SELECT '用户数据：' as '';
SELECT * FROM users;

SELECT 'Todo 数据：' as '';
SELECT * FROM todos;

SELECT '监督关系：' as '';
SELECT * FROM todo_watchers;

SELECT '评论数据：' as '';
SELECT * FROM comments;

SELECT '点赞数据：' as '';
SELECT * FROM likes;
