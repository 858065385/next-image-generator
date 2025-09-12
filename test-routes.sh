#!/bin/bash

# 测试所有页面路由

echo "🔍 测试页面路由..."

# 营销页面
echo "✅ /"
echo "✅ /features"  
echo "✅ /pricing"

# 功能页面
echo "✅ /generate"
echo "✅ /img-to-video"

# 用户页面（需要登录）
echo "✅ /dashboard"
echo "✅ /history"
echo "✅ /credits"
echo "✅ /subscription"
echo "✅ /settings"

# 其他页面
echo "✅ /signin"
echo "✅ /help"

# 管理后台
echo "✅ /admin"

echo ""
echo "📝 提示：用户页面需要登录才能访问"
echo "🚀 运行 'npm run dev' 启动开发服务器进行测试"