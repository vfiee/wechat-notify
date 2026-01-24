import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Express } from 'express';
import * as http from 'http';
import { AppModule } from './app.module';

// 创建 Express 实例
const server: Express = express();

// NestJS 应用实例
let app: INestApplication | null = null;

/**
 * 初始化 NestJS 应用
 */
export async function bootstrap(): Promise<Express> {
  if (!app) {
    app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
      logger: ['error', 'warn', 'log'],
    });

    const configService = app.get(ConfigService);

    // 全局验证管道
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    // 设置全局前缀
    const apiPrefix = configService.get<string>('API_PREFIX', 'api');
    app.setGlobalPrefix(apiPrefix);

    // 启用 CORS
    app.enableCors();

    await app.init();

    console.log('🚀 NestJS 应用已初始化（Serverless 模式）');
  }

  return server;
}

/**
 * 阿里云函数计算处理函数
 */
/**
 * 阿里云函数计算处理函数 (FC 3.0 HTTP Trigger)
 * 文档: https://help.aliyun.com/zh/fc/user-guide/overview-35
 */
// 适配器函数：适配 FC Event 模式 (arg1=Buffer, arg2=Context, arg3=Callback)
export async function handler(
  event: any,
  context: any,
  callback: any,
): Promise<any> {
  const expressApp = await bootstrap();

  // 1. 标准化 Request 对象
  let startReq: any;

  if (Buffer.isBuffer(event)) {
    // Case A: Binary Raw Body (FC3 HTTP Trigger in some cases)
    startReq = {
      method: 'POST', // Default to POST for safety
      url: '/api/wechat/send/text', // Default route
      headers: { 'content-type': 'application/json' },
      query: {},
      body: {},
    };
    try {
      const bodyStr = event.toString();
      let parsed = JSON.parse(bodyStr);

      // Deep Unwrap: 如果解析出来的是 FC Event 结构（Double 封装），提取真正的 Body
      if (
        parsed &&
        typeof parsed === 'object' &&
        parsed.body &&
        (parsed.rawPath || parsed.version || parsed.headers)
      ) {
        try {
          parsed =
            typeof parsed.body === 'string'
              ? JSON.parse(parsed.body)
              : parsed.body;
        } catch (e) {}
      }

      startReq.body = parsed;
    } catch (e) {
      startReq.body = {}; // Fallback
    }
  } else if (typeof event === 'object' && (event.headers || event.body)) {
    // Case B: Structred FC Event (FC3 Event Mode / API Gateway)
    // 需要深层清理，不能直接用 event，因为 event 包含非 HTTP 属性会导致 NestJS DTO 校验失败
    const httpMethod = event.httpMethod || event.method || 'GET';
    const path = event.path || event.url || '/';

    let parsedBody = event.body;
    try {
      if (typeof event.body === 'string') {
        parsedBody = JSON.parse(event.body);
      }
    } catch (e) {}

    startReq = {
      method: httpMethod,
      url: path,
      headers: event.headers || {},
      query: event.queryParameters || event.query || {},
      body: parsedBody || {},
    };
  } else {
    // Case C: Fallback / Unknown
    startReq = event || {};
    if (!startReq.method) startReq.method = 'GET';
    if (!startReq.url) startReq.url = '/';
    if (!startReq.headers) startReq.headers = {};
    if (!startReq.query) startReq.query = {};
  }

  // 兜底路由策略
  if (startReq.method === 'POST' && startReq.url === '/') {
    startReq.url = '/api/wechat/send/text';
  }

  // 构造兼容 Express 的 Request 对象 (Mock Stream)
  const proxyReq = Object.assign(startReq, {
    _read: () => {},
    resume: () => {},
    pause: () => {},
    on: (type: string, handler: Function) => {
      if (type === 'data') {
        // 不需要发送数据，因为我们已经手动设置了 req.body
        // 且 Express body-parser 如果发现 req.body 已存在，通常会跳过
      }
      if (type === 'end') {
        // 立即触发 end，模拟流结束
        handler();
      }
      return proxyReq;
    },
    pipe: () => proxyReq,
    unpipe: () => {},
  });

  // 2. 构造 Proxy Response
  const proxyRes: any = {
    __proto__: http.ServerResponse.prototype,
    statusCode: 200,
    headers: {} as Record<string, any>,
    _headers: {} as Record<string, any>,
    locals: {},

    setHeader(key: string, value: string) {
      this.headers[key] = value;
      this._headers[key] = value;
      return this;
    },
    getHeader(key: string) {
      return this.headers[key];
    },
    removeHeader(key: string) {
      delete this.headers[key];
      delete this._headers[key];
    },
    writeHead(statusCode: number, headers?: any) {
      this.statusCode = statusCode;
      if (headers) Object.assign(this.headers, headers);
      return this;
    },
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    send(data: any) {
      this.end(data);
    },
    json(data: any) {
      this.setHeader('Content-Type', 'application/json');
      this.end(JSON.stringify(data));
    },
    // 当 Express 完成处理时调用
    end(data: any) {
      const response = {
        isBase64Encoded: false,
        statusCode: this.statusCode,
        headers: this.headers,
        body: data,
      };

      // 优先尝试标准 HTTP 响应 (如果 res 是 Response 对象)
      if (context && typeof context.send === 'function') {
        context.setStatusCode(this.statusCode);
        for (const k in this.headers) context.setHeader(k, this.headers[k]);
        context.send(data);
      }
      // 其次尝试 Callback 方式 (Event 模式)
      else if (typeof callback === 'function') {
        callback(null, response);
      }
      // 最后尝试直接返回 (Async Handler)
      else {
        return response;
      }
    },
    emit: () => {},
    on: () => {},
    once: () => {},
    removeListener: () => {},
  };

  try {
    // @ts-ignore
    expressApp(proxyReq, proxyRes);
    // 如果是 Async Handler，我们可能需要等待 proxyRes.end 被调用
    // 但这里 expressApp 是同步调度的（除了异步中间件），proxyRes.end 会在回调链中被调用
    // 对于 FC，如果 callback 存在，它会挂起等待。如果不存在，我们需要返回 Promise。
    // 为简化，我们假设 Express 会在当前 Tick 或 Microtask 中完成。

    // 配合 Async Handler 的简单 Promise 包装
    return new Promise((resolve) => {
      // 劫持 end 以 resolve promise
      const originalEnd = proxyRes.end;
      proxyRes.end = (data: any) => {
        const response = {
          isBase64Encoded: false,
          statusCode: proxyRes.statusCode,
          headers: proxyRes.headers,
          body: data,
        };

        if (context && typeof context.send === 'function') {
          // HTTP Mode
          originalEnd.call(proxyRes, data);
          resolve(undefined);
        } else if (typeof callback === 'function') {
          // Callback Mode
          callback(null, response);
          resolve(undefined);
        } else {
          // Return Mode
          resolve(response);
        }
      };
    });
  } catch (err) {
    console.error('Express dispatch error:', err);
    const errRes = {
      statusCode: 500,
      body: JSON.stringify({ error: String(err) }),
    };
    if (typeof callback === 'function') callback(null, errRes);
    return errRes;
  }
}

/**
 * 本地开发模式
 */
if (require.main === module) {
  void bootstrap().then((expressApp) => {
    const port = process.env.PORT || 8089;
    expressApp.listen(port, () => {
      console.log(`🚀 应用运行在: http://localhost:${port}/api`);
    });
  });
}
