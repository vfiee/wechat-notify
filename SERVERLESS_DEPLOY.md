# 阿里云 Serverless 部署指南

本指南将介绍如何将企业微信通知代理服务部署到阿里云函数计算 (FC 3.0)。

## � 部署方式

我们支持两种部署方式：

1. **手动一键部署**：适用于本地开发测试。
2. **GitHub Actions 自动部署**：适用于生产环境，代码推送即部署。

---

## 🛠 方式一：手动一键部署

我们提供了一个增强版的部署脚本 `deploy-serverless.sh`，支持多种配置。

### 1. 前置要求

- 已安装 [Serverless Devs](https://www.serverless-devs.com/): `npm install -g @serverless-devs/s`
- 准备好阿里云 AccessKey ID/Secret。

### 2. 快速部署 (默认)

```bash
# 赋予执行权限
chmod +x deploy-serverless.sh

# 执行部署
./deploy-serverless.sh
```

### 3. 高级用法

```bash
# 部署并运行健康检查
./deploy-serverless.sh --test

# 部署到指定区域
./deploy-serverless.sh --region cn-shanghai

# 跳过构建步骤 (如果已经手动运行过 pnpm build)
./deploy-serverless.sh --skip-build

# 查看所有选项
./deploy-serverless.sh --help
```

---

## 🤖 方式二：GitHub Actions 自动部署

推荐在生产环境使用此方式。

### 1. 配置 GitHub Secrets

在您的 GitHub 仓库中，进入 `Settings > Secrets and variables > Actions`，添加以下 Secrets:

| Secret 名称                | 说明             | 示例         |
| :------------------------- | :--------------- | :----------- |
| `ALIYUN_ACCOUNT_ID`        | 阿里云账号 ID    | `1234567890` |
| `ALIYUN_ACCESS_KEY_ID`     | 阿里云 AK ID     | `LTAI...`    |
| `ALIYUN_ACCESS_KEY_SECRET` | 阿里云 AK Secret | `...`        |
| `WECHAT_CORP_ID`           | 企业微信 CorpID  | `ww...`      |
| `WECHAT_AGENT_ID`          | 企业微信 AgentID | `1000001`    |
| `WECHAT_SECRET`            | 企业微信 Secret  | `...`        |

### 2. 触发部署

- **自动触发**：推送到 `main` 或 `master` 分支时自动部署。
- **手动触发**：在 GitHub Actions 页面选择 `部署到阿里云函数计算` 流，点击 `Run workflow`。

---

## 📝 入参 & 环境变量配置

在 `s.yaml` 中，您可以配置环境相关的参数。

### 环境变量列表

这些变量不仅在容器内生效，也可以控制部署行为：

- `WECHAT_CORP_ID`
- `WECHAT_AGENT_ID`
- `WECHAT_SECRET`
- `API_PREFIX` (默认: `api`)
- `NODE_ENV` (默认: `production`)

---

## 🔧 运维常用命令

部署成功后，可以使用 `s` 工具进行运维：

```bash
# 查看函数信息 (获取 URL)
s info

# 查看实时日志
s logs -t

# 调用测试
s invoke -e '{"path": "/api/health", "method": "GET"}'

# 下线并删除资源
s remove
```

---

## � 故障排查

### 1. 权限不足

如果提示权限错误，请确保您的 RAM 用户拥有 `AliyunFCFullAccess` 权限。

### 2. 环境变量未生效

如果是通过 `s deploy` 部署，请确保 `.env` 文件存在或已在 `s.yaml` 中映射了环境变量。

### 3. 域名访问 404

请确认 `s.yaml` 中的 `handler` 路径是否正确，且 `dist` 目录已生成。

---

**运行时**: Node.js 20
**框架**: NestJS (Express)
**模型**: Aliyun FC 3.0
