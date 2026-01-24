"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var WechatService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WechatService = void 0;
const axios_1 = require("@nestjs/axios");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
let WechatService = WechatService_1 = class WechatService {
    configService;
    httpService;
    logger = new common_1.Logger(WechatService_1.name);
    baseUrl = 'https://qyapi.weixin.qq.com/cgi-bin';
    corpId;
    agentId;
    secret;
    accessToken = null;
    tokenExpireTime = 0;
    constructor(configService, httpService) {
        this.configService = configService;
        this.httpService = httpService;
        this.corpId = this.configService.get('WECHAT_CORP_ID');
        this.agentId = this.configService.get('WECHAT_AGENT_ID');
        this.secret = this.configService.get('WECHAT_SECRET');
        if (!this.corpId || !this.agentId || !this.secret) {
            this.logger.error('企业微信配置缺失，请检查环境变量');
            throw new Error('企业微信配置缺失');
        }
    }
    async getAccessToken() {
        const now = Date.now();
        if (this.accessToken && now < this.tokenExpireTime) {
            return this.accessToken;
        }
        try {
            const url = `${this.baseUrl}/gettoken`;
            const { data } = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, {
                params: {
                    corpid: this.corpId,
                    corpsecret: this.secret,
                },
            }));
            if (data.errcode !== 0) {
                throw new Error(`获取 Access Token 失败: ${data.errmsg}`);
            }
            this.accessToken = data.access_token;
            this.tokenExpireTime = now + (data.expires_in - 300) * 1000;
            this.logger.log('Access Token 获取成功');
            return this.accessToken;
        }
        catch (error) {
            const errorStack = error instanceof Error ? error.stack : '';
            this.logger.error('获取 Access Token 失败', errorStack);
            throw new common_1.HttpException('获取企业微信 Access Token 失败', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async sendTextMessage(dto) {
        const token = await this.getAccessToken();
        const url = `${this.baseUrl}/message/send?access_token=${token}`;
        const payload = {
            touser: dto.touser || '@all',
            toparty: dto.toparty,
            totag: dto.totag,
            msgtype: 'text',
            agentid: this.agentId,
            text: {
                content: dto.content,
            },
            safe: dto.safe || 0,
        };
        return this.sendMessage(url, payload);
    }
    async sendMarkdownMessage(dto) {
        const token = await this.getAccessToken();
        const url = `${this.baseUrl}/message/send?access_token=${token}`;
        const payload = {
            touser: dto.touser || '@all',
            toparty: dto.toparty,
            totag: dto.totag,
            msgtype: 'markdown',
            agentid: this.agentId,
            markdown: {
                content: dto.content,
            },
        };
        return this.sendMessage(url, payload);
    }
    async sendNewsMessage(dto) {
        const token = await this.getAccessToken();
        const url = `${this.baseUrl}/message/send?access_token=${token}`;
        const payload = {
            touser: dto.touser || '@all',
            toparty: dto.toparty,
            totag: dto.totag,
            msgtype: 'news',
            agentid: this.agentId,
            news: {
                articles: dto.articles,
            },
        };
        return this.sendMessage(url, payload);
    }
    async sendMessage(url, payload) {
        try {
            const { data } = await (0, rxjs_1.firstValueFrom)(this.httpService.post(url, payload));
            if (data.errcode !== 0) {
                this.logger.error(`发送消息失败: ${data.errmsg}`);
                throw new Error(`发送消息失败: ${data.errmsg}`);
            }
            this.logger.log('消息发送成功');
            return data;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : '发送消息失败';
            const errorStack = error instanceof Error ? error.stack : '';
            this.logger.error('发送消息失败', errorStack);
            throw new common_1.HttpException(errorMessage, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.WechatService = WechatService;
exports.WechatService = WechatService = WechatService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        axios_1.HttpService])
], WechatService);
//# sourceMappingURL=wechat.service.js.map