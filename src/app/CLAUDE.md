# CLAUDE.md - App Router 指南

本文件专门为 Claude Code 提供 Next.js 14 App Router 的详细开发指导。

## App Router 架构概述

使用 Next.js 14 的 App Router 架构，支持国际化和路由组织。

## 目录结构详解

```
src/app/
├── layout.tsx              # 根布局
├── page.tsx                # 首页
├── not-found.tsx           # 404 页面
├── globals.css             # 全局样式
├── [locale]/               # 国际化动态路由段
│   ├── layout.tsx          # 本地化布局
│   ├── providers.tsx       # 提供者组件
│   ├── (free)/             # 路由组 - 免费访问页面
│   │   ├── layout.tsx      # 免费页面布局
│   │   ├── page.tsx        # 主页面
│   │   ├── dashboard/      # 用户仪表板
│   │   ├── pricing/        # 定价页面
│   │   ├── text-to-image/  # 文字生成图像
│   │   └── legal/          # 法律页面
│   │       ├── privacy-policy/
│   │       └── terms-of-service/
└── api/                    # API 路由
    ├── auth/               # 身份认证
    ├── checkout/           # 支付结账
    ├── effect_result/      # AI 生成结果
    ├── predictions/        # AI 预测
    ├── r2/                 # 文件上传
    ├── user/               # 用户相关
    └── webhook/            # Webhook 处理
```

## 路由模式

### 国际化路由 ([locale])
- **动态段**：[locale] 支持多语言 URL
- **中间件处理**：自动语言检测和重定向
- **URL 示例**：
  - /en/dashboard - 英语仪表板
  - /zh/pricing - 中文定价页面

### 路由组 ((free))
- **组织目的**：逻辑分组而不影响 URL 结构
- **访问控制**：免费访问的页面组
- **嵌套布局**：可以有自己的 layout.tsx

### 页面类型
- **静态页面**：page.tsx - 基本页面组件
- **动态页面**：使用参数的页面
- **布局**：layout.tsx - 共享 UI 结构
- **加载UI**：loading.tsx - 加载状态
- **错误边界**：error.tsx - 错误处理

## API 路由设计

### RESTful API 模式
```typescript
// app/api/user/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // 处理 GET /api/user/[id]
}

export async function POST(request: Request) {
  // 处理 POST /api/user/[id]
}
```

### API 路由结构
```
api/
├── auth/[...nextauth]/     # NextAuth.js 认证端点
├── checkout/               # Stripe 结账处理
├── effect_result/          # AI 生成结果 CRUD
│   ├── count_all/         # 获取总数
│   ├── list_by_user_id/   # 按用户查询
│   └── update/            # 更新结果
├── predictions/            # AI 模型预测
│   ├── [id]/              # 查询预测状态
│   ├── img_to_video/      # 图像转视频
│   └── text_to_image/     # 文字生成图像
├── r2/upload/              # 文件上传到 R2
├── user/                   # 用户管理
│   ├── check_pro_status/  # 检查订阅状态
│   └── get_user_subscription_info/
└── webhook/                # 外部服务 Webhook
    ├── replicate/         # Replicate AI 回调
    └── stripe/            # Stripe 支付回调
```

## 页面组件模式

### 服务端组件 (默认)
```typescript
// app/[locale]/dashboard/page.tsx
export default async function DashboardPage() {
  // 可以直接进行数据获取
  const session = await getServerSession(authOptions);
  const userResults = await getUserResults(session.user.id);
  
  return (
    <div>
      <h1>仪表板</h1>
      <ResultsList results={userResults} />
    </div>
  );
}
```

### 客户端组件
```typescript
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function InteractiveComponent() {
  const { data: session } = useSession();
  const [state, setState] = useState();
  
  // 客户端交互逻辑
  return <div>{/* 交互式 UI */}</div>;
}
```

### 布局组件
```typescript
// app/[locale]/layout.tsx
export default function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale}>
          <Providers>
            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

## 数据获取模式

### 服务端数据获取
```typescript
// 在服务端组件中直接调用
export default async function Page() {
  const data = await fetch('http://localhost:3000/api/data');
  return <DataComponent data={data} />;
}
```

### 客户端数据获取
```typescript
'use client';

import useSWR from 'swr';

export default function ClientDataComponent() {
  const { data, error } = useSWR('/api/data', fetcher);
  
  if (error) return <div>Error loading data</div>;
  if (!data) return <div>Loading...</div>;
  
  return <div>{data.content}</div>;
}
```

### API 调用示例
```typescript
// POST 请求示例
async function createPrediction(prompt: string) {
  const response = await fetch('/api/predictions/text_to_image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });
  
  return response.json();
}
```

## 认证和授权

### 页面级保护
```typescript
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/api/auth/signin');
  }
  
  return <AuthenticatedContent />;
}
```

### API 路由保护
```typescript
// app/api/protected/route.ts
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // 受保护的 API 逻辑
}
```

## 错误处理

### 全局错误边界
```typescript
// app/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### API 错误处理
```typescript
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await processRequest(body);
    return Response.json(result);
  } catch (error) {
    console.error('API Error:', error);
    return Response.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
```

## 国际化集成

### 页面级翻译
```typescript
import { getTranslations } from 'next-intl/server';

export default async function PricingPage() {
  const t = await getTranslations('Pricing');
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  );
}
```

### 客户端翻译
```typescript
'use client';

import { useTranslations } from 'next-intl';

export default function ClientComponent() {
  const t = useTranslations('Common');
  
  return <button>{t('submit')}</button>;
}
```

## 性能优化

### 静态生成
```typescript
// 生成静态参数
export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'zh' },
  ];
}
```

### 动态导入
```typescript
import dynamic from 'next/dynamic';

const DynamicComponent = dynamic(() => import('../components/Heavy'), {
  loading: () => <p>Loading...</p>,
});
```

### 图像优化
```typescript
import Image from 'next/image';

export default function OptimizedImage() {
  return (
    <Image
      src="/hero.jpg"
      alt="Hero Image"
      width={800}
      height={600}
      priority
    />
  );
}
```

## 开发调试

### 开发工具
- **热重载**：自动刷新页面和组件
- **错误覆盖**：开发模式下的详细错误信息
- **Fast Refresh**：保持组件状态的快速刷新

### 日志调试
```typescript
// 开发环境日志
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data);
}
```

### 类型安全
```typescript
// 页面参数类型
interface PageProps {
  params: { locale: string; id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function Page({ params, searchParams }: PageProps) {
  // 类型安全的参数访问
}
```