#!/bin/sh
set -e

echo "🚀 开始部署企业微信通知服务..."

# 检查环境变量
if [ -z "$WECHAT_CORP_ID" ] || [ -z "$WECHAT_AGENT_ID" ] || [ -z "$WECHAT_SECRET" ]; then
    echo "❌ 错误: 缺少必要的环境变量"
    echo "请确保设置了以下环境变量:"
    echo "  - WECHAT_CORP_ID"
    echo "  - WECHAT_AGENT_ID"
    echo "  - WECHAT_SECRET"
    exit 1
fi

# 停止并删除旧容器
echo "🛑 停止旧容器..."
docker-compose down

# 构建新镜像
echo "🔨 构建 Docker 镜像..."
docker-compose build --no-cache

# 启动服务
echo "▶️  启动服务..."
docker-compose up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 5

# 健康检查
echo "🏥 执行健康检查..."
if curl -f http://localhost:${PORT:-8089}/api/health > /dev/null 2>&1; then
    echo "✅ 服务部署成功！"
    echo "📡 服务地址: http://localhost:${PORT:-8089}/api"
else
    echo "❌ 健康检查失败，请查看日志:"
    docker-compose logs
    exit 1
fi

echo "📊 查看日志: docker-compose logs -f"
