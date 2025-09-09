#!/bin/bash

# Vercel 环境变量批量管理脚本
# 使用方法:
#   ./vercel-env.sh pull <environment>   # 拉取环境变量
#   ./vercel-env.sh push <environment>   # 推送环境变量
#   ./vercel-env.sh delete <environment> # 删除所有环境变量

set -e

ENVIRONMENT=$1
ACTION=$2
ENV_FILE=".env.${ENVIRONMENT}"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查参数
if [ -z "$ENVIRONMENT" ]; then
    echo -e "${RED}错误: 请指定环境名称${NC}"
    echo "使用方法: $0 {preview|production} [pull|push|delete]"
    exit 1
fi

# 检查 vercel CLI
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}错误: 请先安装 vercel CLI: npm i -g vercel${NC}"
    exit 1
fi

# 拉取环境变量
pull_env() {
    echo -e "${YELLOW}正在拉取 ${ENVIRONMENT} 环境的变量...${NC}"
    
    # 创建备份
    if [ -f "$ENV_FILE" ]; then
        cp "$ENV_FILE" "${ENV_FILE}.backup.$(date +%s)"
        echo -e "${GREEN}已备份原有文件到 ${ENV_FILE}.backup{timestamp}${NC}"
    fi
    
    # 拉取环境变量
    vercel env pull "$ENV_FILE" --environment="$ENVIRONMENT"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 环境变量已拉取到 $ENV_FILE${NC}"
    else
        echo -e "${RED}❌ 拉取失败${NC}"
        exit 1
    fi
}

# 删除所有环境变量
delete_all_env() {
    echo -e "${YELLOW}警告: 即将删除 ${ENVIRONMENT} 环境的所有变量!${NC}"
    read -p "确认继续? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "操作已取消"
        exit 0
    fi
    
    # 使用 clean-env.sh 脚本删除（除了 VERCEL_ 开头的系统变量）
    ./clean-env.sh "$ENVIRONMENT"
    
    echo -e "${GREEN}✅ 所有环境变量已删除（系统变量除外）${NC}"
}

# 推送环境变量
push_env() {
    if [ ! -f "$ENV_FILE" ]; then
        echo -e "${RED}错误: 找不到文件 $ENV_FILE${NC}"
        echo "请先运行: $0 $ENVIRONMENT pull"
        exit 1
    fi
    
    echo -e "${YELLOW}正在推送 ${ENVIRONMENT} 环境的变量...${NC}"
    
    # 先删除所有现有变量
    delete_all_env
    
    # 读取文件并添加新变量
    while IFS= read -r line; do
        # 跳过注释和空行
        if [[ $line =~ ^[[:space:]]*# ]] || [[ $line =~ ^[[:space:]]*$ ]]; then
            continue
        fi
        
        # 解析键值对
        if [[ $line =~ ^([A-Z_]+)=(.*)$ ]]; then
            key="${BASH_REMATCH[1]}"
            value="${BASH_REMATCH[2]}"
            
            # 移除引号
            value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
            
            echo "添加变量: $key"
            echo "$value" | vercel env add "$key" --environment="$ENVIRONMENT"
        fi
    done < "$ENV_FILE"
    
    echo -e "${GREEN}✅ 环境变量推送完成${NC}"
}

# 主逻辑
case "$ACTION" in
    "pull")
        pull_env
        ;;
    "push")
        push_env
        ;;
    "delete")
        delete_all_env
        ;;
    *)
        echo -e "${YELLOW}Vercel 环境变量管理脚本${NC}"
        echo ""
        echo "使用方法:"
        echo "  $0 <environment> pull    # 拉取环境变量到 .env.{environment}"
        echo "  $0 <environment> push    # 从 .env.{environment} 推送变量"
        echo "  $0 <environment> delete  # 删除所有环境变量"
        echo ""
        echo "示例:"
        echo "  $0 preview pull"
        echo "  $0 preview push"
        echo "  $0 production delete"
        ;;
esac