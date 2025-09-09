# CLAUDE.md - 后端架构指南

本文件专门为 Claude Code 提供后端开发的详细指导。

## 后端架构概览

后端采用分层架构设计，清晰地分离数据访问、业务逻辑和 API 层。基于 PostgreSQL 数据库，使用 TypeScript 和 Node.js pg 驱动程序。

## 目录结构详解

```
src/backend/
├── config/
│   └── db.ts                # 数据库连接池配置
├── lib/
│   └── r2.ts               # Cloudflare R2 文件存储操作
├── models/                 # 数据访问层（DAL）
│   ├── credit_usage.ts
│   ├── effect.ts
│   ├── effect_result.ts
│   ├── payment_history.ts
│   ├── subscription_plan.ts
│   ├── user.ts
│   └── user_subscription.ts
├── service/                # 业务逻辑层（BLL）
│   ├── credit_usage.ts
│   ├── effect.ts
│   ├── effect_result.ts
│   ├── generate-_check.ts  # 核心验证服务
│   ├── creem_webhook.ts    # Creem webhook 处理
│   ├── payment_history.ts
│   ├── subscription_plan.ts
│   ├── user.ts
│   └── user_subscription.ts
├── sql/
│   └── init.sql            # 数据库初始化脚本
├── type/
│   ├── creem.ts           # Creem 相关类型
│   ├── domain/             # 复杂业务对象类型
│   │   ├── effect.ts      # 效果领域类型
│   │   ├── payment.ts     # 支付领域类型
│   │   ├── subscription.ts # 订阅领域类型
│   │   └── user.ts        # 用户领域类型
│   ├── enum/               # 枚举类型
│   │   ├── payment.ts     # 支付状态枚举
│   │   ├── response.ts    # 响应码枚举
│   │   └── user_subscription_enum.ts
│   └── type.ts             # 基础实体接口
├── utils/
│   ├── creem.ts           # Creem API 客户端
│   ├── genId.tsx          # ID 生成工具
│   └── index.tsx          # 通用工具函数
```

## 数据库层设计

### 连接管理 (config/db.ts)
```typescript
// 单例连接池模式
let globalPool: Pool;

export function getDb() {
  if (!globalPool) {
    globalPool = new Pool({
      connectionString: process.env.POSTGRES_URL,
    });
  }
  return globalPool;
}
```

### Models 层模式
- **职责**：纯数据访问，原生 SQL 查询
- **命名**：动词 + 实体（如 insertUser, getByEmail）
- **返回**：Promise<Entity | undefined>
- **参数化查询**：防止 SQL 注入

**示例模式**：
```typescript
// models/user.ts
export async function insertUser(user: User) {
  const db = await getDb();
  return await db.query(
    `INSERT INTO users (uuid, email, ...) VALUES ($1, $2, ...)`,
    [user.uuid, user.email, ...]
  );
}

export async function getByEmail(email: string): Promise<User | undefined> {
  const db = getDb();
  const res = await db.query(`SELECT * FROM users WHERE email = $1`, [email]);
  return res.rowCount === 0 ? undefined : formatUser(res.rows[0]);
}
```

### Service 层模式
- **职责**：业务逻辑协调，组合多个 model 调用
- **命名**：业务动作（如 getUserSubscriptionInfo, validateCreditUsage）
- **事务管理**：跨表操作的数据一致性
- **错误处理**：业务规则验证

## 核心业务流程

### AI 生成验证流程 (generate-_check.ts)
```typescript
export async function generateCheck(user_id: string, user_email: string, credit: string) {
  // 1. 用户身份验证
  const user = await getUserByUuidAndEmail(user_id, user_email);
  if (!user || user.uuid !== user_id) {
    return Response.json({ error: "Please login first" }, 
      { status: ResponseCodeEnum.UNAUTHORIZED });
  }

  // 2. 积分使用情况检查
  const result = await checkCreditUsageByUserId(user_id, parseInt(credit));
  if (result !== 1) {
    // 返回特定错误码
    // -1: 未初始化, -2: 无订阅, -3: 超出限制
  }
  
  return 1; // 验证通过
}
```

### 积分系统设计
- **按周期计费**：每个订阅周期重置积分
- **实时扣减**：生成内容时立即扣除积分
- **状态跟踪**：credit_usage 表记录使用历史
- **余额计算**：period_remain_count = total_credits - used_count

### 订阅管理
- **Creem 集成**：通过 webhook 同步订阅状态
- **状态映射**：
  - active → 正常使用积分
  - past_due → 暂停服务
  - canceled → 保留数据但停止服务
- **周期处理**：自动更新 current_period_start/end

## 文件存储 (R2)

### 核心功能
```typescript
// 预签名 URL 上传
export async function generatePresignedUrl(
  fileType: string,
  bucketFolder: string,
  fileName: string
): Promise<{ presignedUrl: string; objectKey: string }>;

// 服务端上传
export async function uploadImageToR2(
  imageUrl: string,
  objectKey: string
): Promise<string>;
```

### 存储策略
- **路径规范**：ssat/{type}/{uuid}_{filename}
- **文件类型**：image (jpg/png), video (mp4)
- **访问控制**：公共读取，应用写入
- **CDN 加速**：通过 R2_ENDPOINT 提供访问

## 类型系统

### 实体接口 (type/type.ts)
- **数据库映射**：与 SQL 表结构一一对应
- **可选字段**：使用 ? 标记可为空的数据库字段
- **日期类型**：统一使用 Date 类型

### 响应码 (type/enum/response_code_enum.ts)
```typescript
export enum ResponseCodeEnum {
  SUCCESS = 200,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  CREDIT_NOT_INITED = 460,
  NONE_SUBSCRIBED = 461,
  // ...
}
```

### 复杂业务对象 (type/domain/)
- **聚合数据**：跨表查询的结果类型
- **API 响应**：前端交互的数据结构
- **外部 API**：第三方服务（如 Replicate）的类型定义

## 开发最佳实践

### SQL 查询
- **参数化**：始终使用 $1, $2 参数占位符
- **事务**：关键业务操作使用数据库事务
- **索引**：确保查询字段有适当索引

### 错误处理
- **分层处理**：Models 层抛出技术异常，Service 层处理业务异常
- **统一响应**：使用 ResponseCodeEnum 确保前后端错误码一致
- **日志记录**：关键操作记录操作日志

### 性能优化
- **连接池**：复用数据库连接
- **查询优化**：避免 N+1 查询问题
- **缓存策略**：静态数据使用内存缓存

## 环境配置

### 必需环境变量
```bash
# 数据库
POSTGRES_URL=postgresql://user:password@host:port/database

# Cloudflare R2
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=your_bucket_name
R2_ENDPOINT=https://your_domain.com

# AI 服务
REPLICATE_API_TOKEN=r8_your_token

# 支付 (Creem)
CREEM_API_KEY=your_creem_api_key
CREEM_WEBHOOK_SECRET=your_webhook_secret
CREEM_API_BASE_URL=https://api.creem.io
CREEM_PRODUCT_MONTHLY_ID=prod_monthly_xxx
CREEM_PRODUCT_YEARLY_ID=prod_yearly_xxx
```

## 调试和监控

### 日志策略
- **结构化日志**：JSON 格式便于解析
- **分级记录**：ERROR/WARN/INFO/DEBUG
- **业务指标**：用户活动、API 调用频率、错误率

### 数据库监控
- **慢查询**：监控执行时间 > 1秒的查询
- **连接数**：防止连接池耗尽
- **锁等待**：检测死锁和长时间锁等待

### API 性能
- **响应时间**：P95 < 500ms
- **错误率**：< 1%
- **并发处理**：支持高并发请求