# CLAUDE.md - 前端架构指南

本文件专门为 Claude Code 提供前端开发相关的指导。

## 注意

**当前状态**: 此项目已转换为 API-only 服务，前端已被完全移除以优化性能。本文件保留作为历史参考，如需重新添加前端，可参考此文档。

## 原前端技术栈

### 核心框架
- **Next.js 14.2.11** - 使用 App Router 的 React 框架
- **TypeScript 5** - 类型安全的 JavaScript
- **React 18** - 用户界面库

### 样式和组件
- **Tailwind CSS 3.4** - 实用工具优先的 CSS 框架
- **NextUI 2.4.7** - 现代 React UI 库
- **HeroUI 2.6.14** - 额外的 UI 组件
- **Framer Motion 11.17.0** - React 动画库
- **GSAP 3.12.5** - 高性能动画库
- **Lucide React** + **React Icons** - 图标库

### 状态管理和工具
- **NextAuth.js 4.24.7** - 身份认证
- **Next-intl 3.19.1** - 国际化
- **Next-themes 0.3.0** - 主题切换
- **usehooks-ts** - 实用的 React hooks
- **Sonner** - 通知组件

## 原项目结构

```
src/
├── app/                     # Next.js App Router
│   ├── [locale]/            # 国际化路由
│   │   ├── (free)/         # 路由组 - 公开页面
│   │   │   ├── dashboard/  # 用户仪表板
│   │   │   ├── pricing/    # 定价页面
│   │   │   └── text-to-image/ # 文字生成图像
│   │   └── layout.tsx      # 根布局
│   ├── api/                # API 路由（仍保留）
│   └── globals.css         # 全局样式
├── components/             # React 组件（已移除）
│   ├── landingpage/        # 落地页组件
│   ├── replicate/          # AI 生成相关组件
│   ├── layout/             # 布局组件
│   └── price/              # 定价组件
├── contexts/               # React Context（已移除）
├── lib/                    # 工具函数（部分保留）
├── backend/                # 后端逻辑（保留）
└── config/                 # 应用配置
```

## 组件开发模式（参考）

### 服务端 vs 客户端组件
- 默认使用服务端组件进行数据获取和初始渲染
- 仅在需要交互性时使用 "use client" 指令
- 布局组件通常是服务端组件

### 组件组织
- **功能导向**：按功能领域组织组件（如 landingpage/, replicate/）
- **共享组件**：放在 components/ 根目录下
- **页面特定组件**：紧邻相关页面放置

### 样式约定
- 优先使用 Tailwind CSS 类名
- 使用 NextUI/HeroUI 提供的预建组件
- 自定义样式使用 CSS 模块或 Tailwind 的 @apply 指令

## 国际化 (i18n)（参考）

### 结构
```
messages/
└── en.json                 # 英语翻译（已移除）
```

### 使用模式
```typescript
// 在服务端组件中
import {getTranslations} from 'next-intl/server';

export default async function Page() {
  const t = await getTranslations('HomePage');
  return <h1>{t('title')}</h1>;
}

// 在客户端组件中
import {useTranslations} from 'next-intl';

export default function ClientComponent() {
  const t = useTranslations('HomePage');
  return <h1>{t('title')}</h1>;
}
```

### URL 结构
- /{locale}/page - 本地化页面
- 默认语言环境：英语 (en)
- 在 middleware.ts 中处理语言检测

## 身份认证（参考）

### NextAuth.js 配置
- Google OAuth 提供商
- 会话管理通过服务端组件
- 受保护的路由通过中间件处理

### 使用模式
```typescript
// 获取会话
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session) return <LoginPrompt />;
  return <AuthenticatedContent />;
}
```

## 重新添加前端的建议

如需重新添加前端，建议：

1. **保留 API 结构** - 当前 API 路由设计良好，可直接使用
2. **使用现代框架** - 可选择 React、Vue、Svelte 或其他框架
3. **独立部署** - 考虑将前端单独部署，通过 API 与后端通信
4. **移动优先** - 确保良好的移动端体验

## API 集成示例

当前 API 可供任何前端框架使用：

```typescript
// React 示例
async function generateImage(prompt: string) {
  const response = await fetch('/api/predictions/text_to_image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });
  
  return response.json();
}
```