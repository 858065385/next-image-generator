# Creem 签名验证文档

## 1. Webhook 签名验证

### 签名生成方式
- **算法**: HMAC-SHA256
- **密钥**: Webhook Secret
- **数据**: 请求体（raw body）
- **位置**: HTTP 头 `creem-signature`

### 代码实现
```typescript
import * as crypto from 'crypto';

function generateWebhookSignature(payload: string, secret: string): string {
  const computedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return computedSignature;
}
```

## 2. Return URL 签名验证

### 签名生成方式
- **算法**: SHA256（非 HMAC）
- **密钥**: API Key 作为 salt
- **数据**: URL 查询参数（排除 signature）
- **格式**: `key=value|key=value|...|salt=${apiKey}`
- **位置**: URL 查询参数 `signature`

### 参数格式
Return URL 包含以下参数：
- `checkout_id` - Checkout session ID
- `order_id` - 订单 ID
- `customer_id` - 客户 ID
- `subscription_id` - 订阅 ID
- `product_id` - 产品 ID
- `request_id` - 可选，请求 ID
- `signature` - 签名

### 代码实现
```typescript
interface RedirectParams {
  request_id?: string | null;
  checkout_id?: string | null;
  order_id?: string | null;
  customer_id?: string | null;
  subscription_id?: string | null;
  product_id?: string | null;
}

function generateReturnURLSignature(params: RedirectParams, apiKey: string): string {
  const data = Object.entries(params)
    .map(([key, value]) => `${key}=${value}`)
    .concat(`salt=${apiKey}`)
    .join('|');
  return crypto.createHash('sha256').update(data).digest('hex');
}
```

### 验证步骤
1. 从 URL 中提取查询参数（排除 signature）
2. 按字母顺序排序参数
3. 格式化为 `key=value` 形式
4. 用 `|` 连接所有参数
5. 添加 `salt=${apiKey}`
6. 计算 SHA256 哈希
7. 与 URL 中的 signature 比较

## 重要提醒

- **Webhook 和 Return URL 使用不同的签名算法**
- **Webhook 使用 HMAC-SHA256 + Webhook Secret**
- **Return URL 使用 SHA256 + API Key**
- **确保使用正确的密钥和算法**