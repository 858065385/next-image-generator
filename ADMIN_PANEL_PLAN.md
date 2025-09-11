# 后端管理页面规划方案

## 概述

基于现有的 49 个 API 接口，规划一个功能完整的后端管理系统，用于管理用户、订阅、积分和查看系统统计。

## 管理页面结构

```
/admin/
├── dashboard/           # 管理后台首页
├── users/              # 用户管理
├── subscriptions/      # 订阅管理
├── credits/           # 积分管理
├── generations/       # 生成记录
├── payments/          # 支付记录
├── stats/             # 统计分析
└── settings/          # 系统设置
```

## 1. 管理仪表盘 (/admin/dashboard)

### 功能模块
- **系统概览**
  - 总用户数
  - 活跃订阅数
  - 今日生成数
  - 收入统计
  
- **实时数据**
  - 在线用户数
  - 正在处理的生成任务
  - 最近支付记录
  
- **快捷操作**
  - 创建测试用户
  - 模拟支付
  - 系统健康检查

### 使用的 API
- `GET /api/admin/stats/overview`
- `GET /api/admin/stats/credits`
- `GET /api/admin/logs`

## 2. 用户管理 (/admin/users)

### 功能列表
- **用户列表**
  - 搜索用户（邮箱、昵称）
  - 分页浏览
  - 筛选（活跃/非活跃、订阅状态）
  
- **用户详情**
  - 基本信息（邮箱、昵称、注册时间）
  - 订阅状态
  - 积分余额
  - 生成历史
  
- **用户操作**
  - 编辑用户信息
  - 重置密码
  - 禁用/启用账户
  - 删除用户

### 使用的 API
- `GET /api/admin/users`
- `GET /api/admin/users/[id]`
- `PUT /api/admin/users/[id]`
- `DELETE /api/admin/users/[id]`
- `GET /api/admin/users/[id]/credits`
- `GET /api/admin/users/[id]/subscription`

## 3. 订阅管理 (/admin/subscriptions)

### 功能列表
- **订阅列表**
  - 所有订阅记录
  - 按状态筛选（活跃/已取消/过期）
  - 按计划筛选（月付/年付）
  
- **订阅详情**
  - 订阅信息
  - 支付历史
  - 积分使用情况
  
- **订阅操作**
  - 手动创建订阅
  - 取消订阅
  - 延长订阅期
  - 调整订阅计划

### 使用的 API
- `GET /api/admin/users/[id]/subscription`
- `POST /api/admin/users/[id]/subscription`
- `POST /api/user/set-subscription`

## 4. 积分管理 (/admin/credits)

### 功能列表
- **积分概览**
  - 总积分发放
  - 总积分消耗
  - 平均用户积分
  
- **积分调整**
  - 单个用户积分调整
  - 批量积分调整
  - 积分调整历史
  
- **积分规则**
  - 每月赠送积分
  - 注册赠送积分
  - 推荐奖励积分

### 使用的 API
- `GET /api/admin/users/[id]/credits`
- `POST /api/admin/users/[id]/credits`
- `POST /api/admin/batch/credits`
- `POST /api/credit/adjust`
- `POST /api/credit/history`

## 5. 生成记录管理 (/admin/generations)

### 功能列表
- **生成列表**
  - 所有生成记录
  - 按类型筛选（图像/视频）
  - 按时间筛选
  - 按用户筛选
  
- **生成详情**
  - 生成参数
  - 生成结果
  - 消耗积分
  - 生成时间
  
- **统计分析**
  - 热门提示词
  - 生成成功率
  - 平均生成时间

### 使用的 API
- `GET /api/effect_result/list_by_user_id`
- `GET /api/effect_result/count_all`
- `POST /api/effect_result/update`

## 6. 支付管理 (/admin/payments)

### 功能列表
- **支付记录**
  - 所有支付记录
  - 按状态筛选
  - 按时间筛选
  
- **支付详情**
  - 订单信息
  - 用户信息
  - 订阅信息
  
- **退款管理**
  - 处理退款请求
  - 退款历史

### 使用的 API
- `POST /api/payment/check-status`
- `GET /api/debug/query-subscriptions`

## 7. 统计分析 (/admin/stats)

### 功能列表
- **用户统计**
  - 新增用户趋势
  - 活跃用户趋势
  - 用户留存率
  
- **收入统计**
  - 日/周/月收入
  - 订阅转化率
  - 付费用户占比
  
- **使用统计**
  - 功能使用分布
  - 积分消耗趋势
  - 高峰使用时段

### 使用的 API
- `GET /api/admin/stats/overview`
- `GET /api/admin/stats/credits`

## 8. 系统设置 (/admin/settings)

### 功能列表
- **订阅计划管理**
  - 添加/编辑/删除计划
  - 设置价格和积分
  
- **系统配置**
  - 环境变量查看
  - 系统日志查看
  
- **调试工具**
  - API 测试
  - 数据库查询
  - 签名验证测试

### 使用的 API
- `POST /api/debug/init-subscription-plans`
- `GET /api/debug/config`
- `POST /api/debug/test-creem-api`
- `POST /api/debug/comprehensive-test`

## 页面组件设计

### 通用组件
1. **侧边栏导航**
   - 响应式设计
   - 权限控制
   
2. **数据表格**
   - 搜索
   - 筛选
   - 排序
   - 分页
   
3. **统计卡片**
   - 数字显示
   - 趋势图表
   
4. **模态框**
   - 表单提交
   - 确认对话框

### 特色功能
1. **实时数据更新**
   - 使用 WebSocket 或轮询
   - 实时显示系统状态
   
2. **批量操作**
   - 批量调整积分
   - 批量导出数据
   
3. **数据导出**
   - CSV 格式
   - Excel 格式
   
4. **操作日志**
   - 记录所有管理操作
   - 可追溯操作历史

## 技术实现建议

### 前端技术栈
- **UI 框架**: NextUI 2.x + Tailwind CSS
- **图表库**: Chart.js 或 Recharts
- **表格**: TanStack Table
- **状态管理**: Zustand
- **数据获取**: SWR 或 React Query

### 权限控制
- 基于角色的访问控制（RBAC）
- 路由级别保护
- API 级别验证

### 性能优化
- 数据分页加载
- 搜索防抖
- 图片懒加载
- 缓存策略

## 实施优先级

### 第一阶段（核心功能）
1. [ ] 管理仪表盘
2. [ ] 用户管理
3. [ ] 订阅管理
4. [ ] 基础积分管理

### 第二阶段（扩展功能）
1. [ ] 生成记录管理
2. [ ] 支付记录查看
3. [ ] 统计分析

### 第三阶段（高级功能）
1. [ ] 批量操作
2. [ ] 数据导出
3. [ ] 实时更新
4. [ ] 系统设置

## 安全考虑

1. **认证**
   - 必须登录才能访问
   - Session 超时自动退出
   
2. **权限**
   - 超级管理员才有权限
   - 操作日志记录
   
3. **数据安全**
   - 敏感信息脱敏显示
   - 删除操作二次确认

---

**注意**: 当前已有 `/admin-enhanced` 页面作为管理后台的雏形，可以基于此进行功能扩展和优化。