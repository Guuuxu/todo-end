# 社交型 Todo 自律监督系统 API

完整的后端 API 项目，用于个人开发者练手学习。

## 技术栈

- Node.js + Express
- MySQL + mysql2
- JWT 身份认证
- bcryptjs 密码加密
- RESTful API 设计

## 项目结构

```
social-todo-api/
├── app.js                      # 应用入口
├── package.json                # 依赖配置
├── .env.example                # 环境变量示例
├── config/                     # 配置文件
│   ├── database.js             # 数据库连接
│   └── jwt.js                  # JWT 配置
├── controllers/                # 控制器（业务逻辑）
│   ├── authController.js       # 认证
│   ├── userController.js       # 用户
│   ├── todoController.js       # Todo
│   ├── watcherController.js    # 监督
│   ├── commentController.js    # 评论
│   ├── likeController.js       # 点赞
│   └── rankingController.js    # 排行榜
├── routes/                     # 路由
│   ├── auth.js
│   ├── users.js
│   ├── todos.js
│   ├── comments.js
│   └── rankings.js
├── middleware/                 # 中间件
│   ├── auth.js                 # JWT 认证
│   ├── validator.js            # 参数验证
│   └── errorHandler.js         # 错误处理
├── utils/                      # 工具函数
│   └── response.js             # 统一响应
└── database/                   # 数据库
    └── schema.sql              # 建表 SQL
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=social_todo
JWT_SECRET=your_secret_key

# 微信小程序配置（可选）
# 如果不配置，将使用测试模式（直接使用 code 的哈希值作为 openid）
WECHAT_APPID=your_wechat_appid
WECHAT_SECRET=your_wechat_secret
```

### 3. 初始化数据库

#### 方法一：使用命令行

```bash
mysql -u root -p < database/schema.sql
```

#### 方法二：使用 Node.js 脚本（推荐）

```bash
node init-db.js
```

#### 方法三：手动执行

登录 MySQL 后执行 `database/schema.sql` 中的 SQL 语句。

### 4. （可选）导入示例数据

如果想快速体验功能，可以导入示例数据：

```bash
mysql -u root -p < database/seed.sql
```

示例用户密码都是：`password123`

### 5. 启动服务器

```bash
npm start        # 生产模式
npm run dev      # 开发模式（需安装 nodemon）
```

访问：http://localhost:3000

## API 接口

### 认证

- POST `/api/auth/register` - 注册
- POST `/api/auth/login` - 登录
- POST `/api/auth/wechat` - 微信授权登录（测试模式：无需配置 AppID）

### 用户

- GET `/api/users/me` - 获取当前用户
- GET `/api/users/search?username=xxx` - 搜索用户

### Todo

- GET `/api/todos` - 我的 Todo 列表
- GET `/api/todos/watching` - 我监督的 Todo
- GET `/api/todos/:id` - Todo 详情
- POST `/api/todos` - 创建 Todo
- PUT `/api/todos/:id` - 更新 Todo
- DELETE `/api/todos/:id` - 删除 Todo

### 监督

- POST `/api/todos/:id/watch` - 邀请监督人
- GET `/api/todos/:id/watchers` - 监督人列表
- DELETE `/api/todos/:id/watch/:watcherId` - 移除监督人

### 评论

- GET `/api/todos/:id/comments` - 评论列表
- POST `/api/todos/:id/comments` - 创建评论
- DELETE `/api/comments/:id` - 删除评论

### 点赞

- POST `/api/todos/:id/like` - 点赞
- DELETE `/api/todos/:id/like` - 取消点赞

### 排行榜

- GET `/api/rankings` - 排行榜（前20名）
- GET `/api/rankings/me` - 我的排名

## 响应格式

成功：

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

失败：

```json
{
  "code": 1,
  "message": "error message",
  "data": null
}
```

## 数据库设计

- **users** - 用户表
- **todos** - 待办表
- **todo_watchers** - 监督关系表
- **comments** - 评论表
- **likes** - 点赞表

## 核心功能

✅ JWT 认证  
✅ 权限控制  
✅ 社交功能（监督、评论、点赞）  
✅ 自律排行榜  
✅ 统一响应格式  
✅ 全局错误处理

## License

MIT
