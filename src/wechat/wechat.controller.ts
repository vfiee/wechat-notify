/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  SendCardMessageDto,
  SendMarkdownMessageDto,
  SendNewsMessageDto,
  SendTextMessageDto,
} from './dto/send-message.dto';
import { WechatService } from './wechat.service';

@ApiTags('企业微信')
@Controller('wechat')
export class WechatController {
  constructor(private readonly wechatService: WechatService) { }

  /**
   * 发送文本消息
   */
  @Post('send/text')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '发送文本消息',
    description: '向企业微信发送纯文本消息',
  })
  @ApiBody({ type: SendTextMessageDto })
  @ApiResponse({
    status: 200,
    description: '消息发送成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '文本消息发送成功' },
        data: {
          type: 'object',
          properties: {
            errcode: { type: 'number', example: 0 },
            errmsg: { type: 'string', example: 'ok' },
          },
        },
      },
    },
  })
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
  @ApiOperation({
    summary: '发送 Markdown 消息',
    description: '向企业微信发送 Markdown 格式的消息，支持富文本格式',
  })
  @ApiBody({ type: SendMarkdownMessageDto })
  @ApiResponse({
    status: 200,
    description: '消息发送成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Markdown 消息发送成功' },
        data: {
          type: 'object',
          properties: {
            errcode: { type: 'number', example: 0 },
            errmsg: { type: 'string', example: 'ok' },
          },
        },
      },
    },
  })
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
  @ApiOperation({
    summary: '发送图文消息',
    description: '向企业微信发送图文消息，支持多图文',
  })
  @ApiBody({ type: SendNewsMessageDto })
  @ApiResponse({
    status: 200,
    description: '消息发送成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '图文消息发送成功' },
        data: {
          type: 'object',
          properties: {
            errcode: { type: 'number', example: 0 },
            errmsg: { type: 'string', example: 'ok' },
          },
        },
      },
    },
  })
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
  @ApiOperation({
    summary: '发送卡片消息',
    description: '发送简化的卡片消息，支持标题、内容、紧急程度、图片和跳转链接',
  })
  @ApiBody({ type: SendCardMessageDto })
  @ApiResponse({
    status: 200,
    description: '消息发送成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '卡片消息发送成功' },
        data: {
          type: 'object',
          properties: {
            errcode: { type: 'number', example: 0 },
            errmsg: { type: 'string', example: 'ok' },
          },
        },
      },
    },
  })
  async sendCardMessage(@Body() dto: SendCardMessageDto) {
    const result = await this.wechatService.sendCardMessage(dto);
    return {
      success: true,
      message: '卡片消息发送成功',
      data: result,
    };
  }

  /**
   * 接收 Uptime Kuma 通知
   */
  @Post('send/uptime-kuma')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '接收 Uptime Kuma 监控通知',
    description: '接收来自 Uptime Kuma 的监控告警，并转发到企业微信',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        monitor: {
          type: 'object',
          properties: {
            name: { type: 'string', example: '网站监控' },
            url: { type: 'string', example: 'https://example.com' },
          },
        },
        msg: { type: 'string', example: '服务异常，请及时处理' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '消息发送成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '卡片消息发送成功' },
        data: {
          type: 'object',
          properties: {
            errcode: { type: 'number', example: 0 },
            errmsg: { type: 'string', example: 'ok' },
          },
        },
      },
    },
  })
  async sendUptimeKumaMessage(@Body() dto: any) {
    console.log(`dto:`, dto);
    const { monitor, msg } = dto || {};
    const body: SendCardMessageDto = {
      content: msg,
      level: '紧急',
      url: monitor?.url || '',
      title: `${monitor?.name || 'Uptime-Kuma 通知'}`,
    };
    const result = await this.wechatService.sendCardMessage(body);
    return {
      success: true,
      message: '卡片消息发送成功',
      data: result,
    };
  }
}
