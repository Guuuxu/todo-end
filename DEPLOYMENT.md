# 🚀 部署指南

## 本地开发环境

已经完成！按照 README.md 的步骤即可。

## 📦 项目交付清单

### 需要上传到 Git 的文件

✅ 所有源代码文件  
✅ `database/schema.sql` - 数据库结构  
✅ `database/seed.sql` - 示例数据（可选）  
✅ `.env.example` - 环境变量示例  
✅ `package.json` - 依赖配置  
✅ `README.md` - 项目说明  
✅ `.gitignore` - Git 忽略配置

### 不要上传的文件

❌ `.env` - 包含敏感信息（密码、密钥）  
❌ `node_modules/` - 依赖包（太大）  
❌ 数据库备份文件（.sql 备份）  
❌ 日志文件

## 🌐 部署到服务器

### 1. 准备服务器环境

```bash
# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 MySQL
sudo apt-get install mysql-server

# 安装 PM2（进程管理器）
npm install -g pm2
```

### 2. 克隆项目

```bash
git clone https://github.com/Guuuxu/todo-end.git
cd todo-end
npm install
```

### 3. 配置环境变量

```bash
cp .env.example .env
nano .env  # 编辑配置
```

修改为生产环境配置：

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=生产环境密码
DB_NAME=social_todo
JWT_SECRET=生产环境随机密钥（至少32位）
```

### 4. 初始化数据库

```bash
mysql -u root -p < database/schema.sql
```

### 5. 启动服务

```bash
# 使用 PM2 启动（推荐）
pm2 start app.js --name "todo-api"

# 查看状态
pm2 status

# 查看日志
pm2 logs todo-api

# 设置开机自启
pm2 startup
pm2 save
```

## ☁️ 部署到云平台

### Heroku 部署

1. **安装 Heroku CLI**

```bash
npm install -g heroku
```

2. **登录并创建应用**

```bash
heroku login
heroku create todo-api-app
```

3. **添加 MySQL 插件**

```bash
heroku addons:create cleardb:ignite
```

4. **配置环境变量**

```bash
heroku config:set JWT_SECRET=your_secret_key
```

5. **部署**

```bash
git push heroku main
```

6. **初始化数据库**

```bash
heroku run bash
mysql -h <host> -u <user> -p < database/schema.sql
```

### Railway 部署（推荐）

1. 访问 https://railway.app
2. 连接 GitHub 仓库
3. 添加 MySQL 数据库
4. 配置环境变量
5. 自动部署

### Vercel 部署

Vercel 主要用于前端，后端建议使用 Railway 或 Heroku。

## 🔒 生产环境安全建议

### 1. 环境变量

```env
# 使用强密码
DB_PASSWORD=复杂的随机密码

# 使用长随机字符串作为 JWT 密钥
JWT_SECRET=至少32位的随机字符串

# 缩短 Token 有效期
JWT_EXPIRES_IN=1d
```

### 2. 数据库安全

```sql
-- 创建专用数据库用户（不要用 root）
CREATE USER 'todoapp'@'localhost' IDENTIFIED BY '强密码';
GRANT ALL PRIVILEGES ON social_todo.* TO 'todoapp'@'localhost';
FLUSH PRIVILEGES;
```

### 3. 启用 HTTPS

使用 Nginx 反向代理并配置 SSL 证书（Let's Encrypt）。

### 4. 限流保护

安装 express-rate-limit：

```bash
npm install express-rate-limit
```

### 5. 日志记录

安装 winston：

```bash
npm install winston
```

## 📊 数据库备份策略

### 自动备份脚本

创建 `backup.sh`：

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/mysql"
DB_NAME="social_todo"

mkdir -p $BACKUP_DIR

mysqldump -u root -p$DB_PASSWORD $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# 只保留最近7天的备份
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete

echo "Backup completed: backup_$DATE.sql"
```

### 设置定时任务

```bash
# 编辑 crontab
crontab -e

# 每天凌晨2点备份
0 2 * * * /path/to/backup.sh
```

## 🔄 更新部署

### 1. 拉取最新代码

```bash
git pull origin main
```

### 2. 安装新依赖

```bash
npm install
```

### 3. 执行数据库迁移（如果有）

```bash
mysql -u root -p < database/migrations/xxx.sql
```

### 4. 重启服务

```bash
pm2 restart todo-api
```

## 📈 监控和维护

### 查看服务状态

```bash
pm2 status
pm2 monit
```

### 查看日志

```bash
pm2 logs todo-api --lines 100
```

### 性能监控

```bash
pm2 install pm2-server-monit
```

## 🆘 故障排查

### 服务无法启动

```bash
# 查看详细日志
pm2 logs todo-api --err

# 检查端口占用
netstat -ano | findstr :3000

# 检查数据库连接
node test-db.js
```

### 数据库连接失败

1. 检查 MySQL 服务是否运行
2. 检查 `.env` 配置是否正确
3. 检查防火墙设置

## 📝 部署检查清单

- [ ] 代码已推送到 Git
- [ ] `.env` 配置正确
- [ ] 数据库已初始化
- [ ] 依赖已安装
- [ ] 服务正常启动
- [ ] API 接口可访问
- [ ] 数据库备份已配置
- [ ] 日志记录正常
- [ ] 监控已设置

## 🎯 下一步

- 配置域名和 SSL
- 设置 CDN 加速
- 添加监控告警
- 优化数据库性能
- 实现负载均衡
