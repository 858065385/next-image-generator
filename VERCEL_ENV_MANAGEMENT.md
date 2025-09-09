# Vercel 环境变量批量管理指南

## 脚本说明

### 1. vercel-env.sh - 主要管理脚本

#### 功能
- **拉取**: 从 Vercel 拉取环境变量到本地文件
- **推送**: 从本地文件推送环境变量到 Vercel
- **删除**: 删除 Vercel 中的所有环境变量

#### 使用方法

```bash
# 拉取 preview 环境变量
./vercel-env.sh preview pull

# 推送 preview 环境变量
./vercel-env.sh preview push

# 删除 preview 环境的所有变量
./vercel-env.sh preview delete
```

### 2. rename-env.sh - 批量重命名脚本

#### 功能
批量重命名环境变量的前缀

#### 使用方法

```bash
# 将 OLD_ 前缀改为 NEW_ 前缀
./rename-env.sh .env.preview OLD_ NEW_
```

## 工作流程

### 1. 备份和拉取
```bash
# 拉取当前环境变量（会自动备份）
./vercel-env.sh preview pull
```

### 2. 本地编辑
```bash
# 编辑 .env.preview 文件
vim .env.preview

# 或使用 VS Code
code .env.preview
```

### 3. 批量重命名（如果需要）
```bash
# 重命名变量前缀
./rename-env.sh .env.preview CREEM_ PAYMENT_
```

### 4. 推送更新
```bash
# 删除旧变量并推送新变量
./vercel-env.sh preview push
```

## 注意事项

1. **备份机制**
   - 脚本会自动创建备份文件
   - 拉取时会备份原有文件：`.env.preview.backup{timestamp}`
   - 重命名时会备份：`.env.preview.rename-backup{timestamp}`

2. **安全确认**
   - 删除操作需要二次确认
   - 推送前会先删除所有现有变量

3. **文件格式**
   - 支持 `#` 注释
   - 支持 `KEY=value` 格式
   - 支持单引号和双引号

4. **前置要求**
   - 已安装 Vercel CLI: `npm i -g vercel`
   - 已登录 Vercel: `vercel login`

## 示例：更新 Creem 相关变量

```bash
# 1. 拉取当前配置
./vercel-env.sh preview pull

# 2. 重命名变量（如果需要）
./rename-env.sh .env.preview CREEM_ CREEM_TEST_

# 3. 编辑文件，更新值
vim .env.preview

# 4. 推送更新
./vercel-env.sh preview push
```

## 常见问题

1. **Permission denied**
   ```bash
   chmod +x vercel-env.sh rename-env.sh
   ```

2. **Vercel CLI 未找到**
   ```bash
   npm install -g vercel
   vercel login
   ```

3. **环境名称错误**
   支持的环境：preview, production, development