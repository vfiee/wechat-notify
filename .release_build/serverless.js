"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = handler;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const platform_express_1 = require("@nestjs/platform-express");
const express_1 = __importDefault(require("express"));
const http = __importStar(require("http"));
const app_module_1 = require("./app.module");
const server = (0, express_1.default)();
let app = null;
async function bootstrap() {
    if (!app) {
        app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_express_1.ExpressAdapter(server), {
            logger: ['error', 'warn', 'log'],
        });
        const configService = app.get(config_1.ConfigService);
        app.useGlobalPipes(new common_1.ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
        }));
        const apiPrefix = configService.get('API_PREFIX', 'api');
        app.setGlobalPrefix(apiPrefix);
        app.enableCors();
        await app.init();
        console.log('🚀 NestJS 应用已初始化（Serverless 模式）');
    }
    return server;
}
async function handler(event, context, callback) {
    const expressApp = await bootstrap();
    let startReq;
    if (Buffer.isBuffer(event)) {
        startReq = {
            method: 'POST',
            url: '/api/wechat/send/text',
            headers: { 'content-type': 'application/json' },
            query: {},
            body: {},
        };
        try {
            const bodyStr = event.toString();
            let parsed = JSON.parse(bodyStr);
            if (parsed && typeof parsed === 'object' && parsed.body && (parsed.rawPath || parsed.version || parsed.headers)) {
                try {
                    parsed = typeof parsed.body === 'string' ? JSON.parse(parsed.body) : parsed.body;
                }
                catch (e) { }
            }
            startReq.body = parsed;
        }
        catch (e) {
            startReq.body = {};
        }
    }
    else if (typeof event === 'object' && (event.headers || event.body)) {
        const httpMethod = event.httpMethod || event.method || 'GET';
        const path = event.path || event.url || '/';
        let parsedBody = event.body;
        try {
            if (typeof event.body === 'string') {
                parsedBody = JSON.parse(event.body);
            }
        }
        catch (e) { }
        startReq = {
            method: httpMethod,
            url: path,
            headers: event.headers || {},
            query: event.queryParameters || event.query || {},
            body: parsedBody || {},
        };
    }
    else {
        startReq = event || {};
        if (!startReq.method)
            startReq.method = 'GET';
        if (!startReq.url)
            startReq.url = '/';
        if (!startReq.headers)
            startReq.headers = {};
        if (!startReq.query)
            startReq.query = {};
    }
    if (startReq.method === 'POST' && startReq.url === '/') {
        startReq.url = '/api/wechat/send/text';
    }
    const proxyReq = Object.assign(startReq, {
        _read: () => { },
        resume: () => { },
        pause: () => { },
        on: (type, handler) => {
            if (type === 'data') {
            }
            if (type === 'end') {
                handler();
            }
            return proxyReq;
        },
        pipe: () => proxyReq,
        unpipe: () => { },
    });
    const proxyRes = {
        __proto__: http.ServerResponse.prototype,
        statusCode: 200,
        headers: {},
        _headers: {},
        locals: {},
        setHeader(key, value) {
            this.headers[key] = value;
            this._headers[key] = value;
            return this;
        },
        getHeader(key) {
            return this.headers[key];
        },
        removeHeader(key) {
            delete this.headers[key];
            delete this._headers[key];
        },
        writeHead(statusCode, headers) {
            this.statusCode = statusCode;
            if (headers)
                Object.assign(this.headers, headers);
            return this;
        },
        status(code) {
            this.statusCode = code;
            return this;
        },
        send(data) {
            this.end(data);
        },
        json(data) {
            this.setHeader('Content-Type', 'application/json');
            this.end(JSON.stringify(data));
        },
        end(data) {
            const response = {
                isBase64Encoded: false,
                statusCode: this.statusCode,
                headers: this.headers,
                body: data,
            };
            if (context && typeof context.send === 'function') {
                context.setStatusCode(this.statusCode);
                for (const k in this.headers)
                    context.setHeader(k, this.headers[k]);
                context.send(data);
            }
            else if (typeof callback === 'function') {
                callback(null, response);
            }
            else {
                return response;
            }
        },
        emit: () => { },
        on: () => { },
        once: () => { },
        removeListener: () => { },
    };
    try {
        expressApp(proxyReq, proxyRes);
        return new Promise((resolve) => {
            const originalEnd = proxyRes.end;
            proxyRes.end = (data) => {
                const response = {
                    isBase64Encoded: false,
                    statusCode: proxyRes.statusCode,
                    headers: proxyRes.headers,
                    body: data,
                };
                if (context && typeof context.send === 'function') {
                    originalEnd.call(proxyRes, data);
                    resolve(undefined);
                }
                else if (typeof callback === 'function') {
                    callback(null, response);
                    resolve(undefined);
                }
                else {
                    resolve(response);
                }
            };
        });
    }
    catch (err) {
        console.error('Express dispatch error:', err);
        const errRes = { statusCode: 500, body: JSON.stringify({ error: String(err) }) };
        if (typeof callback === 'function')
            callback(null, errRes);
        return errRes;
    }
}
if (require.main === module) {
    void bootstrap().then((expressApp) => {
        const port = process.env.PORT || 8089;
        expressApp.listen(port, () => {
            console.log(`🚀 应用运行在: http://localhost:${port}/api`);
        });
    });
}
//# sourceMappingURL=serverless.js.map