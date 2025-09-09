# Google OAuth 配置说明

## 生产环境配置
在 Google Cloud Console 中配置：
- Authorized JavaScript origins: https://your-production-domain.com
- Authorized redirect URIs: https://your-production-domain.com/api/auth/callback/google

## 预览环境配置
由于预览部署的域名会变化，您需要：
1. 每次部署新预览时，将预览 URL 添加到 Google OAuth
2. 或者使用通配符（如果支持）：https://*.vercel.app

## 环境变量
# 生产环境
GOOGLE_CLIENT_ID=your_production_client_id
GOOGLE_CLIENT_SECRET=your_production_client_secret
NEXTAUTH_URL=https://your-production-domain.com

# 预览环境  
GOOGLE_CLIENT_ID=your_test_client_id
GOOGLE_CLIENT_SECRET=your_test_client_secret
NEXTAUTH_URL=https://next-image-generator-mkflmiaoj-karkaninis-projects-915e32ae.vercel.app