#!/bin/bash

# 环境变量批量重命名脚本
# 使用方法: ./rename-env.sh <env-file> <from-prefix> <to-prefix>

set -e

ENV_FILE=$1
FROM_PREFIX=$2
TO_PREFIX=$3

if [ $# -ne 3 ]; then
    echo "使用方法: $0 <env-file> <from-prefix> <to-prefix>"
    echo "示例: $0 .env.preview OLD_ NEW_"
    exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
    echo "错误: 文件 $ENV_FILE 不存在"
    exit 1
fi

echo "正在处理文件: $ENV_FILE"
echo "将前缀 '$FROM_PREFIX' 替换为 '$TO_PREFIX'"
echo ""

# 创建备份
cp "$ENV_FILE" "${ENV_FILE}.rename-backup.$(date +%s)"
echo "✅ 已创建备份文件"

# 临时文件
TEMP_FILE=$(mktemp)

# 处理每一行
while IFS= read -r line; do
    # 跳过注释
    if [[ $line =~ ^[[:space:]]*# ]]; then
        echo "$line" >> "$TEMP_FILE"
        continue
    fi
    
    # 检查是否包含变量定义
    if [[ $line =~ ^([A-Z_]+)= ]]; then
        var_name="${BASH_REMATCH[1]}"
        
        # 检查是否有前缀
        if [[ $var_name == ${FROM_PREFIX}* ]]; then
            new_name=${var_name/$FROM_PREFIX/$TO_PREFIX}
            new_line=${line/$var_name/$new_name}
            echo "重命名: $var_name -> $new_name"
            echo "$new_line" >> "$TEMP_FILE"
        else
            echo "$line" >> "$TEMP_FILE"
        fi
    else
        echo "$line" >> "$TEMP_FILE"
    fi
done < "$ENV_FILE"

# 替换原文件
mv "$TEMP_FILE" "$ENV_FILE"

echo ""
echo "✅ 重命名完成！"