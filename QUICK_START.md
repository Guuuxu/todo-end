# 快速启动指南

## 第一步：安装依赖

```bash
npm install
```

这将安装以下依赖：

- express - Web 框架
- mysql2 - MySQL 数据库驱动
- bcryptjs - 密码加密
- jsonwebtoken - JWT 认证
- dotenv - 环境变量管理
- cors - 跨域支持

## 第二步：配置环境变量

1. 复制环境变量示例文件：

```bash
copy .env.example .env
```

2. 编辑 `.env` 文件，修改数据库配置：

```env
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=你的数据库密码
DB_NAME=social_todo

JWT_SECRET=请修改为随机字符串
JWT_EXPIRES_IN=7d
```

## 第三步：初始化数据库

### 方法一：使用命令行

```bash
mysql -u root -p < database/schema.sql
```

### 方法二：使用 MySQL 客户端

1. 登录 MySQL：

```bash
mysql -u root -p
```

2. 执行 SQL 文件：

```sql
source database/schema.sql;
```

3. 验证表是否创建成功：

```sql
USE social_todo;
SHOW TABLES;
```

应该看到 5 个表：

- users
- todos
- todo_watchers
- comments
- likes

## 第四步：启动服务器

### 开发模式（推荐）

```bash
npm run dev
```

### 生产模式

```bash
npm start
```

启动成功后，你会看到：

```
✅ 数据库连接成功
🚀 服务器启动成功！
📍 地址: http://localhost:3000
```

## 第五步：测试 API

### 1. 测试根路径

```bash
curl http://localhost:3000
```

### 2. 注册用户

```bash
curl -X POST http://localhost:3000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"张三\",\"email\":\"zhangsan@example.com\",\"password\":\"password123\"}"
```

### 3. 登录获取 Token

```bash
curl -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"zhangsan@example.com\",\"password\":\"password123\"}"
```

保存返回的 token，后续请求需要使用。

### 4. 创建 Todo（需要 token）

```bash
curl -X POST http://localhost:3000/api/todos ^
  -H "Authorization: Bearer 你的token" ^
  -H "Content-Type: application/json" ^
  -d "{\"title\":\"每天跑步5公里\",\"description\":\"坚持运动\"}"
```

### 5. 获取我的 Todo 列表

```bash
curl -X GET http://localhost:3000/api/todos ^
  -H "Authorization: Bearer 你的token"
```

## 常见问题

### 1. 数据库连接失败

- 检查 MySQL 服务是否启动
- 检查 `.env` 文件中的数据库配置是否正确
- 确认数据库用户名和密码是否正确

### 2. 端口被占用

修改 `.env` 文件中的 PORT 为其他端口，如 3001

### 3. npm install 失败

尝试使用国内镜像：

```bash
npm install --registry=https://registry.npmmirror.com
```

### 4. nodemon 未找到

全局安装 nodemon：

```bash
npm install -g nodemon
```

或者只使用生产模式启动：

```bash
npm start
```

## 推荐工具

- **Postman** - API 测试工具
- **MySQL Workbench** - 数据库管理工具
- **VS Code** - 代码编辑器

## 下一步

- 阅读 `README.md` 了解完整的 API 文档
- 查看各个 controller 文件学习业务逻辑
- 尝试添加新功能扩展项目

祝你学习愉快！🎉
