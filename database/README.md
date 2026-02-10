# 数据库文件说明

## 文件列表

### schema.sql（必需）

数据库结构文件，包含所有表的创建语句。

**使用方法：**

```bash
# 方法一：命令行
mysql -u root -p < database/schema.sql

# 方法二：Node.js 脚本
node init-db.js
```

### seed.sql（可选）

示例数据文件，用于快速体验项目功能。

**使用方法：**

```bash
# 先执行 schema.sql，再执行 seed.sql
mysql -u root -p < database/seed.sql
```

**注意：** 示例用户的密码都是 `password123`

## 数据库备份

### 备份整个数据库

```bash
mysqldump -u root -p social_todo > backup.sql
```

### 只备份结构（不含数据）

```bash
mysqldump -u root -p --no-data social_todo > schema.sql
```

### 只备份数据（不含结构）

```bash
mysqldump -u root -p --no-create-info social_todo > data.sql
```

### 备份特定表

```bash
mysqldump -u root -p social_todo users todos > backup_partial.sql
```

## 数据库恢复

### 恢复备份

```bash
mysql -u root -p social_todo < backup.sql
```

### 删除并重建数据库

```bash
mysql -u root -p -e "DROP DATABASE IF EXISTS social_todo; CREATE DATABASE social_todo;"
mysql -u root -p social_todo < database/schema.sql
```

## 数据库迁移

如果需要修改数据库结构，建议创建迁移文件：

```
database/
  ├── schema.sql          # 初始结构
  ├── seed.sql            # 示例数据
  └── migrations/         # 迁移文件
      ├── 001_add_avatar_field.sql
      ├── 002_add_category_table.sql
      └── ...
```

## 生产环境建议

1. **不要使用 seed.sql** - 生产环境只执行 schema.sql
2. **定期备份** - 使用 cron 定时备份数据库
3. **版本控制** - 数据库结构变更要记录在迁移文件中
4. **环境隔离** - 开发、测试、生产使用不同的数据库

## 常见问题

### Q: 如何查看当前数据库结构？

```sql
USE social_todo;
SHOW TABLES;
DESC users;
```

### Q: 如何清空所有数据但保留表结构？

```sql
TRUNCATE TABLE likes;
TRUNCATE TABLE comments;
TRUNCATE TABLE todo_watchers;
TRUNCATE TABLE todos;
TRUNCATE TABLE users;
```

### Q: 如何导出数据为 CSV？

```sql
SELECT * FROM users
INTO OUTFILE '/tmp/users.csv'
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n';
```
