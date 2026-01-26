# 企业微信通知代理服务

基于 NestJS 构建的企业微信消息推送代理服务，提供简洁的 REST API 接口用于发送企业微信消息。

## ✨ 特性

- 🚀 基于 NestJS 框架，高效、可扩展
- 📦 支持多种消息类型（文本、Markdown、图文）
- 📚 集成 Swagger API 文档，交互式接口测试
- 🔐 自动管理 Access Token，避免频繁请求
- 🐳 Docker 容器化部署，镜像最小化优化
- ☁️ 支持阿里云 Serverless 部署（函数计算）
- 🔄 GitHub Actions 自动化 CI/CD
- 🌍 环境变量配置，灵活部署
- ✅ 完整的参数验证和错误处理
- 📊 健康检查接口

## 📋 前置要求

- Node.js >= 20
- pnpm >= 8
- Docker & Docker Compose（用于容器化部署）

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd notify
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置环境变量

复制 `.env.example` 为 `.env` 并填写配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 企业微信配置
WECHAT_CORP_ID=your_corp_id
WECHAT_AGENT_ID=your_agent_id
WECHAT_SECRET=your_secret

# 服务配置
PORT=8089
NODE_ENV=production
API_PREFIX=api
```

### 4. 本地开发

```bash
# 开发模式（热重载）
pnpm start:dev

# 生产模式
pnpm build
pnpm start:prod
```

## 🐳 Docker 部署

### 使用 Docker Compose（推荐）

```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 使用 Docker

```bash
# 构建镜像
docker build -t wechat-notify .

# 运行容器
docker run -d \
  --name wechat-notify \
  -p 8089:8089 \
  -e WECHAT_CORP_ID=your_corp_id \
  -e WECHAT_AGENT_ID=your_agent_id \
  -e WECHAT_SECRET=your_secret \
  wechat-notify
```

### 使用 GHCR 镜像

```bash
# 拉取镜像
docker pull ghcr.io/<your-username>/notify:latest

# 运行容器
docker run -d \
  --name wechat-notify \
  -p 8089:8089 \
  --env-file .env \
  ghcr.io/<your-username>/notify:latest
```

## ☁️ Serverless 部署（阿里云函数计算）

### 前置要求

```bash
# 安装 Serverless Devs
npm install -g @serverless-devs/s

# 配置阿里云账号
s config add
```

### 部署步骤

```bash
# 1. 构建项目
pnpm build

# 2. 部署到阿里云
pnpm serverless:deploy

# 或使用脚本
./deploy-serverless.sh
```

### 查看函数信息

```bash
# 查看函数信息（包含 URL）
pnpm serverless:info

# 查看实时日志
pnpm serverless:logs

# 删除函数
pnpm serverless:remove
```

### 成本估算

- **调用次数**: 前 100 万次/月免费
- **执行时长**: ¥0.00003167/GB-秒
- **示例**: 1000 次/天 ≈ ¥0.6/月

**详细说明**: 查看 [SERVERLESS_DEPLOY.md](./SERVERLESS_DEPLOY.md)

## 📚 API 文档

### Swagger 交互式文档

启动服务后，访问以下地址查看完整的 API 文档：

```
http://localhost:8089/api-docs
```

Swagger UI 提供：

- 📖 完整的接口说明和参数定义
- 🧪 在线测试接口功能
- 📝 请求和响应示例
- 🔍 数据模型（Schemas）查看

**详细文档**: 查看 [API_DOCS.md](./API_DOCS.md)

## 📡 API 接口

### 健康检查

```bash
GET /api/health
```

**响应示例：**

```json
{
  "status": "ok",
  "timestamp": "2026-01-22T12:00:00.000Z",
  "service": "企业微信通知代理服务"
}
```

### 发送文本消息

```bash
POST /api/wechat/send/text
Content-Type: application/json

{
  "content": "这是一条测试消息",
  "touser": "@all"
}
```

**参数说明：**

- `content` (必填): 消息内容
- `touser` (可选): 成员ID，多个用 `|` 分隔，默认 `@all`
- `toparty` (可选): 部门ID，多个用 `|` 分隔
- `totag` (可选): 标签ID，多个用 `|` 分隔
- `safe` (可选): 是否保密消息，0否/1是

### 发送 Markdown 消息

```bash
POST /api/wechat/send/markdown
Content-Type: application/json

{
  "content": "## 标题\n**加粗文本**\n- 列表项",
  "touser": "@all"
}
```

### 发送图文消息

```bash
POST /api/wechat/send/news
Content-Type: application/json

{
  "articles": [
    {
      "title": "标题",
      "description": "描述",
      "url": "https://example.com",
      "picurl": "https://example.com/pic.jpg"
    }
  ],
  "touser": "@all"
}
```

## 🔧 环境变量说明

| 变量名            | 说明                | 默认值     | 必填 |
| ----------------- | ------------------- | ---------- | ---- |
| `WECHAT_CORP_ID`  | 企业微信企业ID      | -          | ✅   |
| `WECHAT_AGENT_ID` | 企业微信应用AgentId | -          | ✅   |
| `WECHAT_SECRET`   | 企业微信应用Secret  | -          | ✅   |
| `PORT`            | 服务端口            | 8089       | ❌   |
| `NODE_ENV`        | 运行环境            | production | ❌   |
| `API_PREFIX`      | API 路径前缀        | api        | ❌   |

## 🔄 GitHub Actions 自动化部署

项目已配置 GitHub Actions，当代码推送到 `main` 或 `master` 分支时，会自动：

1. 构建 Docker 镜像
2. 推送到 GitHub Container Registry (GHCR)
3. 支持多平台构建（amd64/arm64）
4. 使用构建缓存加速

**使用步骤：**

1. 确保仓库设置中启用了 GitHub Packages
2. 推送代码到主分支即可触发自动构建
3. 镜像地址：`ghcr.io/<your-username>/notify:latest`

## 📁 项目结构

```
notify/
├── src/
│   ├── wechat/              # 企业微信模块
│   │   ├── dto/             # 数据传输对象
│   │   ├── interfaces/      # 接口定义
│   │   ├── wechat.controller.ts
│   │   ├── wechat.service.ts
│   │   └── wechat.module.ts
│   ├── app.controller.ts
│   ├── app.service.ts
│   ├── app.module.ts
│   └── main.ts
├── .github/
│   └── workflows/
│       └── docker-publish.yml
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── package.json
```

## 🛠️ 技术栈

- **框架**: NestJS 11
- **运行时**: Node.js 20
- **包管理**: pnpm
- **验证**: class-validator, class-transformer
- **HTTP 客户端**: axios
- **容器化**: Docker, Docker Compose
- **CI/CD**: GitHub Actions

## 📝 开发指南

### 添加新的消息类型

1. 在 `src/wechat/dto/send-message.dto.ts` 添加新的 DTO
2. 在 `src/wechat/wechat.service.ts` 添加发送方法
3. 在 `src/wechat/wechat.controller.ts` 添加路由端点

### 代码规范

```bash
# 格式化代码
pnpm format

# 代码检查
pnpm lint

# 运行测试
pnpm test
```

## 🔒 安全建议

- ✅ 使用环境变量存储敏感信息
- ✅ Docker 镜像使用非 root 用户运行
- ✅ 启用 CORS 保护
- ✅ 参数验证防止注入攻击
- ✅ 日志不输出敏感信息

## 📄 许可证

UNLICENSED

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 联系方式

如有问题，请提交 Issue。
