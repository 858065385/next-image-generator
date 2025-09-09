# Vercel 环境变量批量管理指南

## 脚本总览

我为你创建了三个强大的脚本来管理 Vercel 环境变量：

1. **`vercel-env-batch.sh`** - 交互式批量管理工具
2. **`vercel-env-quick.sh`** - 快速命令行工具
3. **`vercel-env.sh`** - 完整的拉取/推送/删除工具

## 1. 交互式批量管理（推荐）

### 启动交互式工具
```bash
./vercel-env-batch.sh preview
```

### 功能特点
- 📋 查看当前所有环境变量
- 📝 拉取并在编辑器中批量修改
- 👀 预览变更前确认
- 💾 自动备份和恢复
- 🔄 智能更新（只修改有变化的变量）

### 使用流程
1. **查看当前变量** - 了解现状
2. **拉取并编辑** - 下载到本地编辑器
3. **预览变更** - 确认修改内容
4. **应用变更** - 批量更新到 Vercel

## 2. 快速命令行工具

### 基本语法
```bash
./vercel-env-quick.sh <environment> <operation> [args...]
```

### 常用操作

#### 查看所有变量
```bash
./vercel-env-quick.sh preview list
```

#### 拉取/推送文件
```bash
# 拉取到文件
./vercel-env-quick.sh preview pull .env.preview

# 从文件推送
./vercel-env-quick.sh preview push .env.preview
```

#### 添加/删除变量
```bash
# 添加变量
./vercel-env-quick.sh preview add API_KEY "abc123"

# 删除变量
./vercel-env-quick.sh preview rm API_KEY
```

#### 重命名和复制
```bash
# 重命名变量
./vercel-env-quick.sh preview rename OLD_KEY NEW_KEY

# 复制变量值
./vercel-env-quick.sh preview copy SOURCE_KEY TARGET_KEY
```

#### 批量修改前缀
```bash
# 将 CREEM_ 改为 PAYMENT_
./vercel-env-quick.sh preview prefix CREEM_ PAYMENT_
```

#### 导出变量
```bash
# 导出为 .env 格式
./vercel-env-quick.sh preview export
```

## 3. 实际使用场景

### 场景 1: 批量重命名变量
```bash
# 方法 1: 使用快速工具
./vercel-env-quick.sh preview prefix CREEM_ PAYMENT_

# 方法 2: 使用交互式工具
./vercel-env-batch.sh preview
# 选择 2 拉取并编辑
# 在编辑器中批量替换
# 选择 4 应用变更
```

### 场景 2: 从生产同步到预览
```bash
# 1. 导出生产变量
./vercel-env-quick.sh production export .env.production

# 2. 推送到预览环境
./vercel-env-quick.sh preview push .env.production
```

### 场景 3: 批量更新测试环境
```bash
# 使用交互式工具
./vercel-env-batch.sh preview
# 1. 查看当前变量
# 2. 拉取并编辑
# 3. 批量修改文件
# 4. 预览变更
# 5. 应用变更
```

## 高级技巧

### 1. 批量查找和替换
在交互式编辑器中，可以使用 Vim/VS Code 的批量替换功能：

```vim
# 在 Vim 中
:%s/CREEM_/PAYMENT_/g
```

### 2. 环境变量模板
创建模板文件 `.env.template`：
```bash
# 基础配置
DOMAIN=
API_URL=

# 认证
AUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# 支付
PAYMENT_API_KEY=
PAYMENT_WEBHOOK_SECRET=
```

然后快速应用到不同环境：
```bash
./vercel-env-quick.sh preview push .env.template
```

### 3. 备份和版本控制
```bash
# 创建环境快照
./vercel-env-quick.sh preview export .env.preview.$(date +%Y%m%d)

# 比较差异
diff .env.preview.20240101 .env.preview.20240102
```

## 安全注意事项

1. **敏感信息保护**
   - 不要将包含密钥的文件提交到 Git
   - 使用 `.gitignore` 排除 `.env.*` 文件
   - 定期轮换 API 密钥

2. **操作前备份**
   - 交互式工具会自动备份
   - 快速工具建议先导出备份

3. **测试环境验证**
   - 先在 preview 环境测试
   - 确认无误后再应用到 production

## 故障排除

### 常见错误

1. **"vercel: command not found"**
   ```bash
   npm install -g vercel
   vercel login
   ```

2. **"Permission denied"**
   ```bash
   chmod +x *.sh
   ```

3. **"jq: command not found"**
   ```bash
   # macOS
   brew install jq
   
   # Ubuntu
   apt-get install jq
   ```

### 调试技巧

1. **查看详细输出**
   ```bash
   vercel env ls preview --json
   ```

2. **检查环境连接**
   ```bash
   vercel list
   ```

3. **清理权限问题**
   ```bash
   vercel logout
   vercel login
   ```

## 最佳实践

1. **定期备份**
   - 每次重大变更前导出备份
   - 保留历史版本用于回滚

2. **环境隔离**
   - preview 用于测试新功能
   - production 保持稳定
   - 使用不同的 API 密钥

3. **文档化**
   - 记录每个变量的用途
   - 维护变更日志
   - 团队共享配置文档

现在你可以高效地管理 Vercel 环境变量了！