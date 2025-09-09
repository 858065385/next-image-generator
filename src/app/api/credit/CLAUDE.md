# 积分系统 API 文档

## 概述

`/src/app/api/credit/` 目录提供了完整的积分管理系统 API，支持积分的查询、创建、调整和历史记录功能。这些 API 主要用于管理用户的积分余额，处理积分的增减操作，以及跟踪积分使用历史。

## API 端点

### 1. 积分管理 API (`/api/credit/manage`)

**文件位置**: `src/app/api/credit/manage/route.ts`

#### 功能
- 查询用户积分信息
- 创建新的积分记录
- 更新现有积分记录

#### 端点详情

**POST** - 获取用户积分信息
```http
POST /api/credit/manage
Content-Type: application/json

{
  "user_id": "用户UUID"
}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "Success",
  "data": {
    "user_id": "uuid",
    "user_subscriptions_id": 1,
    "is_subscription_active": true,
    "used_count": 10,
    "period_remain_count": 90,
    "period_start": "2024-01-01T00:00:00.000Z",
    "period_end": "2024-02-01T00:00:00.000Z",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**PUT** - 创建积分记录
```http
PUT /api/credit/manage
Content-Type: application/json

{
  "user_id": "用户UUID",
  "period_remain_count": 100,
  "is_subscription_active": false,
  "used_count": 0,
  "period_start": "2024-01-01T00:00:00.000Z",
  "period_end": "2024-02-01T00:00:00.000Z"
}
```

**PATCH** - 更新积分记录
```http
PATCH /api/credit/manage
Content-Type: application/json

{
  "user_id": "用户UUID",
  "period_remain_count": 150,
  "is_subscription_active": true
}
```

### 2. 积分调整 API (`/api/credit/adjust`)

**文件位置**: `src/app/api/credit/adjust/route.ts`

#### 功能
- 增加用户积分
- 扣除用户积分（包含余额验证）

#### 端点详情

**POST** - 增加积分
```http
POST /api/credit/adjust
Content-Type: application/json

{
  "user_id": "用户UUID",
  "amount": 50,
  "reason": "月度会员充值"
}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "Credits added successfully. Added: 50, Current: 150",
  "data": {
    "user_id": "uuid",
    "period_remain_count": 150,
    "is_subscription_active": true
  },
  "transaction": {
    "user_id": "uuid",
    "amount": 50,
    "type": "add",
    "reason": "月度会员充值",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

**DELETE** - 扣除积分
```http
DELETE /api/credit/adjust
Content-Type: application/json

{
  "user_id": "用户UUID",
  "amount": 10,
  "reason": "图像生成消费"
}
```

**错误码说明**:
- `code: -2` - 积分不足
- `code: -3` - 超出积分限制
- `code: -1` - 其他错误

### 3. 积分历史 API (`/api/credit/history`)

**文件位置**: `src/app/api/credit/history/route.ts`

#### 功能
- 获取积分使用历史
- 提供分页功能
- 统计积分使用情况

#### 端点详情

**POST** - 获取积分历史
```http
POST /api/credit/history
Content-Type: application/json

{
  "user_id": "用户UUID",
  "page": 1,
  "page_size": 20
}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "Success",
  "data": {
    "current_balance": {
      "total_credits": 100,
      "used": 10,
      "remaining": 90,
      "period_start": "2024-01-01T00:00:00.000Z",
      "period_end": "2024-02-01T00:00:00.000Z",
      "is_active": true
    },
    "usage_history": [
      {
        "id": 1,
        "effect_id": 1,
        "credit": 1,
        "created_at": "2024-01-01T10:00:00.000Z"
      }
    ],
    "usage_by_date": [
      {
        "date": "2024-01-01",
        "count": 10,
        "credits": 10
      }
    ],
    "pagination": {
      "current_page": 1,
      "page_size": 20,
      "total_items": 10
    }
  }
}
```

## 数据模型

### CreditUsage（积分使用）
```typescript
interface CreditUsage {
  user_id: string;                    // 用户ID
  user_subscriptions_id: number;      // 关联的订阅ID
  is_subscription_active: boolean;     // 订阅是否活跃
  used_count: number;                 // 已使用积分数
  period_remain_count: number;        // 当前周期剩余积分
  period_start: Date;                 // 计费周期开始时间
  period_end: Date;                   // 计费周期结束时间
  created_at: Date;                   // 创建时间
  updated_at?: Date;                  // 更新时间（可选）
}
```

## 使用场景

### 1. 用户订阅激活
当用户订阅月度/年度会员时：
- 使用 `PUT /api/credit/manage` 创建积分记录
- 或使用 `POST /api/credit/adjust` 增加积分

### 2. AI 生成消费
用户使用 AI 生成功能时：
- 先调用 `DELETE /api/credit/adjust` 验证并扣除积分
- 成功后记录生成结果

### 3. 积分查询
用户查看积分余额：
- 调用 `POST /api/credit/manage` 获取当前积分状态

### 4. 使用历史
用户查看积分使用记录：
- 调用 `POST /api/credit/history` 获取详细历史

## 错误处理

所有 API 都遵循统一的错误响应格式：

```json
{
  "code": -1,
  "error": "错误信息"
}
```

常见错误码：
- `-1` - 通用错误
- `-2` - 积分不足
- `-3` - 积分限制超出
- `400` - 请求参数错误
- `404` - 资源未找到
- `500` - 服务器内部错误

## 安全考虑

1. **身份验证** - 所有 API 需要在实际使用时添加身份验证中间件
2. **参数验证** - 严格验证输入参数
3. **积分验证** - 扣除积分前检查余额
4. **事务处理** - 关键操作需要数据库事务支持
5. **日志记录** - 记录所有积分变更操作

## 示例用法

### JavaScript/TypeScript
```typescript
// 查询积分
async function getCredits(userId: string) {
  const response = await fetch('/api/credit/manage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId })
  });
  return response.json();
}

// 增加积分
async function addCredits(userId: string, amount: number, reason: string) {
  const response = await fetch('/api/credit/adjust', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, amount, reason })
  });
  return response.json();
}

// 获取历史记录
async function getCreditHistory(userId: string, page: number = 1) {
  const response = await fetch('/api/credit/history', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, page, page_size: 20 })
  });
  return response.json();
}
```

### cURL
```bash
# 查询积分
curl -X POST http://localhost:3000/api/credit/manage \
  -H "Content-Type: application/json" \
  -d '{"user_id": "user-uuid"}'

# 增加积分
curl -X POST http://localhost:3000/api/credit/adjust \
  -H "Content-Type: application/json" \
  -d '{"user_id": "user-uuid", "amount": 100, "reason": "测试充值"}'

# 获取历史
curl -X POST http://localhost:3000/api/credit/history \
  -H "Content-Type: application/json" \
  -d '{"user_id": "user-uuid", "page": 1}'
```