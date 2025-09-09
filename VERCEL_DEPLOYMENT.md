# Vercel 部署配置指南

## 部署步骤

### 1. 登录 Vercel
```bash
vercel login
```

### 2. 部署到生产环境
```bash
vercel --prod
```

### 3. 配置自定义域名（可选）
在 Vercel 控制台的 Settings → Domains 中添加您的域名。

## 必需的环境变量

在 Vercel 项目设置的 Environment Variables 中添加：

### 数据库配置
- `POSTGRES_URL` - Supabase PostgreSQL 连接字符串

### Creem.io 支付配置
- `CREEM_API_KEY` - Creem API 密钥
- `CREEM_WEBHOOK_SECRET` - Webhook 验证密钥
- `CREEM_PRODUCT_MONTHLY_ID` - 月度产品 ID
- `CREEM_PRODUCT_YEARLY_ID` - 年度产品 ID
- `WEB_BASE_URI` - 您的网站基础 URL（如 https://yourdomain.com）

### AI 服务配置
- `REPLICATE_API_TOKEN` - Replicate API 令牌

### 文件存储配置
- `R2_ACCOUNT_ID` - Cloudflare R2 账户 ID
- `R2_ACCESS_KEY_ID` - R2 访问密钥 ID
- `R2_SECRET_ACCESS_KEY` - R2 秘密访问密钥
- `R2_BUCKET_NAME` - R2 存储桶名称
- `R2_ENDPOINT` - R2 端点 URL

### 认证配置
- `NEXTAUTH_SECRET` - NextAuth 密钥
- `GOOGLE_CLIENT_ID` - Google OAuth 客户端 ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth 客户端密钥

## 重要页面 URL

部署成功后，您可以通过以下 URL 访问：

- **测试支付页面**: `https://your-domain.com/test-payment`
- **管理员页面**: `https://your-domain.com/admin-enhanced`
- **Webhook 接收**: `https://your-domain.com/api/webhook/creem`
- **支付结果页面**: `https://your-domain.com/pricing`

## Webhook 配置

在 Creem.io 控制台配置 webhook：
- URL: `https://your-domain.com/api/webhook/creem`
- 事件: `subscription.paid`, `subscription.canceled`, `subscription.expired`, `subscription.updated`

## 测试步骤

1. 访问测试支付页面
2. 选择一个计划并点击"真实支付"
3. 在 Creem 支付页面使用测试信用卡：4242 4242 4242 4242
4. 完成支付后检查 webhook 是否正常接收
5. 验证用户积分和订阅状态是否正确更新

## 故障排除

如果支付仍然失败：
1. 检查 Vercel 的函数日志
2. 验证所有环境变量是否正确配置
3. 确认 Creem.io 账户已启用测试模式
4. 检查 webhook URL 是否可访问