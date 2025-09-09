#!/bin/bash

# 批量修复 error.message 类型错误
echo "🔧 修复 error.message 类型错误..."

# 查找所有需要修复的文件
files=$(grep -l "error\.message" src/app/api/*.ts src/app/api/*/*.ts 2>/dev/null | grep -v node_modules)

for file in $files; do
    echo "修复文件: $file"
    # 使用 sed 替换 error.message 为安全的类型检查
    sed -i '' 's/error: error\.message/error: error instanceof Error ? error.message : String(error)/g' "$file"
    sed -i '' 's/, error\.message/, error instanceof Error ? error.message : String(error)/g' "$file"
done

echo "✅ 修复完成"

# 提交更改
git add -A
git commit -m "批量修复 error.message TypeScript 类型错误

- 使用类型安全的错误处理方式
- 避免 'unknown' 类型错误

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"