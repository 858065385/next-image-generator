# 支付流程测试指南

## 支付流程概述

1. 用户在测试页面选择订阅计划
2. 系统创建 Creem checkout session
3. 用户在 Creem 支付页面完成支付
4. Creem 发送 webhook 通知支付结果
5. 系统更新用户订阅状态和积分
6. 用户重定向到成功页面

## 相关页面和端点

### 前端页面
- **测试支付页面**: `http://localhost:3001/test-payment`
  - 可以测试月度和年度订阅计划
  - 使用测试用户：UUID `28sltpmf751lly`, Email `karkanini9@gmail.com`

- **支付结果页面**: `http://localhost:3001/pricing`
  - 支付成功后重定向：`/pricing?success=true`
  - 支付失败后重定向：`/pricing?success=false`

### API 端点
- **创建支付会话**: `POST /api/creem/checkout`
- **处理 Webhook**: `POST /api/webhook/creem`
- **查看订阅计划**: `GET /api/debug/subscription-plans`

## 测试信用卡信息

使用 Creem 测试模式的信用卡：
- **卡号**: 4242 4242 4242 4242
- **有效期**: 任意未来日期（如 12/34）
- **CVC**: 任意3位数字（如 123）

## 当前状态

✅ 已完成：
- 支付页面创建
- Checkout session API
- Webhook 处理逻辑
- 订阅状态管理
- 积分系统集成
- 支付结果页面

❌ 待解决：
- Creem API Key 403 Forbidden 错误
  - 当前测试 Key: `creem_test_hALKqsFQ40KJexe3QEU0N`
  - 需要验证 API Key 有效性和权限

## 测试步骤

1. 访问测试页面：`http://localhost:3001/test-payment`
2. 点击任一计划的"立即支付"按钮
3. 在新打开的支付页面使用测试信用卡
4. 完成支付后观察 webhook 日志
5. 验证用户积分和订阅状态是否更新
6. 查看支付结果页面

## 调试信息

查看服务器日志：
```bash
# 查看开发服务器输出
npm run dev

# 观察 Creem API 请求和响应
# 观察 Webhook 处理日志
```

## 环境变量配置

确保 `.env.local` 中包含：
```env
CREEM_API_KEY=你的测试API密钥
CREEM_WEBHOOK_SECRET=你的webhook密钥
CREEM_PRODUCT_MONTHLY_ID=月度产品ID
CREEM_PRODUCT_YEARLY_ID=年度产品ID
WEB_BASE_URI=http://localhost:3001
```