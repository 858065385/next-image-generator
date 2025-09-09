Creem 集成开发说明（适合 Claude Code）
一、对接场景

本站支持 订阅付费（月度 / 年度）。

订阅用于解锁：会员权益。

免费用户每日有生成次数上限。

二、业务流程

后台创建产品

在 Creem 后台建立两个订阅产品：

月度订阅 CREEM_PRODUCT_MONTHLY_ID

年度订阅 CREEM_PRODUCT_YEARLY_ID

创建 Checkout

站点后端调用 Creem API POST /v1/checkouts

传入产品 ID、success_url、可选 request_id

返回 checkout_url，前端重定向过去

Return URL（次要）

用户支付完成后，Creem 会带着参数跳转到 success_url

可做前端展示，但最终订阅状态 必须以 Webhook 为准

Webhook（必须）

站点后端暴露 /api/creem/webhook

校验 creem-signature（HMAC-SHA256, 使用 CREEM_WEBHOOK_SECRET）

处理关键事件：

subscription.paid → 开通/续期

subscription.canceled → 标记取消

subscription.expired → 到期关闭

subscription.update → 升降级或状态更新

三、环境变量
# Creem API
CREEM_API_KEY=your_api_key
CREEM_WEBHOOK_SECRET=your_webhook_secret
CREEM_API_BASE_URL=https://api.creem.io   # 测试可用 https://test-api.creem.io

# 产品 ID
CREEM_PRODUCT_MONTHLY_ID=prod_monthly_xxx
CREEM_PRODUCT_YEARLY_ID=prod_yearly_xxx

# Return URL
CREEM_SUCCESS_URL=https://your.app/account/creem-return

四、数据库建议字段

Subscription

userId

status (active|canceled|expired|past_due)

productId

creemSubId

currentPeriodEnd

WebhookEvent

id（Creem 事件 ID）

type

raw（原始事件 JSON）

handled

五、验收标准

用户可在 /pricing 选择月付/年付并成功跳转 Creem Checkout

支付成功后能通过 Webhook 更新数据库 → subscription.status=active

取消订阅时 → subscription.status=canceled

到期未续费时 → subscription.status=expired

免费用户超出额度时，引导到 /pricing