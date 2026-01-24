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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendNewsMessageDto = exports.SendMarkdownMessageDto = exports.SendTextMessageDto = void 0;
const class_validator_1 = require("class-validator");
class SendTextMessageDto {
    content;
    touser;
    toparty;
    totag;
    safe;
}
exports.SendTextMessageDto = SendTextMessageDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: '消息内容不能为空' }),
    __metadata("design:type", String)
], SendTextMessageDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SendTextMessageDto.prototype, "touser", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SendTextMessageDto.prototype, "toparty", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SendTextMessageDto.prototype, "totag", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], SendTextMessageDto.prototype, "safe", void 0);
class SendMarkdownMessageDto {
    content;
    touser;
    toparty;
    totag;
}
exports.SendMarkdownMessageDto = SendMarkdownMessageDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Markdown 内容不能为空' }),
    __metadata("design:type", String)
], SendMarkdownMessageDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SendMarkdownMessageDto.prototype, "touser", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SendMarkdownMessageDto.prototype, "toparty", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SendMarkdownMessageDto.prototype, "totag", void 0);
class SendNewsMessageDto {
    articles;
    touser;
    toparty;
    totag;
}
exports.SendNewsMessageDto = SendNewsMessageDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNotEmpty)({ message: '图文消息不能为空' }),
    __metadata("design:type", Array)
], SendNewsMessageDto.prototype, "articles", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SendNewsMessageDto.prototype, "touser", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SendNewsMessageDto.prototype, "toparty", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SendNewsMessageDto.prototype, "totag", void 0);
//# sourceMappingURL=send-message.dto.js.map