
# Creem 对接接口清单

本文件总结了 **AI 平台订阅（月/年）**场景下需要打通的 **Creem API 接口**与文档链接，方便开发与联调。

---

## 一、必要接口

### 1. 创建 Checkout Session
- **方法**：`POST /v1/checkouts`
- **用途**：创建支付会话，返回 `checkout_url`，前端重定向用户到该地址。
- **文档**：[Create Checkout Session](https://docs.creem.io/api-reference/checkouts/create-checkout-session)

### 2. （可选）查询 Checkout
- **方法**：`GET /v1/checkouts`
- **用途**：根据 ID 查询会话详情，用于调试或排障。
- **文档**：[Get Checkout Session](https://docs.creem.io/api-reference/checkouts/get-checkout-session)

### 3. （可选）查询产品
- **方法**：`GET /v1/products/search`
- **用途**：确认产品 ID 是否正确，核对月付/年付产品。
- **文档**：[List Products](https://docs.creem.io/api-reference/products/list-products)

### 4. Webhooks（必须）
- **用途**：订阅生命周期的权威来源。
- **需要处理的事件**：
  - `subscription.paid` → 授权/续期
  - `subscription.canceled` → 取消
  - `subscription.expired` → 到期关闭
  - `subscription.update` → 升降级或变更
- **文档**：
  - [Webhooks Introduction](https://docs.creem.io/api-reference/webhooks/introduction)
  - [Verify Webhook](https://docs.creem.io/api-reference/webhooks/verify)
  - [Webhook Event Types](https://docs.creem.io/api-reference/webhooks/event-types)

### 5. （可选）升级/降级订阅
- **方法**：`POST /v1/subscriptions/{id}/upgrade`
- **用途**：未来支持月/年切换或套餐升级。
- **文档**：[Upgrade Subscription](https://docs.creem.io/api-reference/subscriptions/upgrade-subscription)

---

## 二、必要环境变量

```env
# Creem API
CREEM_API_KEY=your_api_key
CREEM_API_BASE_URL=https://api.creem.io   # 测试环境 https://test-api.creem.io

# Webhook
CREEM_WEBHOOK_SECRET=your_webhook_secret

# 产品 ID
CREEM_PRODUCT_MONTHLY_ID=prod_monthly_xxx
CREEM_PRODUCT_YEARLY_ID=prod_yearly_xxx

# 支付成功回跳
CREEM_SUCCESS_URL=https://your.app/account/creem-return
```

---

## 三、调试要点

- **认证**：统一使用 `x-api-key` 请求头。
- **测试模式**：切换 Dashboard 到 Test Mode，使用 `https://test-api.creem.io` 与测试卡 `4242 4242 4242 4242`。
- **Webhook 校验**：读取原始请求体做 HMAC-SHA256，与头 `creem-signature` 对比，密钥是 `CREEM_WEBHOOK_SECRET`。
- **事件重试**：Creem 会按 30s → 1m → 5m → 1h 回退重试，直至 200 响应。
- **推荐状态流转**：以 `subscription.paid` 授权，以 `subscription.canceled/expired` 收回。

---

## 四、文档索引

- [Creem API Reference](https://docs.creem.io/api-reference/introduction)
- [Authentication](https://docs.creem.io/api-reference/authentication)
- [Create Checkout Session](https://docs.creem.io/api-reference/checkouts/create-checkout-session)
- [Get Checkout Session](https://docs.creem.io/api-reference/checkouts/get-checkout-session)
- [List Products](https://docs.creem.io/api-reference/products/list-products)
- [Upgrade Subscription](https://docs.creem.io/api-reference/subscriptions/upgrade-subscription)
- [Webhooks Introduction](https://docs.creem.io/api-reference/webhooks/introduction)
- [Webhook Verify](https://docs.creem.io/api-reference/webhooks/verify)
- [Webhook Event Types](https://docs.creem.io/api-reference/webhooks/event-types)
- [Test Mode](https://docs.creem.io/api-reference/test-mode)
- [Customer Portal](https://docs.creem.io/api-reference/customer-portal/introduction)
