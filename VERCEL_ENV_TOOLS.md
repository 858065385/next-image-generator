# Vercel 环境变量管理工具集

## 脚本说明

### 1. clean-env.sh - 快速清理脚本
**功能**: 删除指定环境的环境变量（保留系统变量）

```bash
# 删除 preview 环境的所有变量（保留 VERCEL_ 开头的）
./clean-env.sh preview

# 删除 production 环境的所有变量
./clean-env.sh production
```

特点：
- 使用 `--yes` 参数，无需二次确认
- 自动跳过 `VERCEL_` 前缀的系统变量
- 适合在 CI/CD 中使用

### 2. sync-env.sh - 环境同步脚本
**功能**: 将一个环境的变量复制到另一个环境

```bash
# 将 production 变量同步到 preview
./sync-env.sh production preview

# 将 preview 变量同步到 production
./sync-env.sh preview production
```

工作流程：
1. 备份源环境变量
2. 清理目标环境
3. 将变量添加到目标环境（跳过系统变量）

### 3. vercel-env.sh - 完整管理脚本
**功能**: 拉取、推送、删除环境变量

```bash
# 拉取环境变量
./vercel-env.sh preview pull

# 推送环境变量
./vercel-env.sh preview push

# 删除环境变量
./vercel-env.sh preview delete
```

### 4. rename-env.sh - 批量重命名
**功能**: 批量修改变量名前缀

```bash
# 将 CREEM_ 前缀改为 PAYMENT_
./rename-env.sh .env.preview CREEM_ PAYMENT_
```

## Vercel 环境说明

| 环境 | CLI 参数 | 说明 |
|------|----------|------|
| 本地 | development | 只在本地存在，云端没有 |
| 正式 | production | 线上正式流量 |
| 预览 | preview | 每个 PR 自动生成的预览环境 |

## 实际使用场景

### 场景 1: 更新预览环境变量
```bash
# 1. 拉取当前变量
./vercel-env.sh preview pull

# 2. 编辑 .env.preview 文件
vim .env.preview

# 3. 推送更新
./vercel-env.sh preview push
```

### 场景 2: 将生产环境同步到预览环境
```bash
# 一键同步
./sync-env.sh production preview
```

### 场景 3: 批量重命名变量
```bash
# 1. 拉取变量
./vercel-env.sh preview pull

# 2. 重命名
./rename-env.sh .env.preview OLD_ NEW_

# 3. 推送更新
./vercel-env.sh preview push
```

### 场景 4: 完全重置环境
```bash
# 删除所有变量（系统变量除外）
./clean-env.sh preview

# 然后重新添加
./vercel-env.sh preview push
```

## 前置要求

1. 安装 Vercel CLI
```bash
npm install -g vercel
vercel login
```

2. 安装 jq（用于 JSON 处理）
```bash
# macOS
brew install jq

# Ubuntu
apt-get install jq
```

## 安全注意事项

1. 所有脚本都会自动备份
2. 删除操作有确认提示（除了 clean-env.sh）
3. 系统变量（VERCEL_ 开头）默认不会被删除
4. 建议先在测试环境验证

## 文件结构

```
vercel-env.sh      # 主要管理脚本
clean-env.sh       # 快速清理脚本
sync-env.sh        # 环境同步脚本
rename-env.sh      # 批量重命名脚本
.env.preview       # 预览环境变量
.env.production    # 生产环境变量
```

## 常见问题

1. **Permission denied**
```bash
chmod +x *.sh
```

2. **命令未找到**
```bash
npm install -g vercel
brew install jq  # 或 apt-get install jq
```

3. **环境名称错误**
支持的环境：development, preview, production