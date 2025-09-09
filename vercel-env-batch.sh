#!/bin/bash
# Vercel 环境变量批量管理工具
# 使用方法: ./vercel-env-batch.sh <environment>

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查参数
ENVIRONMENT=${1:-preview}
TEMP_DIR="/tmp/vercel-env-$$"
ENV_FILE="$TEMP_DIR/.env.${ENVIRONMENT}"
BACKUP_FILE="$ENV_FILE.backup.$(date +%s)"

# 创建临时目录
mkdir -p "$TEMP_DIR"

# 清理函数
cleanup() {
    rm -rf "$TEMP_DIR"
}
trap cleanup EXIT

# 检查依赖
check_dependencies() {
    if ! command -v vercel &> /dev/null; then
        echo -e "${RED}错误: 请先安装 vercel CLI${NC}"
        echo "npm install -g vercel"
        exit 1
    fi
    
    if ! command -v jq &> /dev/null; then
        echo -e "${RED}错误: 请先安装 jq${NC}"
        echo "macOS: brew install jq"
        echo "Ubuntu: apt-get install jq"
        exit 1
    fi
}

# 显示当前环境变量
show_current_vars() {
    echo -e "${BLUE}=== 当前 $ENVIRONMENT 环境变量 ===${NC}"
    vercel env ls "$ENVIRONMENT" 2>/dev/null | grep -E '^\s+\w+' | awk '{print $1}' | while read -r key; do
        if [ -n "$key" ]; then
            value=$(vercel env ls "$ENVIRONMENT" 2>/dev/null | grep -A 1 "$key" | tail -1 | sed 's/^\s*//')
            echo "$key: $value"
        fi
    done || echo "无环境变量"
    echo ""
}

# 拉取环境变量
pull_env_vars() {
    echo -e "${YELLOW}正在拉取 $ENVIRONMENT 环境变量...${NC}"
    vercel env pull "$ENV_FILE" --environment="$ENVIRONMENT" 2>/dev/null || true
    
    if [ -f "$ENV_FILE" ]; then
        cp "$ENV_FILE" "$BACKUP_FILE"
        echo -e "${GREEN}✅ 已拉取并备份到 $BACKUP_FILE${NC}"
    else
        echo -e "${YELLOW}⚠️  没有找到环境变量，将创建新文件${NC}"
        touch "$ENV_FILE"
    fi
    echo ""
}

# 编辑环境变量
edit_env_vars() {
    echo -e "${BLUE}=== 编辑环境变量 ===${NC}"
    echo "提示:"
    echo "- 每行格式: KEY=value"
    echo "- 支持 # 注释"
    echo "- 删除行 = 删除变量"
    echo "- 空行会被忽略"
    echo ""
    
    # 使用默认编辑器
    ${EDITOR:-vim} "$ENV_FILE"
    
    echo ""
    echo -e "${GREEN}✅ 编辑完成${NC}"
    echo ""
}

# 预览变更
preview_changes() {
    echo -e "${BLUE}=== 变更预览 ===${NC}"
    
    # 获取当前变量
    current_vars=$(vercel env ls "$ENVIRONMENT" 2>/dev/null | grep -E '^\s+\w+' | awk '{print $1}' | sort)
    
    # 解析编辑后的文件
    echo "将要设置的变量:"
    echo "-------------------"
    while IFS= read -r line; do
        if [[ $line =~ ^([A-Z_]+)=(.*)$ ]] && [[ ! $line =~ ^[[:space:]]*# ]]; then
            key="${BASH_REMATCH[1]}"
            value="${BASH_REMATCH[2]}"
            # 移除引号
            value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
            echo "$key: $value"
        fi
    done < "$ENV_FILE"
    
    echo ""
    
    # 显示将要删除的变量
    echo "将要删除的变量:"
    echo "-------------------"
    if [ -n "$current_vars" ]; then
        echo "$current_vars" | while read -r key; do
            if ! grep -q "^$key=" "$ENV_FILE" 2>/dev/null; then
                echo "$key: (删除)"
            fi
        done
    fi
    echo ""
}

# 应用变更
apply_changes() {
    echo -e "${YELLOW}正在应用变更...${NC}"
    
    # 获取当前变量
    current_vars=$(vercel env ls "$ENVIRONMENT" 2>/dev/null | grep -E '^\s+\w+' | awk '{print $1}' || true)
    
    # 删除不再需要的变量
    if [ -n "$current_vars" ]; then
        echo "$current_vars" | while read -r key; do
            if ! grep -q "^$key=" "$ENV_FILE" 2>/dev/null; then
                echo -e "${RED}删除变量: $key${NC}"
                vercel env rm "$key" "$ENVIRONMENT" --yes 2>/dev/null || true
            fi
        done
    fi
    
    # 添加或更新变量
    while IFS= read -r line; do
        if [[ $line =~ ^([A-Z_]+)=(.*)$ ]] && [[ ! $line =~ ^[[:space:]]*# ]]; then
            key="${BASH_REMATCH[1]}"
            value="${BASH_REMATCH[2]}"
            
            # 跳过系统变量
            if [[ $key == VERCEL_* ]]; then
                echo -e "${YELLOW}跳过系统变量: $key${NC}"
                continue
            fi
            
            # 移除引号
            value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
            
            echo -e "${GREEN}更新变量: $key${NC}"
            printf '%s\n%s\n' "$key" "$value" | vercel env add "$key" "$ENVIRONMENT" --yes
        fi
    done < "$ENV_FILE"
    
    echo ""
    echo -e "${GREEN}✅ 变更已应用！${NC}"
}

# 主菜单
show_menu() {
    echo -e "${BLUE}Vercel 环境变量批量管理工具${NC}"
    echo "当前环境: ${YELLOW}$ENVIRONMENT${NC}"
    echo ""
    echo "1. 查看当前变量"
    echo "2. 拉取并编辑"
    echo "3. 预览变更"
    echo "4. 应用变更"
    echo "5. 查看备份"
    echo "6. 恢复备份"
    echo "7. 退出"
    echo ""
    read -p "请选择操作 [1-7]: " choice
}

# 查看备份
show_backups() {
    echo -e "${BLUE}=== 可用备份 ===${NC}"
    ls -la "$ENV_FILE".backup.* 2>/dev/null | tail -10 || echo "无备份文件"
    echo ""
    
    read -p "输入备份文件名恢复（或按 Enter 返回）: " backup_file
    if [ -n "$backup_file" ] && [ -f "$backup_file" ]; then
        cp "$backup_file" "$ENV_FILE"
        echo -e "${GREEN}✅ 已恢复到 $backup_file${NC}"
    fi
}

# 恢复备份
restore_backup() {
    echo -e "${BLUE}=== 恢复备份 ===${NC}"
    
    # 列出备份
    backups=($(ls "$ENV_FILE".backup.* 2>/dev/null | tail -5))
    if [ ${#backups[@]} -eq 0 ]; then
        echo "无备份文件"
        return
    fi
    
    echo "可用备份:"
    for i in "${!backups[@]}"; do
        echo "$((i+1)). ${backups[$i]##*/}"
    done
    
    read -p "选择备份 [1-${#backups[@]}]: " choice
    if [[ $choice =~ ^[0-9]+$ ]] && [ $choice -le ${#backups[@]} ]; then
        selected_backup="${backups[$((choice-1))]}"
        cp "$selected_backup" "$ENV_FILE"
        echo -e "${GREEN}✅ 已恢复 ${selected_backup##*/}${NC}"
    fi
}

# 主流程
main() {
    check_dependencies
    
    while true; do
        show_menu
        
        case $choice in
            1)
                show_current_vars
                ;;
            2)
                pull_env_vars
                edit_env_vars
                ;;
            3)
                if [ ! -f "$ENV_FILE" ]; then
                    pull_env_vars
                fi
                preview_changes
                ;;
            4)
                if [ ! -f "$ENV_FILE" ]; then
                    echo -e "${RED}请先执行 '拉取并编辑'${NC}"
                    continue
                fi
                read -p "确认应用变更? (y/N): " confirm
                if [[ $confirm =~ ^[Yy]$ ]]; then
                    apply_changes
                    show_current_vars
                fi
                ;;
            5)
                show_backups
                ;;
            6)
                restore_backup
                ;;
            7)
                echo -e "${GREEN}再见！${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}无效选择${NC}"
                ;;
        esac
        
        echo ""
        read -p "按 Enter 继续..."
    done
}

# 运行主程序
main