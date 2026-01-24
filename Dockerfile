# 多阶段构建 - 构建阶段
FROM m.daocloud.io/docker.io/library/node:20-alpine AS builder

# 安装 pnpm
RUN npm install -g pnpm

WORKDIR /app

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./

# 安装依赖（仅生产依赖）
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建应用
RUN pnpm build

# 清理开发依赖，只保留生产依赖
RUN pnpm prune --prod

# 深度清理 node_modules (删除类型定义、source maps、文档、测试文件等)
RUN find node_modules -name "*.d.ts" -exec rm -f {} + && \
    find node_modules -name "*.map" -exec rm -f {} + && \
    find node_modules -name "*.md" -exec rm -f {} + && \
    find node_modules -type d -name "test" -exec rm -rf {} + && \
    find node_modules -type d -name "__tests__" -exec rm -rf {} + && \
    rm -rf node_modules/.bin

# 生产阶段 - 最小化镜像
FROM m.daocloud.io/docker.io/library/node:20-alpine AS production

# 安装基础工具 (仅保留运行时必要组件)
# apk add --no-cache tzdata ca-certificates (node:20-alpine 包含基本 CA，tzdata 可能需要)
RUN apk add --no-cache tzdata

# 设置工作目录
WORKDIR /app

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# 从构建阶段复制必要文件
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/assets ./assets
# package.json 通常不需要，除非应用中有显式读取

# 切换到非 root 用户
USER nestjs

# 暴露端口
EXPOSE 8089

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8089/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 启动应用
CMD ["node", "dist/main"]
