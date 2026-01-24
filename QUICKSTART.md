# 快速开始指南

## 📦 前置准备

### 1. 获取企业微信配置

在开始之前，你需要从企业微信管理后台获取以下信息:

1. **企业ID (Corp ID)**
   - 登录 [企业微信管理后台](https://work.weixin.qq.com/)
   - 进入「我的企业」→「企业信息」
   - 复制「企业ID」

2. **应用 AgentId 和 Secret**
   - 进入「应用管理」→ 选择或创建一个应用
   - 复制「AgentId」
   - 查看「Secret」并复制

## 🚀 本地开发

### 1. 克隆并安装依赖

```bash
cd /Users/vyron/Mine/notify
pnpm install
```

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，填入你的企业微信配置
vim .env
```

`.env` 文件内容:

```env
WECHAT_CORP_ID=你的企业ID
WECHAT_AGENT_ID=你的应用AgentId
WECHAT_SECRET=你的应用Secret
PORT=8089
NODE_ENV=development
API_PREFIX=api
```

### 3. 启动开发服务器

```bash
pnpm start:dev
```

服务将在 `http://localhost:8089` 启动

### 4. 测试接口

```bash
# 健康检查
curl http://localhost:8089/api/health

# 发送测试消息
curl -X POST http://localhost:8089/api/wechat/send/text \
  -H "Content-Type: application/json" \
  -d '{"content": "测试消息"}'
```

## 🐳 Docker 部署

### 方式一: 使用 Docker Compose (推荐)

```bash
# 1. 确保 .env 文件已配置
cp .env.example .env
vim .env

# 2. 启动服务
docker-compose up -d

# 3. 查看日志
docker-compose logs -f

# 4. 停止服务
docker-compose down
```

### 方式二: 使用 Docker 命令

```bash
# 1. 构建镜像
docker build -t wechat-notify .

# 2. 运行容器
docker run -d \
  --name wechat-notify \
  -p 8089:8089 \
  -e WECHAT_CORP_ID=你的企业ID \
  -e WECHAT_AGENT_ID=你的应用AgentId \
  -e WECHAT_SECRET=你的应用Secret \
  wechat-notify

# 3. 查看日志
docker logs -f wechat-notify

# 4. 停止并删除容器
docker stop wechat-notify
docker rm wechat-notify
```

### 方式三: 使用 GHCR 镜像

```bash
# 1. 拉取最新镜像
docker pull ghcr.io/你的用户名/notify:latest

# 2. 运行容器
docker run -d \
  --name wechat-notify \
  -p 8089:8089 \
  --env-file .env \
  ghcr.io/你的用户名/notify:latest
```

## 🔧 使用 npm 脚本

项目提供了便捷的 npm 脚本:

```bash
# 开发
pnpm start:dev          # 开发模式（热重载）
pnpm start:debug        # 调试模式

# 构建和生产
pnpm build              # 构建项目
pnpm start:prod         # 生产模式运行

# 代码质量
pnpm format             # 格式化代码
pnpm lint               # 代码检查

# Docker 操作
pnpm docker:build       # 构建 Docker 镜像
pnpm docker:run         # 运行 Docker 容器
pnpm docker:stop        # 停止并删除容器
pnpm docker:logs        # 查看容器日志

# Docker Compose 操作
pnpm compose:up         # 启动服务
pnpm compose:down       # 停止服务
pnpm compose:logs       # 查看日志
```

## 📡 API 测试

### 使用提供的测试脚本

```bash
# 确保服务已启动
./test-api.sh
```

### 手动测试

查看 [EXAMPLES.md](./EXAMPLES.md) 获取详细的 API 使用示例。

## 🔄 GitHub Actions 自动部署

### 1. 启用 GitHub Packages

1. 进入你的 GitHub 仓库
2. Settings → Actions → General
3. 确保 "Workflow permissions" 设置为 "Read and write permissions"

### 2. 推送代码触发构建

```bash
git add .
git commit -m "feat: initial commit"
git push origin main
```

### 3. 查看构建状态

- 进入仓库的 "Actions" 标签页
- 查看 "Docker Image CI/CD" 工作流

### 4. 使用构建的镜像

构建成功后，镜像将推送到 GitHub Container Registry:

```bash
docker pull ghcr.io/你的用户名/notify:latest
```

## 🔍 故障排查

### 服务无法启动

1. 检查环境变量是否正确配置
2. 查看日志: `docker-compose logs` 或 `pnpm start:dev`
3. 确保端口 8089 未被占用

### 消息发送失败

1. 验证企业微信配置是否正确
2. 检查应用是否有发送消息的权限
3. 查看服务日志获取详细错误信息

### Docker 构建失败

1. 确保 Docker 和 Docker Compose 已安装
2. 检查 Dockerfile 和 docker-compose.yml 配置
3. 清理 Docker 缓存: `docker system prune -a`

## 📚 更多资源

- [完整文档](./README.md)
- [API 使用示例](./EXAMPLES.md)
- [企业微信 API 文档](https://developer.work.weixin.qq.com/document/path/90664)

## 💡 提示

- 开发环境建议使用 `pnpm start:dev` 以获得热重载功能
- 生产环境建议使用 Docker 部署以获得更好的稳定性
- 定期更新依赖以获取安全补丁和新功能
