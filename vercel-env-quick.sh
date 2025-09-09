#!/bin/bash
# Vercel 环境变量快速操作脚本
# 使用方法: ./vercel-env-quick.sh <environment> <operation>

set -e

ENVIRONMENT=$1
OPERATION=$2

# 颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

if [ -z "$ENVIRONMENT" ] || [ -z "$OPERATION" ]; then
    echo "用法: $0 <environment> <operation>"
    echo ""
    echo "环境: preview, production, development"
    echo ""
    echo "操作:"
    echo "  list                    - 列出所有变量"
    echo "  pull <filename>         - 拉取到文件"
    echo "  push <filename>         - 从文件推送"
    echo "  add <key> <value>        - 添加变量"
    echo "  rm <key>                 - 删除变量"
    echo "  rename <old> <new>       - 重命名变量"
    echo "  copy <from> <to>         - 复制变量值"
    echo "  prefix <old> <new>       - 批量修改前缀"
    echo "  export                  - 导出为 .env 格式"
    echo ""
    echo "示例:"
    echo "  $0 preview list"
    echo "  $0 preview pull .env.preview"
    echo "  $0 preview add API_KEY 'abc123'"
    echo "  $0 preview rename OLD_KEY NEW_KEY"
    echo "  $0 preview prefix CREEM_ PAYMENT_"
    exit 1
fi

# 检查依赖
if ! command -v vercel &> /dev/null || ! command -v jq &> /dev/null; then
    echo -e "${RED}错误: 请安装 vercel CLI 和 jq${NC}"
    exit 1
fi

# 列出变量
list_vars() {
    echo -e "${YELLOW}环境 $ENVIRONMENT 的变量:${NC}"
    vercel env ls "$ENVIRONMENT" --json 2>/dev/null | jq -r '.envs[] | "\(.key): \(.value)"' | sort
}

# 拉取变量
pull_vars() {
    local filename=${3:-".env.$ENVIRONMENT"}
    vercel env pull "$filename" --environment="$ENVIRONMENT"
    echo -e "${GREEN}✅ 已拉取到 $filename${NC}"
}

# 推送变量
push_vars() {
    local filename=$3
    if [ ! -f "$filename" ]; then
        echo -e "${RED}错误: 文件 $filename 不存在${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}正在从 $filename 推送变量...${NC}"
    
    while IFS= read -r line; do
        if [[ $line =~ ^([A-Z_]+)=(.*)$ ]] && [[ ! $line =~ ^[[:space:]]*# ]]; then
            key="${BASH_REMATCH[1]}"
            value="${BASH_REMATCH[2]}"
            
            # 跳过系统变量
            if [[ $key == VERCEL_* ]]; then
                continue
            fi
            
            # 移除引号
            value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
            
            echo "添加: $key"
            printf '%s\n%s\n' "$key" "$value" | vercel env add "$key" "$ENVIRONMENT" --yes
        fi
    done < "$filename"
    
    echo -e "${GREEN}✅ 推送完成${NC}"
}

# 添加变量
add_var() {
    local key=$3
    local value=$4
    
    if [ -z "$key" ] || [ -z "$value" ]; then
        echo -e "${RED}错误: 请提供 key 和 value${NC}"
        exit 1
    fi
    
    echo "添加变量: $key"
    printf '%s\n%s\n' "$key" "$value" | vercel env add "$key" "$ENVIRONMENT" --yes
    echo -e "${GREEN}✅ 已添加${NC}"
}

# 删除变量
rm_var() {
    local key=$3
    
    if [ -z "$key" ]; then
        echo -e "${RED}错误: 请提供要删除的变量名${NC}"
        exit 1
    fi
    
    echo "删除变量: $key"
    vercel env rm "$key" "$ENVIRONMENT" --yes
    echo -e "${GREEN}✅ 已删除${NC}"
}

# 重命名变量
rename_var() {
    local old_key=$3
    local new_key=$4
    
    if [ -z "$old_key" ] || [ -z "$new_key" ]; then
        echo -e "${RED}错误: 请提供旧变量名和新变量名${NC}"
        exit 1
    fi
    
    # 获取旧值
    local value=$(vercel env ls "$ENVIRONMENT" --json 2>/dev/null | jq -r ".envs[] | select(.key==\"$old_key\") | .value")
    
    if [ -z "$value" ]; then
        echo -e "${RED}错误: 变量 $old_key 不存在${NC}"
        exit 1
    fi
    
    # 添加新变量
    printf '%s\n%s\n' "$new_key" "$value" | vercel env add "$new_key" "$ENVIRONMENT" --yes
    
    # 删除旧变量
    vercel env rm "$old_key" "$ENVIRONMENT" --yes
    
    echo -e "${GREEN}✅ 已将 $old_key 重命名为 $new_key${NC}"
}

# 复制变量值
copy_var() {
    local from_key=$3
    local to_key=$4
    
    if [ -z "$from_key" ] || [ -z "$to_key" ]; then
        echo -e "${RED}错误: 请提供源变量和目标变量名${NC}"
        exit 1
    fi
    
    # 获取源值
    local value=$(vercel env ls "$ENVIRONMENT" --json 2>/dev/null | jq -r ".envs[] | select(.key==\"$from_key\") | .value")
    
    if [ -z "$value" ]; then
        echo -e "${RED}错误: 变量 $from_key 不存在${NC}"
        exit 1
    fi
    
    # 设置目标变量
    printf '%s\n%s\n' "$to_key" "$value" | vercel env add "$to_key" "$ENVIRONMENT" --yes
    
    echo -e "${GREEN}✅ 已将 $from_key 的值复制到 $to_key${NC}"
}

# 批量修改前缀
change_prefix() {
    local old_prefix=$3
    local new_prefix=$4
    
    if [ -z "$old_prefix" ] || [ -z "$new_prefix" ]; then
        echo -e "${RED}错误: 请提供旧前缀和新前缀${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}正在将前缀 $old_prefix 改为 $new_prefix...${NC}"
    
    # 获取所有匹配的变量
    vercel env ls "$ENVIRONMENT" --json 2>/dev/null | jq -r ".envs[].key" | grep "^$old_prefix" | while read -r key; do
        new_key="${key/$old_prefix/$new_prefix}"
        value=$(vercel env ls "$ENVIRONMENT" --json 2>/dev/null | jq -r ".envs[] | select(.key==\"$key\") | .value")
        
        # 添加新变量
        printf '%s\n%s\n' "$new_key" "$value" | vercel env add "$new_key" "$ENVIRONMENT" --yes
        
        # 删除旧变量
        vercel env rm "$key" "$ENVIRONMENT" --yes
        
        echo -e "${GREEN}✅ $key -> $new_key${NC}"
    done
}

# 导出为 .env 格式
export_env() {
    local filename=${3:-".env.$ENVIRONMENT.export"}
    
    echo -e "${YELLOW}导出到 $filename...${NC}"
    
    > "$filename"
    vercel env ls "$ENVIRONMENT" --json 2>/dev/null | jq -r '.envs[] | "\(.key)=\"\(.value)\"' | sort >> "$filename"
    
    echo -e "${GREEN}✅ 已导出到 $filename${NC}"
}

# 执行操作
case $OPERATION in
    list)
        list_vars
        ;;
    pull)
        pull_vars "$@"
        ;;
    push)
        push_vars "$@"
        ;;
    add)
        add_var "$@"
        ;;
    rm)
        rm_var "$@"
        ;;
    rename)
        rename_var "$@"
        ;;
    copy)
        copy_var "$@"
        ;;
    prefix)
        change_prefix "$@"
        ;;
    export)
        export_env "$@"
        ;;
    *)
        echo -e "${RED}错误: 未知操作 $OPERATION${NC}"
        exit 1
        ;;
esac