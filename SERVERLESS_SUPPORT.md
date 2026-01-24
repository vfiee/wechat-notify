# ☁️ 阿里云 Serverless 部署支持

## ✅ 已添加的文件

### 1. Serverless 入口文件

- **文件**: `src/serverless.ts`
- **说明**: 适配阿里云函数计算的 NestJS 入口文件
- **功能**:
  - 支持函数计算 HTTP 触发器
  - 兼容本地开发模式
  - 自动初始化 NestJS 应用

### 2. Serverless Devs 配置

- **文件**: `s.yaml`
- **说明**: 阿里云函数计算部署配置
- **配置**:
  - 函数名: `wechat-notify`
  - 运行时: Node.js 20
  - 内存: 512MB
  - 超时: 60 秒
  - HTTP 触发器: 支持 GET/POST/PUT/DELETE

### 3. 部署脚本

- **文件**: `deploy-serverless.sh`
- **说明**: 一键部署到阿里云的自动化脚本
- **功能**:
  - 检查依赖
  - 构建项目
  - 部署到阿里云
  - 显示部署结果

### 4. 部署文档

- **文件**: `SERVERLESS_DEPLOY.md`
- **说明**: 详细的 Serverless 部署指南
- **内容**:
  - 前置要求
  - 部署步骤
  - 配置说明
  - 成本优化
  - 监控和日志
  - 故障排查

## 🚀 快速开始

### 1. 安装 Serverless Devs

```bash
npm install -g @serverless-devs/s
```

### 2. 配置阿里云账号

```bash
s config add
```

### 3. 部署到阿里云

```bash
# 方式一: 使用脚本
pnpm serverless:deploy

# 方式二: 手动部署
pnpm build
s deploy
```

### 4. 测试部署

```bash
# 获取函数信息（包含 URL）
pnpm serverless:info

# 测试接口
curl https://your-function-url.fc.aliyuncs.com/api/health
```

## 📋 npm 脚本

已添加以下 Serverless 相关命令：

```json
{
  "serverless:deploy": "./deploy-serverless.sh", // 部署到阿里云
  "serverless:info": "s info", // 查看函数信息
  "serverless:logs": "s logs -t", // 查看实时日志
  "serverless:remove": "s remove" // 删除函数
}
```

## 🔧 配置说明

### 环境变量

在 `s.yaml` 中配置：

```yaml
environmentVariables:
  NODE_ENV: production
  API_PREFIX: api
  WECHAT_CORP_ID: ${env(WECHAT_CORP_ID)}
  WECHAT_AGENT_ID: ${env(WECHAT_AGENT_ID)}
  WECHAT_SECRET: ${env(WECHAT_SECRET)}
```

环境变量从本地 `.env` 文件读取。

### 函数配置

```yaml
functionName: wechat-notify # 函数名称
runtime: nodejs20 # Node.js 20 运行时
handler: dist/serverless.handler # 处理函数
memorySize: 512 # 内存 512MB
timeout: 60 # 超时 60 秒
instanceConcurrency: 10 # 单实例并发 10
```

## 💰 成本估算

### 按量付费

- **调用次数**: 前 100 万次/月免费
- **执行时长**: ¥0.00003167/GB-秒
- **流量费用**: ¥0.8/GB

### 示例计算

假设每天 1000 次调用，每次执行 1 秒：

```
月调用次数: 1000 × 30 = 30,000 次（免费额度内）
月执行时长: 30,000 × 1 秒 × 0.5GB = 15,000 GB-秒
月执行费用: 15,000 × 0.00003167 = ¥0.48
月流量费用: 约 ¥0.1
总计: 约 ¥0.6/月
```

## 📊 部署方式对比

| 特性         | Serverless         | Docker/ECS     |
| ------------ | ------------------ | -------------- |
| **成本**     | 按量付费，低频便宜 | 固定成本       |
| **运维**     | 无需运维           | 需要运维       |
| **弹性**     | 自动扩缩容         | 手动扩容       |
| **冷启动**   | 1-3 秒             | 无             |
| **适用场景** | 低频、突发流量     | 高频、稳定流量 |

## 🎯 使用建议

### ✅ 适合 Serverless

- 调用频率: < 1000 次/天
- 流量模式: 突发、不规律
- 运维要求: 无运维团队
- 成本敏感: 希望按需付费

### ❌ 不适合 Serverless

- 调用频率: > 10000 次/天
- 流量模式: 稳定、持续
- 性能要求: 对冷启动敏感
- 特殊需求: 需要长连接、WebSocket

## 🔍 监控和日志

### 查看日志

```bash
# 实时日志
pnpm serverless:logs

# 或使用 s 命令
s logs -t
```

### 控制台监控

访问 [阿里云函数计算控制台](https://fc.console.aliyun.com/)：

- 查看调用统计
- 监控性能指标
- 查看错误日志
- 设置告警规则

## 🔐 安全建议

1. **使用 RAM 角色**
   - 最小权限原则
   - 定期轮换密钥

2. **配置 IP 白名单**
   - 限制访问来源
   - 防止恶意调用

3. **启用 HTTPS**
   - 使用自定义域名
   - 配置 SSL 证书

4. **环境变量加密**
   - 敏感信息使用密钥管理服务
   - 不要在代码中硬编码

## 📚 相关文档

- [SERVERLESS_DEPLOY.md](./SERVERLESS_DEPLOY.md) - 详细部署指南
- [README.md](./README.md) - 项目说明
- [EXAMPLES.md](./EXAMPLES.md) - API 使用示例

## 🆚 部署方式选择

### 本地开发

```bash
pnpm start:dev
```

### Docker 部署

```bash
docker-compose up -d
```

### Serverless 部署

```bash
pnpm serverless:deploy
```

## ✨ 总结

项目现在支持三种部署方式：

1. **本地开发** - 快速开发和调试
2. **Docker 部署** - 生产环境，稳定流量
3. **Serverless 部署** - 低成本，弹性扩展

根据你的实际需求选择合适的部署方式！

---

**支持的云平台**: 阿里云函数计算（FC 3.0）
**框架**: NestJS + Express
**工具**: Serverless Devs
**状态**: ✅ 已完成配置，可直接部署
