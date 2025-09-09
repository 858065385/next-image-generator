# Google OAuth 配置检查清单

## 问题现象
用户在预览环境（test.petalflow.ai）上没有看到 Google 账户选择页面，直接登录了某个账户。

## 解决方案

### 1. 代码配置（已完成）
已添加 `prompt: "select_account"` 参数，强制显示账户选择页面。

### 2. Google Cloud Console 检查

在 [Google Cloud Console](https://console.cloud.google.com/apis/credentials) 中检查：

1. **OAuth 2.0 客户端 ID**
   - 确认使用的是：`982561062647-kt3au8bdktrn7eukudmlrqva8a9emalv.apps.googleusercontent.com`

2. **授权的重定向 URI**
   必须包含：
   - `https://test.petalflow.ai/api/auth/callback/google`
   - `https://petalflow.ai/api/auth/callback/google`

3. **已授权的 JavaScript 来源**
   必须包含：
   - `https://test.petalflow.ai`
   - `https://petalflow.ai`

### 3. 测试步骤

1. **清除浏览器缓存**
   ```bash
   # Chrome 开发者工具 -> Application -> Storage -> Clear storage
   # 或者使用无痕模式
   ```

2. **测试不同环境**
   - 开发环境：`http://localhost:3001`
   - 预览环境：`https://test.petalflow.ai`

### 4. 常见问题

1. **如果仍然不显示选择页面**
   - 检查浏览器是否已登录多个 Google 账户
   - 尝试在无痕模式下测试
   - 确认 `prompt: "select_account"` 参数生效

2. **如果出现授权错误**
   - 检查重定向 URI 是否正确配置
   - 确认域名格式完全匹配（包括 http/https）

### 5. 验证方法

部署后访问：
```
https://test.petalflow.ai/api/auth/signin
```
点击 Google 登录，应该会显示账户选择页面。

## 注意事项

- 每次修改 Google Cloud Console 配置后，可能需要等待几分钟生效
- 确保预览环境已经正确部署并可以使用 HTTPS 访问