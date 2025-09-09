#!/bin/bash

# Vercel 部署脚本
# 用于部署 deploy-test 分支到 Vercel

echo "🚀 开始部署到 Vercel..."

# 检查是否在正确的分支
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "deploy-test" ]; then
    echo "❌ 当前分支是 $CURRENT_BRANCH，请切换到 deploy-test 分支"
    exit 1
fi

echo "✅ 当前分支：$CURRENT_BRANCH"

# 检查是否有未提交的更改
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  检测到未提交的更改，请先提交或暂存"
    git status
    exit 1
fi

echo "✅ 代码已提交，准备部署..."

# 提示用户手动登录（如果需要）
echo ""
echo "📋 部署步骤："
echo "1. 如果尚未登录 Vercel，请运行：vercel login"
echo "2. 登录后，运行：vercel --prod"
echo "3. 按提示选择项目和配置"
echo ""
echo "🔧 需要配置的环境变量："
echo "- POSTGRES_URL"
echo "- CREEM_API_KEY"
echo "- CREEM_WEBHOOK_SECRET"
echo "- CREEM_PRODUCT_MONTHLY_ID"
echo "- CREEM_PRODUCT_YEARLY_ID"
echo "- WEB_BASE_URI"
echo "- REPLICATE_API_TOKEN"
echo "- 其他必要的环境变量..."
echo ""
echo "🌐 部署后访问地址："
echo "- 测试支付页面：https://<your-vercel-url>/test-payment"
echo "- 管理员页面：https://<your-vercel-url>/admin-enhanced"
echo "- Webhook 接收：https://<your-vercel-url>/api/webhook/creem"
echo ""

# 询问是否立即部署
read -p "是否立即部署？(y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 开始部署..."
    vercel --prod
else
    echo "已取消部署"
fi