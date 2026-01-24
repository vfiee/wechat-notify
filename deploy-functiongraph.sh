#!/bin/bash

# 颜色定义
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

set -e

print_info "🚀 开始准备华为云 FunctionGraph 部署包..."

# 检查 pnpm
if ! command -v pnpm &> /dev/null; then
    echo "❌ 错误: pnpm 未安装，请先安装 pnpm"
    exit 1
fi

# 1. 构建项目
print_info "📦 构建项目..."
pnpm install
pnpm build

# 2. 准备发布目录
BUILD_DIR="dist-huawei"
print_info "📂 准备发布目录: $BUILD_DIR"
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

# 3. 复制编译后的代码
print_info "📄 复制代码文件..."
cp -r dist/* "$BUILD_DIR/"
cp package.json "$BUILD_DIR/"

# 4. 安装生产依赖
print_info "📦 安装生产依赖 (这可能需要几分钟)..."
cd "$BUILD_DIR"
# 使用 npm install --production 避免符号链接问题，且只安装运行时依赖
npm install --production --no-package-lock --silent
cd ..

# 5. 打包为 ZIP
ZIP_NAME="functiongraph-deploy.zip"
print_info "🤐 正在压缩为 $ZIP_NAME ..."
rm -f "$ZIP_NAME"
# 进入目录打包，确保根目录结构正确
cd "$BUILD_DIR"
zip -q -r "../$ZIP_NAME" .
cd ..

print_success "🎉 部署包创建成功: $ZIP_NAME"
echo ""
print_info "📋 接下来请按以下步骤在华为云控制台操作："
echo "1. 登录华为云 FunctionGraph 控制台: https://console.huaweicloud.com/functiongraph/"
echo "2. 创建函数 -> 选择 '事件函数' -> 运行时选择 'Node.js 14.18' 或更高版本"
echo "3. 在代码上传方式中选择 '上传 ZIP 包'，上传当前目录下的 $ZIP_NAME"
echo "4. 执行入口填写: dist/serverless-huawei.handler"
echo "   (注意: 因为我们把 compiled code 放在 dist 目录中，所以是 dist/serverless-huawei)"
echo "5. 配置触发器: 创建一个 APIG (API 网关) 触发器，安全认证根据需求选择 (如 'None' 用于公开访问)"
echo "6. 环境变量: 请确保在函数配置中添加以下环境变量:"
echo "   - WECHAT_CORP_ID"
echo "   - WECHAT_AGENT_ID"
echo "   - WECHAT_SECRET"
echo "   - API_PREFIX (可选，默认为 api)"
echo ""
