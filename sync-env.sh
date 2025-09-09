#!/usr/bin/env bash
# sync-env.sh
# 用法：./sync-env.sh <from-env> <to-env>
# 示例：./sync-env.sh production preview

set -e

FROM_ENV=$1
TO_ENV=$2
KEEP_PREFIX="^VERCEL_"           # 跳过系统变量
TEMP_FILE=".env.sync.${FROM_ENV}.$$"

if [ $# -ne 2 ]; then
    echo "用法: $0 <from-env> <to-env>"
    echo "示例: $0 production preview"
    echo "环境: development, preview, production"
    exit 1
fi

echo "=== 环境变量同步工具 ==="
echo "从: $FROM_ENV"
echo "到: $TO_ENV"
echo ""

# 检查依赖
if ! command -v vercel &> /dev/null; then
    echo "错误: 请先安装 vercel CLI: npm i -g vercel"
    exit 1
fi

if ! command -v jq &> /dev/null; then
    echo "错误: 请先安装 jq: brew install jq (mac) 或 apt-get install jq (ubuntu)"
    exit 1
fi

# 备份源环境
echo "1. 备份 $FROM_ENV 环境变量..."
vercel env pull "$TEMP_FILE" --environment="$FROM_ENV"
if [ $? -ne 0 ]; then
    echo "错误: 无法拉取 $FROM_ENV 环境变量"
    exit 1
fi

# 清理目标环境
echo ""
echo "2. 清理 $TO_ENV 环境的旧变量..."
./clean-env.sh "$TO_ENV"

# 同步变量
echo ""
echo "3. 同步变量到 $TO_ENV 环境..."
echo "跳过前缀: $KEEP_PREFIX"
echo ""

# 读取备份文件并添加到目标环境
while IFS= read -r line; do
    # 跳过注释和空行
    if [[ $line =~ ^[[:space:]]*# ]] || [[ $line =~ ^[[:space:]]*$ ]]; then
        continue
    fi
    
    # 解析键值对
    if [[ $line =~ ^([A-Z_]+)=(.*)$ ]]; then
        key="${BASH_REMATCH[1]}"
        value="${BASH_REMATCH[2]}"
        
        # 跳过系统变量
        if [[ $key =~ $KEEP_PREFIX ]]; then
            echo "跳过系统变量: $key"
            continue
        fi
        
        # 移除引号
        value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
        
        echo "添加: $key"
        # 使用 printf 避免引号问题
        printf '%s\n%s\n' "$key" "$value" | vercel env add "$key" "$TO_ENV" --yes
    fi
done < "$TEMP_FILE"

# 清理
rm -f "$TEMP_FILE"

echo ""
echo "✅ 同步完成！"
echo ""
echo "验证结果:"
vercel env ls "$TO_ENV"