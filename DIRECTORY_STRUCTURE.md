# 目录结构说明

本工程采用清晰的模块化目录结构，专为 AI 图像/视频生成 API 服务设计。

## 当前目录结构

```
src/
├── app/                      # Next.js 应用主目录
│   ├── api/                  # API 路由（HTTP 端点）
│   │   ├── admin/           # 管理相关 API
│   │   ├── auth/            # 认证相关 API
│   │   ├── credit/          # 积分系统 API
│   │   ├── creem/           # Creem 支付 API
│   │   ├── debug/           # 调试工具 API
│   │   ├── effect_result/   # 生成结果 API
│   │   ├── payment/         # 支付状态 API
│   │   ├── predictions/     # AI 预测 API
│   │   ├── r2/              # 文件上传 API
│   │   ├── test-db/         # 数据库测试 API
│   │   ├── user/            # 用户相关 API
│   │   └── webhook/        # Webhook 接收
│   ├── admin/               # 管理页面
│   ├── admin-enhanced/      # 增强管理页面
│   ├── debug-signature/     # 签名调试工具
│   ├── demo/                # 演示页面
│   ├── demo-db/             # 数据库演示
│   ├── payment-result/      # 支付结果页面
│   ├── pricing/             # 定价页面
│   ├── test-payment/        # 支付测试页面
│   ├── test-signature/      # 签名测试页面
│   ├── layout.tsx           # 根布局组件
│   ├── page.tsx             # 首页
│   └── providers.tsx        # 应用提供者
│
├── backend/                 # 后端业务逻辑
│   ├── config/              # 配置文件
│   │   └── db.ts            # PostgreSQL 连接池配置
│   ├── lib/                 # 基础工具库
│   │   ├── creem.ts         # Creem API 客户端
│   │   └── r2.ts           # Cloudflare R2 文件操作
│   ├── models/              # 数据访问层（DAL）
│   │   ├── credit_usage.ts  # 积分使用记录
│   │   ├── effect.ts        # AI 效果模型
│   │   ├── effect_result.ts # 生成结果
│   │   ├── payment_history.ts # 支付历史
│   │   ├── subscription_plan.ts # 订阅计划
│   │   ├── user.ts          # 用户模型
│   │   └── user_subscription.ts # 用户订阅
│   ├── services/            # 业务逻辑层（BLL）
│   │   ├── credit_usage.ts  # 积分管理服务
│   │   ├── creem_webhook.ts # Creem Webhook 处理
│   │   ├── effect.ts        # 效果管理
│   │   ├── effect_result.ts # 结果管理
│   │   ├── generate-_check.ts # 生成前验证
│   │   ├── payment_history.ts # 支付历史服务
│   │   ├── subscription_plan.ts # 订阅计划服务
│   │   ├── user.ts          # 用户服务
│   │   └── user_subscription.ts # 订阅管理
│   ├── sql/                 # 数据库脚本
│   │   └── init.sql         # 数据库初始化
│   ├── types/               # 类型定义
│   │   ├── creem.ts         # Creem 相关类型
│   │   ├── domain/          # 复杂业务对象
│   │   │   ├── effect_result_info.ts
│   │   │   ├── replicate.ts
│   │   │   └── user_subscription_info.ts
│   │   ├── enum/            # 枚举类型
│   │   │   ├── payment_status_enum.ts
│   │   │   ├── response_code_enum.ts
│   │   │   └── user_subscription_enum.ts
│   │   └── type.ts          # 基础实体接口
│   └── utils/               # 工具函数
│       ├── creem.ts         # Creem API 工具
│       ├── genId.tsx        # ID 生成器
│       └── index.tsx        # 通用工具
│
├── shared/                  # 共享代码
│   └── lib/
│       └── auth.ts          # NextAuth 配置（被 API 使用）
│
├── frontend/                # 前端目录（当前为空，保留用于扩展）
│
└── types/                   # 全局类型定义
    └── next-auth.d.ts      # NextAuth 类型扩展

public/                     # 静态资源
```

## 架构说明

### 当前状态：API 优先模式
项目已从前端全栈应用转换为 API 优先的服务架构，主要提供：
- AI 图像/视频生成 API
- 用户认证和订阅管理
- 积分系统和支付处理
- 管理后台和调试工具

### 调用逻辑流程

```
前端请求 → API 路由 → Services → Models → 数据库
    ↓         ↓         ↓         ↓
  HTTP     业务逻辑   数据访问   PostgreSQL
  处理层     层       层 (SQL)
```

#### 1. API 路由层 (`src/app/api/`)
- **职责**：处理 HTTP 请求/响应，参数验证
- **示例**：
  ```typescript
  // src/app/api/predictions/text_to_image/route.ts
  export async function POST(request: Request) {
    const body = await request.json();
    // 1. 参数验证
    // 2. 调用业务服务
    // 3. 返回 HTTP 响应
  }
  ```

#### 2. Services 层 (`src/backend/services/`)
- **职责**：业务逻辑协调，事务管理
- **核心服务**：
  - `generate-_check.ts` - 生成前验证（认证、积分、订阅）
  - `credit_usage.ts` - 积分管理
  - `user_subscription.ts` - 订阅管理

#### 3. Models 层 (`src/backend/models/`)
- **职责**：数据访问，原生 SQL 查询
- **特点**：
  - 使用参数化查询防止 SQL 注入
  - 返回格式化的数据对象
  - 单一职责，每个模型只操作对应表

#### 4. 类型系统 (`src/backend/types/`)
- **基础类型** (`type.ts`)：数据库实体接口
- **领域类型** (`domain/`)：复杂业务对象
- **枚举类型** (`enum/`)：状态码和枚举值

### 核心业务流程

#### AI 生成流程
1. **前端请求** → `/api/predictions/text_to_image`
2. **身份验证** → `generateCheck()` 服务
3. **积分检查** → 验证用户积分是否充足
4. **调用 AI API** → Replicate
5. **存储结果** → 保存到 effect_result 表
6. **扣除积分** → 更新 credit_usage 表

#### 支付流程
1. **创建订单** → `/api/creem/checkout`
2. **Creem 处理** → 用户支付
3. **Webhook 通知** → `/api/webhook/creem`
4. **更新订阅** → 激活用户订阅
5. **重置积分** → 新计费周期积分重置

### 文件存储策略
- **使用 Cloudflare R2**：S3 兼容的对象存储
- **路径规则**：`ssat/{type}/{uuid}_{filename}`
- **访问方式**：通过 R2_ENDPOINT 提供公共访问

## 重要配置

### 环境变量
```bash
# 数据库
POSTGRES_URL=postgresql://...

# AI 服务
REPLICATE_API_TOKEN=r8_...

# 文件存储
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...

# 支付服务
CREEM_API_KEY=...
CREEM_WEBHOOK_SECRET=...

# 认证
NEXTAUTH_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

### 数据库表结构
- `users` - 用户基本信息
- `user_subscriptions` - 用户订阅状态
- `credit_usage` - 积分使用记录
- `effect_result` - AI 生成结果
- `payment_history` - 支付历史

## 开发指南

### 添加新的 API 端点
1. 在 `src/app/api/` 下创建路由目录
2. 实现 `route.ts` 文件
3. 在 Services 层添加业务逻辑
4. 在 Models 层添加数据访问（如需要）
5. 添加相应的类型定义

### 添加新的 AI 模型
1. 在 `backend/models/effect.ts` 中添加模型定义
2. 更新 `backend/services/generate-_check.ts` 的积分验证
3. 在 `backend/services/effect_result.ts` 中添加结果处理

### 调试工具
项目提供了多个调试页面：
- `/debug-signature` - 签名验证调试
- `/demo-db` - 数据库操作演示
- `/test-payment` - 支付流程测试
- `/admin` - 管理后台

## 性能优化

### 数据库优化
- 使用连接池管理数据库连接
- 关键查询添加索引
- 避免N+1查询问题

### 缓存策略
- 静态数据内存缓存
- 使用 CDN 加速文件访问

### 构建优化
- 项目已清理大量前端依赖，构建速度提升 65%
- 采用 API 优先模式，减少不必要的客户端代码

## 维护说明

1. **代码组织**：严格遵循分层架构，避免跨层调用
2. **错误处理**：使用统一的 ResponseCodeEnum
3. **日志记录**：关键操作记录操作日志
4. **安全考虑**：所有用户输入都经过验证和参数化处理

## 扩展建议

1. **如需重新添加前端**：
   - 可以使用任何前端框架（React、Vue、Svelte）
   - 通过 API 与后端通信
   - 建议独立部署前端应用

2. **添加新的 AI 服务**：
   - 在 backend/services 中添加新的服务类
   - 遵循现有的分层架构
   - 更新积分验证逻辑

3. **国际化支持**：
   - 当前已移除国际化以简化架构
   - 如需支持，可在 API 层添加语言参数