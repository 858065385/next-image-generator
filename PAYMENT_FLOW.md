# Creem 支付业务逻辑文档

## 概述

本文档详细说明了基于 Creem 的订阅支付系统的完整业务逻辑和数据流。

## 系统架构

```
前端页面 → Creem Checkout API → Creem 支付页面 → 支付完成 → Webhook 通知 → 数据库更新
```

## 1. 订阅计划

### 当前可用的订阅计划

| ID | 名称 | 周期 | 价格 | 积分 | Creem Product ID |
|---|---|---|---|---|---|
| 1 | Monthly Pro | 月付 | $15.9 | 100 | prod_25glxgZaQ6tPnC5pyS8iyZ |
| 2 | Yearly Pro | 年付 | $99 | 1200 | prod_49Keav5JYCoDNnl5y5sUtt |

### 数据库表结构

```sql
-- 订阅计划表
CREATE TABLE subscription_plans (
  id SERIAL PRIMARY KEY,
  name character varying(100) NOT NULL,
  interval character varying(20) NOT NULL,  -- month/year
  price numeric(10,2) NOT NULL,
  currency character varying(3) NOT NULL,
  credit_per_interval integer NOT NULL,
  creem_product_id character varying(100) NOT NULL,
  is_active boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
);
```

## 2. 支付流程详细说明

### 步骤1：创建结账会话

**API端点**: `POST /api/creem/checkout`

**请求参数**:
```json
{
  "plan_id": 1,                    // 订阅计划ID
  "amount": 1590,                  // 金额（分）
  "interval": "month",             // 计费周期
  "user_uuid": "user-uuid-123",    // 用户UUID
  "user_email": "user@example.com" // 用户邮箱
}
```

**处理流程**:
1. **参数验证**
   - 验证用户身份（UUID和邮箱匹配）
   - 验证订阅计划存在且有效
   - 验证金额与计划价格匹配

2. **重复订阅检查**
   - 所有付费计划不允许重复订阅相同计划
   - 允许从不同计划升级（如月付升级到年付）

3. **创建支付历史记录**
   - 状态设置为 `STARTED`
   - 记录用户ID、计划ID、金额等信息

4. **调用 Creem API**
   - 根据周期选择对应的 Creem Product ID
   - 创建结账会话，设置成功回调URL

**响应**:
```json
{
  "checkout_url": "https://checkout.creem.io/...",
  "checkout_id": "chk_xxxxx"
}
```

### 步骤2：用户支付

1. 用户跳转到 Creem 支付页面
2. 完成支付流程
3. Creem 将用户重定向到 `success_url`
4. 同时触发 Webhook 通知

### 步骤3：Webhook 处理

**API端点**: `POST /api/webhook/creem`

**处理流程**:
1. **验证签名**
   - 使用 `CREEM_WEBHOOK_SECRET` 验证请求合法性
   - 防止伪造请求

2. **解析事件类型**
   - `subscription.paid` - 订阅支付成功
   - `subscription.cancelled` - 订阅取消
   - `subscription.expired` - 订阅过期

3. **处理支付成功事件**
   - 提取元数据中的用户信息
   - 创建或更新用户订阅记录
   - 更新用户积分额度
   - 更新支付历史状态为 `success`

### 步骤4：数据库更新

#### 用户订阅表 (user_subscriptions)
```sql
CREATE TABLE user_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id text NOT NULL,
  subscription_plans_id bigint,
  creem_product_id text NOT NULL,
  creem_subscription_id character varying(100) NOT NULL,
  creem_customer_id character varying(100) NOT NULL,
  status character varying(50) NOT NULL,  -- active/cancelled/expired
  current_period_start timestamp with time zone NOT NULL,
  current_period_end timestamp with time zone NOT NULL,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
);
```

#### 积分使用表 (credit_usage)
```sql
CREATE TABLE credit_usage (
  id SERIAL PRIMARY KEY,
  user_id text NOT NULL,
  user_subscriptions_id integer NOT NULL,
  used_count integer NOT NULL,
  period_start timestamp with time zone NOT NULL,
  period_end timestamp with time zone NOT NULL,
  is_subscription_active boolean NOT NULL,
  period_remain_count integer,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
);
```

#### 支付历史表 (payment_history)
```sql
CREATE TABLE payment_history (
  id SERIAL PRIMARY KEY,
  user_id text NOT NULL,
  subscription_plans_id bigint,
  creem_checkout_id character varying(100),
  creem_subscription_id text,
  creem_customer_id text,
  creem_product_id text,
  amount numeric(10,2) NOT NULL,
  currency character varying(3) NOT NULL,
  status character varying(50) NOT NULL,  -- STARTED/success/failed
  created_at timestamp with time zone,
  updated_at timestamp with time zone
);
```

## 3. 积分系统

### 积分分配规则

- **Monthly Pro**: 100积分/月
- **Yearly Pro**: 1200积分/年（相当于每月100积分）

### 积分使用逻辑

1. **新订阅**
   - 创建 credit_usage 记录
   - `period_remain_count` 设置为总积分
   - `is_subscription_active` 设置为 true

2. **订阅续费**
   - 重置 `period_remain_count` 为新的积分额度
   - 更新 `period_start` 和 `period_end`

3. **积分消费**
   - 每次使用AI功能时扣减积分
   - 更新 `used_count` 和 `period_remain_count`

## 4. 状态管理

### 订阅状态流转

```
ACTIVE → CANCELLED (用户主动取消)
ACTIVE → EXPIRED (到期未续费)
CANCELLED → ACTIVE (重新激活)
```

### 支付状态流转

```
STARTED → success (支付成功)
STARTED → failed (支付失败)
```

## 5. 环境变量配置

```bash
# Creem 配置
CREEM_API_KEY=your_api_key
CREEM_WEBHOOK_SECRET=your_webhook_secret
CREEM_API_BASE_URL=https://api.creem.io

# 产品ID
CREEM_PRODUCT_MONTHLY_ID=prod_25glxgZaQ6tPnC5pyS8iyZ
CREEM_PRODUCT_YEARLY_ID=prod_49Keav5JYCoDNnl5y5sUtt

# 回调URL
WEB_BASE_URI=http://localhost:3000
```

## 6. 错误处理

### 常见错误场景

1. **用户不存在**
   - 返回 401 状态码
   - 错误信息："user not found"

2. **订阅计划不存在**
   - 返回 404 状态码
   - 错误信息："subscription plan not found"

3. **重复订阅**
   - 返回 500 状态码
   - 错误信息："You already has an active subscription to this plan"

4. **Creem API 错误**
   - 返回 500 状态码
   - 包含具体的错误信息

## 7. 测试流程

### 测试支付

1. 访问 `/test-payment` 页面
2. 选择订阅计划
3. 使用测试环境完成支付
4. 验证数据库记录是否正确更新

### 调试工具

- `/api/debug/query-subscriptions` - 查询订阅数据
- `/api/debug/subscription-plans` - 查看订阅计划
- `/api/debug/init-subscription-plans` - 初始化订阅计划

## 8. 安全考虑

1. **签名验证**
   - 所有 Webhook 请求必须验证签名
   - 使用环境变量中的密钥

2. **参数校验**
   - 所有输入参数必须验证
   - 防止 SQL 注入

3. **幂等性**
   - Webhook 处理需要支持重复请求
   - 使用 event_id 防重复

## 9. 监控和日志

### 关键日志点

1. 创建结账会话
2. Webhook 接收和处理
3. 数据库更新操作
4. 错误和异常情况

### 监控指标

- 支付成功率
- 订阅转化率
- 积分使用情况
- 错误率

---

**注意**: 本文档基于当前系统实现，如有架构调整需要同步更新。