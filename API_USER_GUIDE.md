# 用户相关 API 接口文档

## 概述

为了提供更清晰、更一致的 API 接口，我们重新设计了用户相关的 API 结构。新的接口遵循 RESTful 设计原则，提供统一的响应格式。

## 新的 API 结构

### 1. 用户列表查询

**端点**: `GET /api/users/list`

**功能**: 分页查询用户列表，支持搜索和排序

**查询参数**:
- `search` (可选): 搜索关键词，支持 UUID、邮箱、昵称
- `page`: 页码，默认 1
- `limit`: 每页数量，默认 20
- `sort_by`: 排序字段（暂未实现）
- `sort_order`: 排序方向，desc/asc（暂未实现）

**请求示例**:
```http
GET /api/users/list?search=example&page=1&limit=10
```

**响应格式**:
```json
{
  "code": 0,
  "message": "Success",
  "data": {
    "users": [
      {
        "id": 1,
        "uuid": "user-uuid-1",
        "email": "user@example.com",
        "nickname": "User Name",
        "avatar_url": "https://...",
        "created_at": "2024-01-01T00:00:00.000Z",
        "subscription": {
          "plan_name": "Monthly Pro",
          "plan_interval": "month",
          "plan_price": 15.9,
          "subscription_status": "active",
          "remain_count": 100,
          "current_period_start": "2024-01-01T00:00:00.000Z",
          "current_period_end": "2024-02-01T00:00:00.000Z"
        },
        "credits": {
          "period_remain_count": 100,
          "used_count": 0,
          "is_subscription_active": true
        }
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 10,
      "total_items": 25,
      "total_pages": 3
    }
  }
}
```

### 2. 用户信息查询

**端点**: `GET /api/users/[uuid]`

**功能**: 获取指定用户的完整信息

**路径参数**:
- `uuid`: 用户 UUID

**请求示例**:
```http
GET /api/users/123e4567-e89b-12d3-a456-426614174000
```

**响应格式**:
```json
{
  "code": 0,
  "message": "Success",
  "data": {
    "user": {
      "id": 1,
      "uuid": "123e4567-e89b-12d3-a456-426614174000",
      "email": "user@example.com",
      "nickname": "User Name",
      "avatar_url": "https://...",
      "created_at": "2024-01-01T00:00:00.000Z",
      "locale": "en",
      "signin_type": "google"
    },
    "subscription": {
      "plan_name": "Monthly Pro",
      "plan_interval": "month",
      "plan_price": 15.9,
      "subscription_status": "active",
      "remain_count": 100,
      "current_period_start": "2024-01-01T00:00:00.000Z",
      "current_period_end": "2024-02-01T00:00:00.000Z"
    },
    "credits": {
      "id": 1,
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "period_remain_count": 100,
      "used_count": 0,
      "is_subscription_active": true,
      "period_start": "2024-01-01T00:00:00.000Z",
      "period_end": "2024-02-01T00:00:00.000Z"
    }
  }
}
```

### 3. 用户订阅历史

**端点**: `GET /api/users/[uuid]/subscriptions`

**功能**: 获取用户订阅和支付历史记录

**路径参数**:
- `uuid`: 用户 UUID

**查询参数**:
- `page`: 页码，默认 1
- `limit`: 每页数量，默认 20

**请求示例**:
```http
GET /api/users/123e4567-e89b-12d3-a456-426614174000/subscriptions?page=1&limit=10
```

**响应格式**:
```json
{
  "code": 0,
  "message": "Success",
  "data": {
    "history": [
      {
        "id": 1,
        "plan_name": "1",
        "status": "active",
        "current_period_start": "2024-01-01T00:00:00.000Z",
        "current_period_end": "2024-02-01T00:00:00.000Z",
        "created_at": "2024-01-01T00:00:00.000Z",
        "cancel_at_period_end": false,
        "type": "subscription"
      },
      {
        "id": 2,
        "amount": 15.9,
        "currency": "USD",
        "status": "success",
        "creem_checkout_id": "checkout_123",
        "creem_subscription_id": "sub_123",
        "created_at": "2024-01-01T00:00:00.000Z",
        "type": "payment"
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 10,
      "total_items": 2,
      "total_pages": 1
    }
  }
}
```

### 4. 用户积分历史

**端点**: `GET /api/users/[uuid]/credits/history`

**功能**: 获取用户积分使用历史

**路径参数**:
- `uuid`: 用户 UUID

**查询参数**:
- `page`: 页码，默认 1
- `limit`: 每页数量，默认 20

**请求示例**:
```http
GET /api/users/123e4567-e89b-12d3-a456-426614174000/credits/history?page=1&limit=10
```

**响应格式**:
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
        "original_id": "pred_123",
        "user_id": "123e4567-e89b-12d3-a456-426614174000",
        "effect_name": "flux-1-pro",
        "credit": 1,
        "status": "completed",
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
      "page_size": 10,
      "total_items": 10
    }
  }
}
```

## 统一响应格式

所有新的 API 都遵循统一的响应格式：

```json
{
  "code": 0,          // 0 表示成功，非 0 表示错误
  "message": "Success", // 操作结果描述
  "data": { ... }     // 实际数据，根据接口不同而变化
}
```

## 错误处理

错误响应格式：

```json
{
  "code": -1,
  "error": "错误信息"
}
```

常见错误码：
- `0`: 成功
- `-1`: 通用错误
- `-2`: 参数错误
- `-3`: 资源未找到

## 旧的 API 接口（待废弃）

以下接口已被新的 API 替代，建议逐步迁移：

1. `/api/admin/users/route.ts` → `/api/users/list`
2. `/api/admin/users/by-uuid/[uuid]/route.ts` → `/api/users/[uuid]`
3. `/api/user/get_user_subscription_info/route.ts` → 已集成到 `/api/users/[uuid]`
4. `/api/credit/history/route.ts` → `/api/users/[uuid]/credits/history`

## 使用建议

1. **新功能** 使用新的 API 接口
2. **现有功能** 逐步迁移到新接口
3. **管理后台** 可以继续使用 admin 接口，或考虑迁移到新接口
4. **前端应用** 优先使用新接口，获得更一致的数据格式