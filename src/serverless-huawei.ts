import * as http from 'http';
import { bootstrap } from './serverless';

/**
 * 华为云 FunctionGraph 处理函数 (Node.js)
 * 适配 APIG 触发器事件格式
 */
export async function handler(event: any, context: any): Promise<any> {
  const expressApp = await bootstrap();

  // 1. 标准化 Request 对象
  // 华为云 APIG 事件结构文档参考: https://support.huaweicloud.com/devg-functiongraph/functiongraph_02_0666.html
  const method = event.httpMethod || 'GET';
  const path = event.path || '/';
  const headers = event.headers || {};
  const query = event.queryStringParameters || {};

  let body = event.body;
  if (event.isBase64Encoded && body) {
    body = Buffer.from(body, 'base64').toString('utf8');
  }

  // 尝试解析 JSON body
  let parsedBody = body;
  try {
    if (
      typeof body === 'string' &&
      (headers['content-type']?.includes('application/json') ||
        headers['Content-Type']?.includes('application/json'))
    ) {
      parsedBody = JSON.parse(body);
    }
  } catch (e) {
    // failed to parse, keep as string
  }

  const startReq: any = {
    method,
    url: path,
    headers,
    query,
    body: parsedBody || {},
  };

  // 构造兼容 Express 的 Request 对象
  const proxyReq = Object.assign(startReq, {
    _read: () => {},
    resume: () => {},
    pause: () => {},
    on: (type: string, handler: Function) => {
      if (type === 'data') {
        // body 已经在 startReq.body 中，不需要触发 data 事件
      }
      if (type === 'end') {
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
    end(data: any) {
      // 这里的 end 会被 Promise 中的 logic 劫持，或者我们需要手动处理
      // 由于我们下面使用了 Promise 包装，这里会被覆盖
    },
  };

  return new Promise((resolve, reject) => {
    // 劫持 end 以 resolve promise
    proxyRes.end = (data: any) => {
      let responseBody = data;
      let isBase64Encoded = false;

      // 如果是 Buffer，转换为 Base64
      if (Buffer.isBuffer(data)) {
        responseBody = data.toString('base64');
        isBase64Encoded = true;
      } else if (typeof data === 'object') {
        responseBody = JSON.stringify(data);
      }

      const response = {
        statusCode: proxyRes.statusCode,
        headers: proxyRes.headers,
        isBase64Encoded,
        body: responseBody,
      };

      resolve(response);
    };

    try {
      // @ts-ignore
      expressApp(proxyReq, proxyRes);
    } catch (err) {
      console.error('Express dispatch error:', err);
      resolve({
        statusCode: 500,
        body: JSON.stringify({ error: String(err) }),
        headers: { 'Content-Type': 'application/json' },
      });
    }
  });
}
