-- 数据库迁移脚本：添加用户角色字段
-- 执行时间：2025-01-12
-- 描述：为 users 表添加 role 字段以支持权限管理

-- 添加 role 字段，默认值为 'user'
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'user';

-- 确保所有现有记录都有默认值
UPDATE users SET role = 'user' WHERE role IS NULL;

-- 验证更新
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as users_with_role FROM users WHERE role IS NOT NULL;
SELECT DISTINCT role FROM users;