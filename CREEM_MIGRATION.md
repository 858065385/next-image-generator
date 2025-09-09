# Stripe to Creem 迁移指南

本文档提供了从 Stripe 迁移到 Creem 支付平台的完整步骤和操作指南。

## 迁移步骤

### 1. 数据库迁移

运行数据库迁移脚本：
```bash
psql -U your_username -d your_database -f src/backend/sql/creem_migration.sql
```

### 2. 环境变量更新

更新 `.env.local` 文件，参考 `.env.example`：

```bash
# 移除 Stripe 相关变量
# STRIPE_SECRET_KEY=
# STRIPE_WEBHOOK_SECRET=
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# 新增 Creem 相关变量
CREEM_API_KEY=your_creem_api_key
CREEM_WEBHOOK_SECRET=your_webhook_secret
CREEM_API_BASE_URL=https://api.creem.io
CREEM_PRODUCT_MONTHLY_ID=prod_monthly_xxx
CREEM_PRODUCT_YEARLY_ID=prod_yearly_xxx
```

### 3. 前端路由更新

将原来调用 `/api/checkout` 的地方改为调用 `/api/creem/checkout`：

```typescript
// 原来的代码
const response = await fetch('/api/checkout', {
  method: 'POST',
  body: JSON.stringify({
    plan_id: planId,
    amount: amount,
    interval: interval,
    user_uuid: userUuid,
    user_email: userEmail
  })
});

// 更新后的代码（接口参数保持不变，只改路径）
const response = await fetch('/api/creem/checkout', {
  method: 'POST',
  body: JSON.stringify({
    plan_id: planId,
    amount: amount,
    interval: interval,
    user_uuid: userUuid,
    user_email: userEmail
  })
});

const data = await response.json();
// 使用返回的 checkout_url 跳转到 Creem 支付页面
window.location.href = data.checkout_url;
```

### 4. Webhook 配置

在 Creem 后台配置 Webhook：
- Webhook URL: `https://your-domain.com/api/webhook/creem`
- 需要监听的事件：
  - `subscription.paid`
  - `subscription.canceled`
  - `subscription.expired`
  - `subscription.updated`

### 5. 产品配置

在 Creem 后台创建对应的产品：

1. **月度订阅产品**
   - 名称: Monthly Pro
   - 价格: $9.99/月
   - 获取产品ID，更新环境变量 `CREEM_PRODUCT_MONTHLY_ID`

2. **年度订阅产品**
   - 名称: Yearly Pro  
  - 价格: $99.99/年
   - 获取产品ID，更新环境变量 `CREEM_PRODUCT_YEARLY_ID`

### 6. 数据库产品记录更新

更新 `subscription_plans` 表中的 `creem_product_id` 字段：

```sql
-- 根据实际的 Creem 产品ID更新
UPDATE subscription_plans SET creem_product_id = 'your_actual_monthly_product_id' WHERE interval = 'month';
UPDATE subscription_plans SET creem_product_id = 'your_actual_yearly_product_id' WHERE interval = 'year';
```

## 测试验证

### 1. 测试环境配置

使用 Creem 测试环境：
```bash
CREEM_API_BASE_URL=https://test-api.creem.io
```

### 2. 测试流程

1. **支付流程测试**
   - 访问定价页面
   - 选择月度/年度计划
   - 确认跳转到 Creem 支付页面
   - 使用测试卡号完成支付
   - 验证支付成功后的订阅状态

2. **Webhook 测试**
   - 监控 webhook 日志
   - 验证事件处理逻辑
   - 确认数据库记录正确更新

3. **积分系统测试**
   - 确认订阅后积分正确添加
   - 测试积分消耗逻辑
   - 验证周期更新机制

## 文件清理

完成迁移后可以删除的 Stripe 相关文件：
- `src/app/api/checkout/route.ts` (已被 `src/app/api/creem/checkout/route.ts` 替代)
- `src/app/api/webhook/stripe/route.ts.disabled`

## 主要变化总结

1. **数据库表结构**：将所有 `stripe_*` 字段替换为对应的 `creem_*` 字段
2. **API 端点**：`/api/checkout` → `/api/creem/checkout`，`/api/webhook/stripe` → `/api/webhook/creem`  
3. **支付流程**：从 Stripe Checkout Session 改为 Creem Checkout Session
4. **Webhook 处理**：从处理 Stripe 事件改为处理 Creem 事件

## 注意事项

1. **向后兼容性**：现有 Stripe 订阅用户的数据需要手动迁移或保持双系统并存
2. **测试充分**：在生产环境部署前，务必在测试环境完整测试所有支付和订阅流程
3. **监控重要**：部署后密切监控 webhook 处理和支付流程，及时发现和解决问题
4. **数据备份**：迁移前请务必备份数据库

## 回滚方案

如果迁移过程中遇到问题，可以通过以下步骤回滚：

1. 恢复数据库备份
2. 回滚代码到迁移前版本
3. 恢复原有环境变量配置
4. 重新启用 Stripe 相关配置

完成迁移后，您的应用将完全使用 Creem 作为支付处理平台。