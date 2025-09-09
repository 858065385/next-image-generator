# 支付流程完整文档

## 概述

本文档详细说明了 AI 图像/视频生成平台的完整支付流程，涵盖从用户发起支付到 webhook 处理的全过程。

## 1. 支付流程概述

### 1.1 支付系统架构

支付系统基于 **Creem** 支付网关构建，集成以下核心组件：

- **前端页面**: 定价页面、支付结果页面
- **API 接口**: 结账会话创建、Webhook 处理
- **数据库**: 用户订阅、支付历史、积分使用记录
- **第三方服务**: Creem 支付网关

### 1.2 主要页面和路由

| 路由 | 功能 | 说明 |
|------|------|------|
| `/pricing` | 定价页面 | 展示订阅计划和价格 |
| `/api/creem/checkout` | 创建结账会话 | 处理支付请求，返回支付链接 |
| `/thanks` | 支付中转页面 | 重定向到支付结果页面 |
| `/payment-result` | 支付结果页面 | 显示支付成功/失败状态 |
| `/api/webhook/creem` | Webhook 处理 | 处理 Creem 的支付通知 |

## 2. 详细支付流程

### 2.1 用户发起支付

#### 步骤 1: 选择订阅计划
- 用户访问 `/pricing` 页面
- 选择订阅计划（月付/年付）
- 点击"立即订阅"按钮

#### 步骤 2: 创建结账会话
- 前端调用 `/api/creem/checkout` API
- API 验证用户身份和订阅计划
- 创建支付历史记录（状态：STARTED）
- 调用 Creem API 创建结账会话

**API 请求参数：**
```typescript
{
  plan_id: number,           // 订阅计划ID
  amount: number,            // 支付金额（分为单位）
  interval: 'month' | 'year', // 计费周期
  user_uuid: string,         // 用户UUID
  user_email: string         // 用户邮箱
}
```

**API 响应：**
```typescript
{
  checkout_url: string,      // Creem 支付链接
  checkout_id: string        // 结账会话ID
}
```

#### 步骤 3: 重定向到支付页面
- 用户被重定向到 Creem 支付页面
- 完成支付或取消支付

### 2.2 支付结果处理

#### 步骤 1: 支付完成重定向
- 支付成功：重定向到 `/payment-result?success=true`
- 支付失败：重定向到 `/payment-result?success=false`

#### 步骤 2: 支付结果页面
- 显示支付状态（成功/失败/处理中）
- 展示订阅详情（成功时）
- 提供后续操作按钮

**页面功能：**
- ✅ 支付成功：显示订阅详情、积分信息、操作指引
- ❌ 支付失败：显示错误信息、重试选项
- ⏳ 处理中：显示加载状态

## 3. Webhook 处理机制

### 3.1 Webhook 接收和验证

#### 接收端点：`/api/webhook/creem`

**处理流程：**
1. **签名验证**: 验证 Creem webhook 签名
2. **事件解析**: 解析 JSON 格式的 webhook 数据
3. **重复检查**: 防止重复处理同一事件
4. **事件分发**: 根据事件类型调用相应处理函数

**支持的 Webhook 事件：**
- `subscription.paid` - 订阅支付成功
- `subscription.canceled` - 订阅取消
- `subscription.expired` - 订阅过期
- `subscription.updated` - 订阅更新

### 3.2 事件处理详情

#### 3.2.1 `subscription.paid` 事件处理

**处理步骤：**
1. **创建/更新用户订阅**
   - 设置订阅状态为 ACTIVE
   - 计算计费周期（月付+1个月，年付+1年）
   - 更新 Creem 订阅信息

2. **更新积分使用记录**
   - 新用户：创建积分记录，分配订阅积分
   - 续费用户：重置积分余额
   - 升级用户：累加积分余额

3. **更新支付历史**
   - 标记支付状态为 SUCCESS
   - 记录 Creem 订阅信息

#### 3.2.2 `subscription.canceled` 事件处理

**处理步骤：**
1. **更新订阅状态**
   - 设置状态为 CANCELLED
   - 记录取消时间

2. **更新积分状态**
   - 标记订阅为非活跃状态
   - 保留剩余积分

#### 3.2.3 `subscription.expired` 事件处理

**处理步骤：**
1. **更新订阅状态**
   - 设置状态为 EXPIRED
   - 记录过期时间

2. **更新积分状态**
   - 标记订阅为非活跃状态

## 4. 数据库表结构

### 4.1 核心表结构

#### `users` - 用户表
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  uuid text NOT NULL,                    -- 用户UUID
  email text NOT NULL,                   -- 用户邮箱
  nickname text NOT NULL,                -- 用户昵称
  avatar_url text NOT NULL,              -- 用户头像
  locale text NULL,                      -- 语言设置
  signin_type text NULL,                 -- 登录类型
  signin_ip text NULL,                   -- 登录IP
  signin_provider text NULL,             -- 登录提供商
  signin_openid text NULL,               -- OpenID
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  update_time timestamp NULL
);
```

#### `subscription_plans` - 订阅计划表
```sql
CREATE TABLE subscription_plans (
  id SERIAL PRIMARY KEY,
  name varchar(100) NOT NULL,            -- 计划名称
  interval varchar(20) NOT NULL,         -- 计费周期
  price numeric(10,2) NOT NULL,           -- 价格
  currency varchar(3) NOT NULL,          -- 货币
  credit_per_interval integer NOT NULL,  -- 每周期积分
  creem_product_id text NULL,            -- Creem产品ID
  is_active boolean NULL,                -- 是否可用
  created_at timestamp NULL,
  updated_at timestamp NULL
);
```

#### `user_subscriptions` - 用户订阅表
```sql
CREATE TABLE user_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id text NOT NULL,                 -- 用户ID
  subscription_plans_id bigint NULL,     -- 计划ID
  creem_product_id text NULL,            -- Creem产品ID
  creem_subscription_id text NULL,       -- Creem订阅ID
  creem_customer_id text NULL,            -- Creem客户ID
  status varchar(50) NOT NULL,           -- 订阅状态
  current_period_start timestamp NOT NULL, -- 周期开始
  current_period_end timestamp NOT NULL,   -- 周期结束
  cancel_at_period_end boolean NULL,     -- 周期结束取消
  canceled_at timestamp NULL,             -- 取消时间
  ends_at timestamp NULL,                -- 结束时间
  created_at timestamp NULL,
  updated_at timestamp NULL
);
```

#### `credit_usage` - 积分使用表
```sql
CREATE TABLE credit_usage (
  id SERIAL PRIMARY KEY,
  user_id text NOT NULL,                 -- 用户ID
  user_subscriptions_id integer NOT NULL, -- 订阅ID
  used_count integer NOT NULL,           -- 已使用积分
  period_start timestamp NOT NULL,       -- 周期开始
  period_end timestamp NOT NULL,         -- 周期结束
  is_subscription_active boolean NOT NULL, -- 订阅活跃
  period_remain_count integer NULL,      -- 剩余积分
  created_at timestamp NULL,
  updated_at timestamp NULL
);
```

#### `payment_history` - 支付历史表
```sql
CREATE TABLE payment_history (
  id SERIAL PRIMARY KEY,
  user_id text NOT NULL,                 -- 用户ID
  subscription_plans_id bigint NULL,      -- 计划ID
  creem_product_id text NULL,            -- Creem产品ID
  creem_subscription_id text NULL,       -- Creem订阅ID
  creem_customer_id text NULL,           -- Creem客户ID
  creem_checkout_id text NULL,           -- Creem结账ID
  amount numeric(10,2) NOT NULL,         -- 支付金额
  currency varchar(3) NOT NULL,          -- 货币
  status varchar(50) NOT NULL,           -- 支付状态
  created_at timestamp NULL
);
```

### 4.2 表关系图

```
users (1) ── (N) user_subscriptions (1) ── (N) credit_usage
    │                                    │
    │                                    │
    └─ (N) payment_history (N) ──────────┘
          │
          └─ (N) subscription_plans
```

## 5. API 端点详解

### 5.1 `/api/creem/checkout` - 创建结账会话

**功能**: 创建 Creem 支付会话，返回支付链接

**请求方法**: POST

**请求参数**:
```json
{
  "plan_id": 1,
  "amount": 1590,
  "interval": "month",
  "user_uuid": "user-uuid-here",
  "user_email": "user@example.com"
}
```

**处理逻辑**:
1. 验证用户身份
2. 验证订阅计划存在且价格匹配
3. 检查是否允许升级/降级
4. 创建支付历史记录（状态：STARTED）
5. 调用 Creem API 创建结账会话
6. 返回支付链接

**响应**:
```json
{
  "checkout_url": "https://checkout.creem.io/...",
  "checkout_id": "checkout_session_id"
}
```

### 5.2 `/api/webhook/creem` - Webhook 处理

**功能**: 处理 Creem 的支付通知

**请求方法**: POST

**处理逻辑**:
1. 验证 webhook 签名
2. 检查事件是否已处理
3. 根据事件类型调用处理函数
4. 更新数据库记录

**支持的事件类型**:
- `subscription.paid`: 订阅支付成功
- `subscription.canceled`: 订阅取消
- `subscription.expired`: 订阅过期
- `subscription.updated`: 订阅更新

## 6. 支付状态管理

### 6.1 支付状态枚举

| 状态 | 说明 | 触发条件 |
|------|------|----------|
| STARTED | 支付开始 | 创建结账会话时 |
| SUCCESS | 支付成功 | Webhook 确认支付 |
| FAILED | 支付失败 | 支付被拒绝或取消 |
| PENDING | 处理中 | 等待支付确认 |

### 6.2 订阅状态枚举

| 状态 | 说明 | 触发条件 |
|------|------|----------|
| ACTIVE | 活跃 | 支付成功 |
| CANCELLED | 已取消 | 用户主动取消 |
| EXPIRED | 已过期 | 订阅周期结束 |
| PENDING | 待激活 | 等待支付确认 |

### 6.3 积分状态管理

**积分分配逻辑**:
- **新订阅**: 创建新的积分记录，分配订阅积分
- **续费**: 重置积分余额为订阅积分
- **升级**: 累加剩余积分和新订阅积分
- **降级**: 保留剩余积分，到期后按新计划分配

**积分使用**:
- 每次使用 AI 功能扣除相应积分
- 积分不足时提示用户充值
- 订阅到期后停止功能使用

## 7. 错误处理和边界情况

### 7.1 常见错误情况

#### 7.1.1 支付失败
- **原因**: 卡片拒绝、网络错误、余额不足
- **处理**: 显示错误信息，提供重试选项
- **记录**: 更新支付历史状态为 FAILED

#### 7.1.2 重复支付
- **原因**: 用户多次点击或网络重试
- **处理**: 检查现有订阅，防止重复订阅
- **记录**: Webhook 事件去重机制

#### 7.1.3 Webhook 处理失败
- **原因**: 数据库错误、网络超时
- **处理**: 记录错误日志，支持手动重试
- **恢复**: 保存原始事件数据

### 7.2 数据一致性保证

#### 7.2.1 事务处理
- 支付历史记录创建在调用 Creem API 之前
- Webhook 处理使用数据库事务确保数据一致性
- 关联表更新采用原子操作

#### 7.2.2 幂等性设计
- Webhook 事件处理支持重复执行
- 支付状态变更有明确的条件判断
- 积分分配考虑现有状态

#### 7.2.3 数据完整性
- 外键约束确保数据关联性
- 状态字段有明确的枚举值
- 时间戳字段记录关键操作时间

## 8. 安全考虑

### 8.1 支付安全
- Creem API 密钥安全存储
- Webhook 签名验证
- 敏感信息加密传输

### 8.2 数据安全
- 用户数据访问权限控制
- 支付记录审计日志
- 数据库操作参数化查询

### 8.3 业务安全
- 防止重复支付
- 积分系统风控
- 订阅状态监控

## 9. 监控和维护

### 9.1 关键指标监控
- 支付成功率
- Webhook 处理延迟
- 订阅续费率
- 积分使用率

### 9.2 日志记录
- 支付流程完整日志
- Webhook 事件处理日志
- 错误异常详细记录
- 关键操作审计日志

### 9.3 故障处理
- 支付失败自动重试机制
- Webhook 处理失败手动恢复
- 数据不一致修复工具
- 紧急情况处理流程

## 10. 测试策略

### 10.1 单元测试
- API 端点功能测试
- 数据库操作测试
- 业务逻辑测试

### 10.2 集成测试
- 支付流程端到端测试
- Webhook 处理测试
- 第三方服务集成测试

### 10.3 压力测试
- 高并发支付请求测试
- Webhook 处理性能测试
- 数据库性能测试

## 11. 部署和配置

### 11.1 环境变量配置
```bash
# Creem 支付网关
CREEM_API_KEY=your_api_key
CREEM_API_BASE_URL=https://api.creem.io
CREEM_WEBHOOK_SECRET=your_webhook_secret
CREEM_PRODUCT_MONTHLY_ID=monthly_product_id
CREEM_PRODUCT_YEARLY_ID=yearly_product_id

# 应用配置
WEB_BASE_URI=https://your-domain.com
NODE_ENV=production
```

### 11.2 Webhook 配置
- 在 Creem 控制台配置 webhook URL
- 设置处理的事件类型
- 配置签名密钥

### 11.3 数据库初始化
- 执行数据库迁移脚本
- 初始化订阅计划数据
- 创建管理员账户

## 12. 总结

本支付流程设计具有以下特点：

1. **完整性**: 涵盖从用户支付到 webhook 处理的完整流程
2. **可靠性**: 具备错误处理、重试机制和数据一致性保证
3. **安全性**: 采用签名验证、权限控制等安全措施
4. **可扩展性**: 支持多种支付方式和订阅计划
5. **可维护性**: 清晰的代码结构和完善的日志记录

通过这个支付系统，用户可以方便地订阅服务，平台可以安全地处理支付，管理员可以有效地监控和管理支付流程。