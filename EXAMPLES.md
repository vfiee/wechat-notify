# API 使用示例

## 1. 健康检查

```bash
curl http://localhost:8089/api/health
```

**响应:**

```json
{
  "status": "ok",
  "timestamp": "2026-01-22T12:00:00.000Z",
  "service": "企业微信通知代理服务"
}
```

## 2. 发送文本消息

### 发送给所有人

```bash
curl -X POST http://localhost:8089/api/wechat/send/text \
  -H "Content-Type: application/json" \
  -d '{
    "content": "这是一条测试消息"
  }'
```

### 发送给指定用户

```bash
curl -X POST http://localhost:8089/api/wechat/send/text \
  -H "Content-Type: application/json" \
  -d '{
    "content": "你好，这是一条私信",
    "touser": "user1|user2"
  }'
```

### 发送给指定部门

```bash
curl -X POST http://localhost:8089/api/wechat/send/text \
  -H "Content-Type: application/json" \
  -d '{
    "content": "部门通知消息",
    "toparty": "1|2"
  }'
```

## 3. 发送 Markdown 消息

```bash
curl -X POST http://localhost:8089/api/wechat/send/markdown \
  -H "Content-Type: application/json" \
  -d '{
    "content": "## 系统通知\n\n**重要提醒:**\n- 服务器将于今晚 22:00 进行维护\n- 预计维护时间: 2 小时\n- 请提前保存工作\n\n> 如有问题，请联系运维团队",
    "touser": "@all"
  }'
```

## 4. 发送图文消息

```bash
curl -X POST http://localhost:8089/api/wechat/send/news \
  -H "Content-Type: application/json" \
  -d '{
    "articles": [
      {
        "title": "新功能上线通知",
        "description": "我们很高兴地宣布新功能已经上线",
        "url": "https://example.com/news/1",
        "picurl": "https://example.com/images/news1.jpg"
      },
      {
        "title": "系统升级公告",
        "description": "系统将进行重大升级",
        "url": "https://example.com/news/2",
        "picurl": "https://example.com/images/news2.jpg"
      }
    ],
    "touser": "@all"
  }'
```

## 5. 发送卡片消息

```bash
curl -X POST http://localhost:8089/api/wechat/send/card \
  -H "Content-Type: application/json" \
  -d '{
    "title": "任务完成通知",
    "content": "晚间数据备份任务已成功完成，耗时 12分钟。",
    "level": "一般",
    "touser": "@all"
  }'
```

## 6. 使用 JavaScript/Node.js

```javascript
const axios = require('axios');

const baseURL = 'http://localhost:8089/api';

// 发送文本消息
async function sendTextMessage(content, touser = '@all') {
  try {
    const response = await axios.post(`${baseURL}/wechat/send/text`, {
      content,
      touser,
    });
    console.log('消息发送成功:', response.data);
  } catch (error) {
    console.error('消息发送失败:', error.response?.data || error.message);
  }
}

// 发送 Markdown 消息
async function sendMarkdownMessage(content, touser = '@all') {
  try {
    const response = await axios.post(`${baseURL}/wechat/send/markdown`, {
      content,
      touser,
    });
    console.log('Markdown 消息发送成功:', response.data);
  } catch (error) {
    console.error('消息发送失败:', error.response?.data || error.message);
  }
}

// 使用示例
sendTextMessage('Hello, World!');
sendMarkdownMessage('## 标题\n**加粗文本**');
```

## 7. 使用 Python

```python
import requests
import json

base_url = 'http://localhost:8089/api'

def send_text_message(content, touser='@all'):
    url = f'{base_url}/wechat/send/text'
    data = {
        'content': content,
        'touser': touser
    }

    try:
        response = requests.post(url, json=data)
        response.raise_for_status()
        print('消息发送成功:', response.json())
    except requests.exceptions.RequestException as e:
        print('消息发送失败:', e)

# 使用示例
send_text_message('Hello from Python!')
```

## 8. 错误处理

所有接口在发生错误时会返回以下格式:

```json
{
  "statusCode": 500,
  "message": "错误描述",
  "error": "Internal Server Error"
}
```

常见错误:

- `400 Bad Request`: 请求参数错误
- `500 Internal Server Error`: 服务器内部错误（如企业微信 API 调用失败）

## 9. 参数说明

### 接收者参数

- `touser`: 成员ID列表，多个接收者用 `|` 分隔，最多支持1000个。特殊值 `@all` 表示全部成员
- `toparty`: 部门ID列表，多个接收者用 `|` 分隔，最多支持100个
- `totag`: 标签ID列表，多个接收者用 `|` 分隔，最多支持100个

**注意:** 至少需要指定一个接收者参数，如果都不指定则默认发送给 `@all`

### 消息类型

1. **文本消息**: 最多2048个字节
2. **Markdown消息**: 支持部分 Markdown 语法
3. **图文消息**: 最多8条图文
4. **卡片消息**: 简化版图文消息，支持标题、内容、等级和图片
