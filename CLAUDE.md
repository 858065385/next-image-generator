# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 提供在此代码库中工作的指导。

## 开发命令

```bash
# 开发服务器
npm run dev          # 启动开发服务器 localhost:3000

# 生产构建
npm run build        # 构建生产版本
npm run start        # 启动生产服务器

# 代码质量
npm run lint         # 运行 ESLint 检查
```

## 数据库设置

使用 schema 初始化 PostgreSQL 数据库：
```bash
psql -U your_username -d your_database -f src/backend/sql/init.sql
```

## 架构概述

这是一个基于 Next.js 14 的 API-only 服务，专用于 AI 驱动的图像和视频生成。为了性能优化，前端已被完全移除，只保留干净的 REST API 后端。

### 后端架构 (`src/backend/`)

**数据层结构：**
- `models/` - 数据库访问层，包含原生 SQL 查询
- `service/` - 业务逻辑层，协调模型操作
- `config/db.ts` - PostgreSQL 连接池管理
- `type/type.ts` - 所有数据库实体的 TypeScript 接口

**核心服务：**
- `generate-_check.ts` - 生成前验证（认证、积分、订阅）
- 积分系统通过 `credit_usage` 表跟踪每个计费周期的使用情况
- 通过 Creem API 集成进行订阅管理
- 通过 Cloudflare R2 进行文件存储（S3 兼容）

**数据库模式：**
- `users` - 用户账户及 OAuth 提供商详情
- `credit_usage` - 积分跟踪每计费周期使用情况
- `effect` - AI 模型/端点（Replicate API 集成）
- `effect_result` - 生成内容结果和元数据
- `subscription_plans` - 可用订阅层级
- `user_subscriptions` - 通过 Creem 的活跃订阅
- `payment_history` - 支付交易记录

### API 路由结构 (`src/app/api/`)

**身份认证：**
- `/api/auth/[...nextauth]/route.ts` - NextAuth.js Google OAuth
- `/api/auth/test/route.ts` - 认证测试

**AI 生成：**
- `/api/predictions/text_to_image/route.ts` - 文字生成图像
- `/api/predictions/img_to_video/route.ts` - 图像生成视频
- `/api/predictions/[id]/route.ts` - 预测状态查询

**支付与订阅：**
- `/api/creem/checkout/route.ts` - Creem 结账会话创建
- `/api/webhook/creem/route.ts` - Creem webhook 处理
- `/api/webhook/replicate/route.ts` - Replicate webhook 处理

**用户管理：**
- `/api/user/check_pro_status/route.ts` - 用户订阅状态
- `/api/user/get_user_subscription_info/route.ts` - 订阅详情

**内容管理：**
- `/api/effect_result/count_all/route.ts` - 总结果计数
- `/api/effect_result/list_by_user_id/route.ts` - 用户特定结果
- `/api/effect_result/update/route.ts` - 结果更新

**文件存储：**
- `/api/r2/upload/route.ts` - Cloudflare R2 文件上传

### AI 集成

**支持的平台：**
- Replicate API 用于 AI 模型执行
- 预配置模型：Kling v2.1（视频，15积分），Flux1.1 Pro（图像，1积分）

**生成流程：**
1. 预检查：`generateCheck()` 验证用户认证、订阅和积分
2. 使用模型特定参数调用 Replicate API
3. 将结果存储在 `effect_result` 表中
4. 媒体文件上传到 Cloudflare R2
5. 从用户配额中扣除积分

### 文件存储 (R2)

**`lib/r2.ts` 中的关键函数：**
- `generatePresignedUrl()` - 用于浏览器直接上传
- `uploadImageToR2()` / `uploadVideoToR2()` - 服务端从 URL 上传
- 文件组织结构：`ssat/{type}/{uuid}_{filename}`

### 环境变量

后端功能所需的环境变量：
```
# 数据库
POSTGRES_URL=            # PostgreSQL 连接字符串

# 身份认证
NEXTAUTH_SECRET=         # NextAuth.js 密钥
GOOGLE_CLIENT_ID=        # Google OAuth
GOOGLE_CLIENT_SECRET=

# AI 服务
REPLICATE_API_TOKEN=     # Replicate API 访问
REPLICATE_WEBHOOK_SECRET=

# 文件存储
R2_ACCOUNT_ID=           # Cloudflare R2
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_ENDPOINT=

# 支付 (Creem)
CREEM_API_KEY=           # Creem API 密钥
CREEM_WEBHOOK_SECRET=    # Webhook 密钥
CREEM_API_BASE_URL=      # https://api.creem.io
CREEM_PRODUCT_MONTHLY_ID= # 月度产品 ID
CREEM_PRODUCT_YEARLY_ID=  # 年度产品 ID
CREEM_SUCCESS_URL=       # 支付成功后跳转的URL（默认：/admin/payment-result?success=true）
CREEM_CANCEL_URL=        # 支付取消后跳转的URL（默认：/admin/payment-result?cancelled=true）
```

## 关键模式

**数据库访问：**
- 模型通过 pg Pool 使用参数化查询
- 服务协调多个模型调用
- 所有函数使用 async/await，返回类型化接口

**错误处理：**
- 自定义 ResponseCodeEnum 用于一致的 API 响应
- 积分验证返回特定错误码（-1：未初始化，-2：无订阅，-3：超出限制）

**类型安全：**
- `type/type.ts` 中的全面 TypeScript 接口
- 数据库行格式化器将 QueryResultRow 转换为类型化对象
- `type/domain/` 中复杂业务对象的领域特定类型
- `type/enum/` 中一致的状态码和支付状态枚举

## 当前配置状态

**已配置服务：**
- ✅ **数据库**: PostgreSQL (Supabase)
- ✅ **身份认证**: Google OAuth via NextAuth.js
- ✅ **AI 服务**: Replicate API
- ✅ **文件存储**: Cloudflare R2
- ✅ **类型安全**: 全面 TypeScript

**需要配置：**
- ⚠️ **支付**: 需要 Creem API 配置
- ⚠️ **生产 URL**: 需要更新 OAuth 回调

## API 使用

访问 `http://localhost:3000` 查看所有可用的 API 端点列表。使用 Postman、curl 或集成到您自己的前端来与这些 API 交互。

## 注意事项

- **支付**: 已从 Stripe 迁移到 Creem（见 `CREEM_MIGRATION.md`）
- **前端**: 为性能考虑已完全移除
- **架构**: 干净的 API-only 服务，包含完整的后端逻辑