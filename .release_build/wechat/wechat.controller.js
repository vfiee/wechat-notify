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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WechatController = void 0;
const common_1 = require("@nestjs/common");
const send_message_dto_1 = require("./dto/send-message.dto");
const wechat_service_1 = require("./wechat.service");
let WechatController = class WechatController {
    wechatService;
    constructor(wechatService) {
        this.wechatService = wechatService;
    }
    async sendTextMessage(dto) {
        const result = await this.wechatService.sendTextMessage(dto);
        return {
            success: true,
            message: '文本消息发送成功',
            data: result,
        };
    }
    async sendMarkdownMessage(dto) {
        const result = await this.wechatService.sendMarkdownMessage(dto);
        return {
            success: true,
            message: 'Markdown 消息发送成功',
            data: result,
        };
    }
    async sendNewsMessage(dto) {
        const result = await this.wechatService.sendNewsMessage(dto);
        return {
            success: true,
            message: '图文消息发送成功',
            data: result,
        };
    }
};
exports.WechatController = WechatController;
__decorate([
    (0, common_1.Post)('send/text'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [send_message_dto_1.SendTextMessageDto]),
    __metadata("design:returntype", Promise)
], WechatController.prototype, "sendTextMessage", null);
__decorate([
    (0, common_1.Post)('send/markdown'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [send_message_dto_1.SendMarkdownMessageDto]),
    __metadata("design:returntype", Promise)
], WechatController.prototype, "sendMarkdownMessage", null);
__decorate([
    (0, common_1.Post)('send/news'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [send_message_dto_1.SendNewsMessageDto]),
    __metadata("design:returntype", Promise)
], WechatController.prototype, "sendNewsMessage", null);
exports.WechatController = WechatController = __decorate([
    (0, common_1.Controller)('wechat'),
    __metadata("design:paramtypes", [wechat_service_1.WechatService])
], WechatController);
//# sourceMappingURL=wechat.controller.js.map