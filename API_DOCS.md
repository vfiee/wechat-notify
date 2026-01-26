# API 文档说明

## 访问 Swagger 文档

启动服务后，可以通过以下地址访问 API 文档：

```
http://localhost:8089/api-docs
```

## 可用接口

### 1. 健康检查

#### GET /api/health

检查服务运行状态

**响应示例：**

```json
{
  "status": "ok",
  "timestamp": "2026-01-26T08:28:00.000Z"
}
```

---

### 2. 企业微信消息推送

#### POST /api/wechat/send/text

发送文本消息

**请求体：**

```json
{
  "content": "这是一条测试消息",
  "touser": "user1|user2",
  "toparty": "1|2",
  "totag": "tag1|tag2",
  "safe": 0
}
```

**响应示例：**

```json
{
  "success": true,
  "message": "文本消息发送成功",
  "data": {
    "errcode": 0,
    "errmsg": "ok"
  }
}
```

---

#### POST /api/wechat/send/markdown

发送 Markdown 消息

**请求体：**

```json
{
  "content": "# 标题\n\n这是**加粗**文本",
  "touser": "user1|user2",
  "toparty": "1|2",
  "totag": "tag1|tag2"
}
```

**响应示例：**

```json
{
  "success": true,
  "message": "Markdown 消息发送成功",
  "data": {
    "errcode": 0,
    "errmsg": "ok"
  }
}
```

---

#### POST /api/wechat/send/news

发送图文消息

**请求体：**

```json
{
  "articles": [
    {
      "title": "通知标题",
      "description": "通知描述内容",
      "url": "https://example.com",
      "picurl": "https://example.com/image.jpg"
    }
  ],
  "touser": "user1|user2",
  "toparty": "1|2",
  "totag": "tag1|tag2"
}
```

**响应示例：**

```json
{
  "success": true,
  "message": "图文消息发送成功",
  "data": {
    "errcode": 0,
    "errmsg": "ok"
  }
}
```

---

#### POST /api/wechat/send/card

发送卡片消息（推荐使用）

**请求体：**

```json
{
  "title": "系统通知",
  "content": "这是一条重要通知",
  "level": "一般",
  "image": "https://example.com/image.jpg",
  "url": "https://example.com",
  "touser": "user1|user2",
  "toparty": "1|2",
  "totag": "tag1|tag2"
}
```

**参数说明：**

- `title`: 卡片标题（必填）
- `content`: 卡片内容（必填）
- `level`: 紧急程度，可选值：`一般`、`紧急`、`非常紧急` 或 `normal`、`urgent`、`critical`（可选）
- `image`: 图片URL（可选）
- `url`: 点击卡片后跳转的URL（可选）
- `touser`: 成员ID列表，多个用 `|` 分隔（可选）
- `toparty`: 部门ID列表，多个用 `|` 分隔（可选）
- `totag`: 标签ID列表，多个用 `|` 分隔（可选）

**响应示例：**

```json
{
  "success": true,
  "message": "卡片消息发送成功",
  "data": {
    "errcode": 0,
    "errmsg": "ok"
  }
}
```

---

#### POST /api/wechat/send/uptime-kuma

接收 Uptime Kuma 监控通知

**请求体：**

```json
{
  "monitor": {
    "name": "网站监控",
    "url": "https://example.com"
  },
  "msg": "服务异常，请及时处理"
}
```

**响应示例：**

```json
{
  "success": true,
  "message": "卡片消息发送成功",
  "data": {
    "errcode": 0,
    "errmsg": "ok"
  }
}
```

---

## 使用 Swagger UI 测试接口

1. 访问 `http://localhost:8089/api-docs`
2. 点击要测试的接口
3. 点击 "Try it out" 按钮
4. 填写请求参数
5. 点击 "Execute" 执行请求
6. 查看响应结果

## 注意事项

1. 所有接口都需要在 `.env` 文件中配置企业微信相关参数：
   - `WECHAT_CORP_ID`: 企业ID
   - `WECHAT_AGENT_ID`: 应用ID
   - `WECHAT_SECRET`: 应用密钥

2. 如果不指定接收者（`touser`、`toparty`、`totag`），消息将发送给应用的所有成员

3. 紧急程度会影响卡片消息的显示样式：
   - `一般` / `normal`: 绿色
   - `紧急` / `urgent`: 橙色
   - `非常紧急` / `critical`: 红色

## 环境变量配置示例

```env
# 企业微信配置
WECHAT_CORP_ID=your_corp_id
WECHAT_AGENT_ID=your_agent_id
WECHAT_SECRET=your_secret

# 服务配置
PORT=8089
API_PREFIX=api
```
