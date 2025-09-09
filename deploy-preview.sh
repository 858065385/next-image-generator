#!/bin/bash

echo "🚀 部署测试分支到 Vercel..."

# 确保在正确的分支
if [ "$(git branch --show-current)" != "deploy-test" ]; then
    echo "❌ 请切换到 deploy-test 分支"
    exit 1
fi

# 创建预览部署
echo "📦 创建预览部署..."
vercel --yes

echo "✅ 部署完成！"
echo ""
echo "📋 下一步："
echo "1. 在 Vercel 控制台为这个预览部署配置环境变量"
echo "2. 访问预览 URL 测试支付功能"
echo ""
echo "🔧 需要配置的环境变量："
echo "- POSTGRES_URL"
echo "- CREEM_API_KEY" 
echo "- CREEM_WEBHOOK_SECRET"
echo "- CREEM_PRODUCT_MONTHLY_ID"
echo "- CREEM_PRODUCT_YEARLY_ID"
echo "- WEB_BASE_URI (使用预览 URL)"
echo "- REPLICATE_API_TOKEN"
echo ""