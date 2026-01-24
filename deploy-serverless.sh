#!/bin/bash

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 显示使用说明
show_usage() {
    cat << EOF
使用方法: $0 [选项]

选项:
    -e, --env ENV       指定环境 (production|staging|development)，默认: production
    -r, --region REGION 指定阿里云区域，默认: cn-hangzhou
    -t, --test          部署后运行健康检查
    -s, --skip-build    跳过构建步骤（使用已有的 dist 目录）
    -c, --config        仅配置阿里云凭证，不部署
    -h, --help          显示此帮助信息

示例:
    $0                          # 部署到生产环境
    $0 -e staging -t            # 部署到预发环境并测试
    $0 -s                       # 跳过构建直接部署
    $0 -c                       # 仅配置阿里云凭证

环境变量:
    WECHAT_CORP_ID              企业微信企业 ID
    WECHAT_AGENT_ID             企业微信应用 AgentId
    WECHAT_SECRET               企业微信应用 Secret
    ALIYUN_ACCOUNT_ID           阿里云账号 ID
    ALIYUN_ACCESS_KEY_ID        阿里云 AccessKey ID
    ALIYUN_ACCESS_KEY_SECRET    阿里云 AccessKey Secret
EOF
}

# 默认参数
ENVIRONMENT="production"
REGION="cn-hangzhou"
RUN_TEST=false
SKIP_BUILD=false
CONFIG_ONLY=false

# 解析命令行参数
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--env)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -r|--region)
            REGION="$2"
            shift 2
            ;;
        -t|--test)
            RUN_TEST=true
            shift
            ;;
        -s|--skip-build)
            SKIP_BUILD=true
            shift
            ;;
        -c|--config)
            CONFIG_ONLY=true
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            print_error "未知选项: $1"
            show_usage
            exit 1
            ;;
    esac
done

# 设置错误时退出
set -e

print_info "🚀 开始部署到阿里云 Serverless..."
print_info "环境: $ENVIRONMENT"
print_info "区域: $REGION"

# 检查 Serverless Devs 是否安装
if ! command -v s &> /dev/null; then
    print_error "Serverless Devs 未安装"
    print_info "正在安装 Serverless Devs..."
    npm install -g @serverless-devs/s
    print_success "Serverless Devs 安装完成"
fi

# 加载环境变量
if [ -f .env ]; then
    print_info "加载 .env 文件..."
    export $(cat .env | grep -v '^#' | xargs)
fi

# 检查必要的环境变量
check_env_vars() {
    local missing_vars=()
    
    if [ -z "$WECHAT_CORP_ID" ]; then
        missing_vars+=("WECHAT_CORP_ID")
    fi
    
    if [ -z "$WECHAT_AGENT_ID" ]; then
        missing_vars+=("WECHAT_AGENT_ID")
    fi
    
    if [ -z "$WECHAT_SECRET" ]; then
        missing_vars+=("WECHAT_SECRET")
    fi
    
    if [ ${#missing_vars[@]} -gt 0 ]; then
        print_error "缺少必要的环境变量:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        echo ""
        print_info "请在 .env 文件中设置这些变量，或通过环境变量传入"
        exit 1
    fi
}

check_env_vars

# 配置阿里云凭证
 configure_aliyun() {
    print_info "配置阿里云凭证..."
    
    # 优先检查环境变量（适用于 CI/CD 和自动部署）
    if [ -n "$ALIYUN_ACCOUNT_ID" ] && [ -n "$ALIYUN_ACCESS_KEY_ID" ] && [ -n "$ALIYUN_ACCESS_KEY_SECRET" ]; then
        print_info "检测到环境变量凭证，正在配置..."
        s config add \
            --AccountID "$ALIYUN_ACCOUNT_ID" \
            --AccessKeyID "$ALIYUN_ACCESS_KEY_ID" \
            --AccessKeySecret "$ALIYUN_ACCESS_KEY_SECRET" \
            -a default -f
        print_success "阿里云凭证配置更新完成"
        return
    fi
    
    # 检查是否已配置 (通过 grep 检查输出关键信息)
    if s config get -a default 2>&1 | grep -q "AccessKeyID"; then
        print_warning "已存在默认配置，是否覆盖？(y/N)"
        read -r response
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            print_info "保持现有配置"
            return
        fi
    fi

    print_info "请手动配置阿里云凭证..."
    s config add
}

configure_aliyun

# 如果只是配置，则退出
if [ "$CONFIG_ONLY" = true ]; then
    print_success "配置完成"
    exit 0
fi

# 检查 pnpm 是否安装
if ! command -v pnpm &> /dev/null; then
    print_error "pnpm 未安装"
    print_info "正在安装 pnpm..."
    npm install -g pnpm
    print_success "pnpm 安装完成"
fi

# 安装依赖
print_info "📦 安装依赖..."
pnpm install --frozen-lockfile

# 构建项目
if [ "$SKIP_BUILD" = false ]; then
    print_info "🔨 构建项目..."
    pnpm build
    print_success "构建完成"
else
    print_warning "跳过构建步骤"
    if [ ! -d "dist" ]; then
        print_error "dist 目录不存在，无法跳过构建"
        exit 1
    fi
fi

# ----------------------------------------------------------------
# 准备发布包 (解决 pnpm 符号链接和依赖丢失问题)
# ----------------------------------------------------------------
print_info "📦 准备发布构建包..."
BUILD_DIR=".release_build"
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

# 复制编译后的代码
cp -r dist/* "$BUILD_DIR/"
# 复制 package.json 以便安装依赖
cp package.json "$BUILD_DIR/"

# 在构建目录中安装生产依赖 (使用 npm 以避免符号链接)
print_info "📦 在构建目录安装生产依赖..."
cd "$BUILD_DIR"
npm install --production --no-package-lock --silent
cd ..

# 生成临时的 s.prod.yaml
cat s.yaml | sed "s|code: ./|code: ./$BUILD_DIR|g" | sed "s|handler: dist/serverless.handler|handler: serverless.handler|g" > s.prod.yaml

print_success "发布包准备就绪: $BUILD_DIR"

# ----------------------------------------------------------------
# 部署到阿里云
# ----------------------------------------------------------------
print_info "☁️  部署到阿里云函数计算..."

# 使用生成的 s.prod.yaml 进行部署
if s deploy -t s.prod.yaml -y --use-local; then
    print_success "部署成功！"
    # 清理临时文件
    # rm s.prod.yaml  <-- 移动到最后
    # rm -rf "$BUILD_DIR" # 可选：保留用于调试
else
    EXIT_CODE=$?
    print_error "部署失败 (Exit Code: $EXIT_CODE)"
    
    # 检查是否为权限错误
    if [ $EXIT_CODE -eq 101 ]; then
        echo ""
        print_warning "检测到权限不足 (AccessDenied)。请检查您的 RAM 用户权限。"
        print_info "请登录阿里云 RAM 控制台 (https://ram.console.aliyun.com) 为用户添加以下权限之一："
        echo "  1. AliyunFCFullAccess (系统策略，推荐)"
        echo "  2. 自定义策略 (请参考项目根目录下的 RAM_POLICY.json)"
        echo ""
        print_info "如果这是新创建的 RAM 用户，可能需要几分钟权限才能生效。"
    fi
    # 清理临时文件
    rm s.prod.yaml
    exit $EXIT_CODE
fi

echo ""

# 获取函数信息
print_info "📡 获取函数信息:"
# 注意：s info 也需要指定模板，否则会读默认的 s.yaml，但那里没有部署状态
s info -t s.prod.yaml
FUNCTION_INFO=$(s info -t s.prod.yaml)
echo "$FUNCTION_INFO"

# 清理临时文件
rm s.prod.yaml

# 提取函数 URL
FUNCTION_URL=$(echo "$FUNCTION_INFO" | grep -o 'https://[^[:space:]]*' | head -1 || echo "")

if [ -n "$FUNCTION_URL" ]; then
    print_success "函数 URL: $FUNCTION_URL"
    
    # 运行健康检查
    if [ "$RUN_TEST" = true ]; then
        print_info "🧪 运行健康检查..."
        sleep 3  # 等待函数就绪
        
        HEALTH_URL="${FUNCTION_URL}/api/health"
        print_info "检查: $HEALTH_URL"
        
        if curl -f -s "$HEALTH_URL" > /dev/null; then
            print_success "健康检查通过"
            
            # 显示健康检查结果
            print_info "健康检查响应:"
            curl -s "$HEALTH_URL" | jq '.' || curl -s "$HEALTH_URL"
        else
            print_error "健康检查失败"
            exit 1
        fi
    fi
fi

echo ""
print_info "💡 常用命令:"
echo "  查看实时日志: s logs -t"
echo "  查看函数信息: s info"
echo "  删除函数:     s remove"
echo "  调用函数:     s invoke"
echo ""
print_success "🎉 部署完成！"
