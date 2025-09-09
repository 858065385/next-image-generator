# CLAUDE.md - 组件架构指南

本文件专门为 Claude Code 提供组件开发的指导。

## 注意

**当前状态**: 此项目已转换为 API-only 服务，所有前端组件已被移除。本文件保留作为历史参考，记录了原有的组件架构和组织方式。

## 原组件结构

```
src/components/
├── landingpage/           # 落地页相关组件
│   ├── DownloadButton.tsx
│   ├── FeatureCard.tsx
│   ├── Hero.tsx
│   └── VideoCarousel.tsx
├── layout/                # 布局组件
│   ├── Footer.tsx
│   ├── Header.tsx
│   ├── Loading.tsx
│   ├── Logo.tsx
│   ├── Navigation.tsx
│   └── UserMenu.tsx
├── price/                 # 定价相关组件
│   ├── PriceCard.tsx
│   └── PricingSwitch.tsx
├── replicate/             # AI 生成相关组件
│   ├── ImageGeneration.tsx
│   ├── VideoGeneration.tsx
│   └── ResultDisplay.tsx
└── ui/                    # 通用 UI 组件
    ├── Button.tsx
    ├── Input.tsx
    ├── Modal.tsx
    └── Toast.tsx
```

## 组件设计原则

### 1. 单一职责
- 每个组件只负责一个功能
- 保持组件简洁和可复用
- 避免过度复杂的组件

### 2. 组合优于继承
- 使用 children prop 进行内容组合
- 通过 props 配置组件行为
- 避免深度继承链

### 3. 类型安全
- 使用 TypeScript 接口定义 props
- 为可选属性提供默认值
- 使用泛型增强组件灵活性

## 组件开发模式

### 函数组件与 Hooks
```typescript
interface MyComponentProps {
  title: string;
  isLoading?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}

export default function MyComponent({
  title,
  isLoading = false,
  onClick,
  children
}: MyComponentProps) {
  const [state, setState] = useState('');
  
  return (
    <div className="my-component">
      <h2>{title}</h2>
      {children}
    </div>
  );
}
```

### 样式约定
- 使用 Tailwind CSS 类名
- 响应式设计优先
- 主题变量通过 CSS 变量管理

### 状态管理
- 本地状态：使用 useState/useReducer
- 共享状态：使用 Context 或状态管理库
- 服务端状态：使用 React Query/SWR

## 特定组件类型

### 页面组件
- 直接对应路由页面
- 通常使用服务端组件
- 负责数据获取和布局

### 容器组件
- 管理状态和业务逻辑
- 将数据传递给展示组件
- 处理用户交互

### 展示组件
- 只负责 UI 渲染
- 通过 props 接收数据
- 不包含业务逻辑

### 通用组件
- 可复用的基础组件
- 如按钮、输入框、模态框等
- 高度可配置

## 性能优化

### React.memo
```typescript
const ExpensiveComponent = React.memo(function ExpensiveComponent({ data }) {
  // 渲染逻辑
});
```

### useMemo 和 useCallback
```typescript
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
const handleClick = useCallback(() => {
  // 处理点击
}, [dependency]);
```

### 懒加载
```typescript
const LazyComponent = React.lazy(() => import('./LazyComponent'));
```

## 测试策略

### 单元测试
- 测试组件渲染
- 测试用户交互
- Mock 外部依赖

### 集成测试
- 测试组件间的交互
- 测试与 API 的集成
- 使用 React Testing Library

## 可访问性

### 语义化 HTML
- 使用正确的 HTML 标签
- 提供适当的 ARIA 属性
- 确保键盘可访问

### 对比度和焦点
- 确保足够的颜色对比度
- 管理焦点状态
- 支持屏幕阅读器

## 重新添加组件的建议

如需重新添加前端组件，建议：

1. **现代框架选择**
   - React 18 + TypeScript
   - Vue 3 + Composition API
   - SvelteKit

2. **组件库选择**
   - NextUI / HeroUI（如使用 React）
   - Ant Design / Material UI
   - Chakra UI

3. **状态管理**
   - Zustand（轻量级）
   - Jotai（原子化）
   - Redux Toolkit（大型应用）

4. **样式方案**
   - Tailwind CSS（推荐）
   - CSS Modules
   - Styled Components

5. **组件组织**
   - 按功能分组
   - 使用绝对路径导入
   - 保持组件扁平化

## API 集成示例

当前 API 可供任何前端框架使用：

```typescript
// React + Fetch API 示例
async function generateImage(prompt: string) {
  const response = await fetch('/api/predictions/text_to_image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ prompt })
  });
  
  if (!response.ok) {
    throw new Error('Generation failed');
  }
  
  return response.json();
}
```