# API 接口完整文档

## 概述

本文档详细列出了 Next.js AI Image/Video Generator 项目的所有 API 接口。

## 接口统计

- **总接口数**: 49个
- **认证接口**: 32个
- **公开接口**: 17个
- **管理员接口**: 8个
- **调试接口**: 12个

## 1. 身份认证模块 (4个)

### 用户认证
- `POST /api/auth/[...nextauth]` - NextAuth Google OAuth
- `POST /api/auth/register` - 用户注册
- `GET /api/auth/test` - 测试认证状态
- `GET /api/auth/session` - 获取会话信息

## 2. 支付与订阅模块 (3个)

### Creem 支付
- `POST /api/creem/checkout` - 创建结账会话
- `POST /api/creem/verify-signature` - 验证支付签名
- `POST /api/payment/check-status` - 检查支付状态

## 3. 积分管理模块 (4个)

### 积分操作
- `POST /api/credit/adjust` - 调整积分 (增/减)
- `POST /api/credit/history` - 积分使用历史
- `POST /api/credit/manage` - 积分记录管理
- `GET /api/credit/info` - 获取积分信息

## 4. AI 生成模块 (3个)

### 图像/视频生成
- `POST /api/predictions/text_to_image` - 文字生成图像 (1积分)
- `POST /api/predictions/img_to_video` - 图像生成视频 (15积分)
- `GET /api/predictions/[id]` - 查询生成状态

## 5. 生成结果管理 (3个)

### 结果查询与管理
- `GET /api/effect_result/count_all` - 统计生成数量
- `GET /api/effect_result/list_by_user_id` - 分页获取生成历史
- `POST /api/effect_result/update` - 更新生成状态

## 6. 用户管理模块 (3个)

### 用户信息
- `POST /api/user/check_pro_status` - 检查付费状态
- `POST /api/user/get_user_subscription_info` - 获取订阅信息
- `POST /api/user/set-subscription` - 手动设置订阅

## 7. 文件存储模块 (1个)

### R2 存储
- `POST /api/r2/upload` - 上传文件到 Cloudflare R2

## 8. Webhook 处理 (3个)

### 第三方回调
- `POST /api/webhook/creem` - Creem 支付回调
- `POST /api/webhook/replicate` - Replicate AI 完成回调
- `POST /api/webhook/stripe` - Stripe 回调 (已禁用)

## 9. 管理员模块 (8个)

### 用户管理
- `GET /api/admin/users` - 用户列表 (搜索+分页)
- `GET /api/admin/users/[id]` - 用户详情
- `PUT /api/admin/users/[id]` - 更新用户
- `DELETE /api/admin/users/[id]` - 删除用户

### 积分管理
- `GET /api/admin/users/[id]/credits` - 用户积分详情
- `POST /api/admin/users/[id]/credits` - 调整用户积分
- `POST /api/admin/batch/credits` - 批量调整积分

### 订阅管理
- `GET /api/admin/users/[id]/subscription` - 用户订阅详情
- `POST /api/admin/users/[id]/subscription` - 管理用户订阅

### 统计与日志
- `GET /api/admin/stats/overview` - 系统概览统计
- `GET /api/admin/stats/credits` - 积分使用统计
- `GET /api/admin/logs` - 管理员日志

## 10. 调试测试模块 (12个)

### 系统调试
- `GET /api/debug/config` - 系统配置
- `POST /api/debug/test-db` - 数据库测试
- `POST /api/debug/query-db` - 数据库查询
- `POST /api/debug/test-creem-api` - Creem API 测试

### 功能测试
- `POST /api/debug/comprehensive-test` - 综合测试
- `POST /api/debug/check-user-subscription` - 订阅检查
- `POST /api/debug/simulate-subscription-payment` - 模拟支付
- `POST /api/debug/reset-user-subscription` - 重置订阅
- `POST /api/debug/signature-verification` - 签名验证
- `POST /api/debug/subscription-plans` - 订阅计划
- `POST /api/debug/init-subscription-plans` - 初始化计划
- `POST /api/debug/query-subscriptions` - 查询订阅

## 接口认证方式

### 1. 用户认证
大多数业务接口通过以下参数验证用户身份：
- `user_id` - 用户ID
- `user_uuid` - 用户UUID
- `user_email` - 用户邮箱

### 2. Session 认证
部分接口使用 NextAuth session：
```javascript
const session = await getServerSession(authOptions)
```

### 3. 签名验证
Webhook 接口使用 HMAC-SHA256 签名：
- Creem Webhook: `CREEM_WEBHOOK_SECRET`

### 4. 管理员权限
`/api/admin/*` 接口需要管理员权限

## 错误响应格式

```json
{
  "error": "错误信息",
  "code": "错误码",
  "details": {}
}
```

## 常用错误码

- `401` - 未授权
- `403` - 禁止访问
- `404` - 资源不存在
- `460` - 积分未初始化
- `461` - 无订阅
- `462` - 积分不足
- `500` - 服务器错误

## 使用示例

### 1. 用户注册
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "user": {
      "uuid": "uuid-123",
      "email": "user@example.com",
      "nickname": "User123",
      "avatar_url": "https://example.com/avatar.jpg"
    }
  }'
```

### 2. 创建支付
```bash
curl -X POST http://localhost:3000/api/creem/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "plan_id": 1,
    "amount": 1590,
    "interval": "month",
    "user_uuid": "uuid-123",
    "user_email": "user@example.com"
  }'
```

### 3. 生成图像
```bash
curl -X POST http://localhost:3000/api/predictions/text_to_image \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "uuid-123",
    "user_email": "user@example.com",
    "prompt": "A beautiful landscape",
    "width": 1024,
    "height": 768
  }'
```

### 4. 查询用户信息
```bash
curl -X POST http://localhost:3000/api/user/get_user_subscription_info \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "uuid-123"
  }'
```

---

**注意**: 所有接口都支持 HTTPS，生产环境请务必使用 HTTPS。