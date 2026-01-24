#!/bin/sh
set -e

echo "🧪 测试企业微信通知服务..."

# 检查服务是否运行
if ! curl -f http://localhost:${PORT:-8089}/api/health > /dev/null 2>&1; then
    echo "❌ 服务未运行，请先启动服务"
    exit 1
fi

echo "✅ 服务运行正常"

# 测试发送文本消息
echo "📤 测试发送文本消息..."
curl -X POST http://localhost:${PORT:-8089}/api/wechat/send/text \
  -H "Content-Type: application/json" \
  -d '{
    "content": "这是一条测试消息 - '"$(date)"'",
    "touser": "@all"
  }'

echo ""
echo "✅ 测试完成！"
