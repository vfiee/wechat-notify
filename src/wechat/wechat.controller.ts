import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  SendCardMessageDto,
  SendMarkdownMessageDto,
  SendNewsMessageDto,
  SendTextMessageDto,
} from './dto/send-message.dto';
import { WechatService } from './wechat.service';

@Controller('wechat')
export class WechatController {
  constructor(private readonly wechatService: WechatService) {}

  /**
   * 发送文本消息
   */
  @Post('send/text')
  @HttpCode(HttpStatus.OK)
  async sendTextMessage(@Body() dto: SendTextMessageDto) {
    const result = await this.wechatService.sendTextMessage(dto);
    return {
      success: true,
      message: '文本消息发送成功',
      data: result,
    };
  }

  /**
   * 发送 Markdown 消息
   */
  @Post('send/markdown')
  @HttpCode(HttpStatus.OK)
  async sendMarkdownMessage(@Body() dto: SendMarkdownMessageDto) {
    const result = await this.wechatService.sendMarkdownMessage(dto);
    return {
      success: true,
      message: 'Markdown 消息发送成功',
      data: result,
    };
  }

  /**
   * 发送图文消息
   */
  @Post('send/news')
  @HttpCode(HttpStatus.OK)
  async sendNewsMessage(@Body() dto: SendNewsMessageDto) {
    const result = await this.wechatService.sendNewsMessage(dto);
    return {
      success: true,
      message: '图文消息发送成功',
      data: result,
    };
  }

  /**
   * 发送卡片消息 (简化接口)
   */
  @Post('send/card')
  @HttpCode(HttpStatus.OK)
  async sendCardMessage(@Body() dto: SendCardMessageDto) {
    const result = await this.wechatService.sendCardMessage(dto);
    return {
      success: true,
      message: '卡片消息发送成功',
      data: result,
    };
  }
}
