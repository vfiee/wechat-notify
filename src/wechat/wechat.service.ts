import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
  SendCardMessageDto,
  SendMarkdownMessageDto,
  SendNewsMessageDto,
  SendTextMessageDto,
} from './dto/send-message.dto';
import {
  AccessTokenResponse,
  SendMessageResponse,
} from './interfaces/wechat.interface';

@Injectable()
export class WechatService {
  private readonly logger = new Logger(WechatService.name);
  private readonly baseUrl = 'https://qyapi.weixin.qq.com/cgi-bin';
  private readonly corpId: string;
  private readonly agentId: string;
  private readonly secret: string;

  private accessToken: string | null = null;
  private tokenExpireTime: number = 0;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.corpId = this.configService.get<string>('WECHAT_CORP_ID')!;
    this.agentId = this.configService.get<string>('WECHAT_AGENT_ID')!;
    this.secret = this.configService.get<string>('WECHAT_SECRET')!;

    if (!this.corpId || !this.agentId || !this.secret) {
      this.logger.error('企业微信配置缺失，请检查环境变量');
      throw new Error('企业微信配置缺失');
    }
  }

  /**
   * 获取 Access Token
   */
  private async getAccessToken(): Promise<string> {
    const now = Date.now();

    // 如果 token 未过期，直接返回
    if (this.accessToken && now < this.tokenExpireTime) {
      return this.accessToken;
    }

    try {
      const url = `${this.baseUrl}/gettoken`;
      const { data } = await firstValueFrom(
        this.httpService.get<AccessTokenResponse>(url, {
          params: {
            corpid: this.corpId,
            corpsecret: this.secret,
          },
        }),
      );

      if (data.errcode !== 0) {
        throw new Error(`获取 Access Token 失败: ${data.errmsg}`);
      }

      this.accessToken = data.access_token;
      // 提前 5 分钟过期
      this.tokenExpireTime = now + (data.expires_in - 300) * 1000;

      this.logger.log('Access Token 获取成功');
      return this.accessToken;
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : '';
      this.logger.error('获取 Access Token 失败', errorStack);
      throw new HttpException(
        '获取企业微信 Access Token 失败',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 发送文本消息
   */
  async sendTextMessage(dto: SendTextMessageDto): Promise<SendMessageResponse> {
    const token = await this.getAccessToken();
    const url = `${this.baseUrl}/message/send?access_token=${token}`;

    const payload = {
      touser: dto.touser || 'Jiangweipeng',
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

  /**
   * 发送 Markdown 消息
   */
  async sendMarkdownMessage(
    dto: SendMarkdownMessageDto,
  ): Promise<SendMessageResponse> {
    const token = await this.getAccessToken();
    const url = `${this.baseUrl}/message/send?access_token=${token}`;

    const payload = {
      touser: dto.touser || 'Jiangweipeng',
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

  /**
   * 发送图文消息
   */
  async sendNewsMessage(dto: SendNewsMessageDto): Promise<SendMessageResponse> {
    const token = await this.getAccessToken();
    const url = `${this.baseUrl}/message/send?access_token=${token}`;

    const payload = {
      touser: dto.touser || 'Jiangweipeng',
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

  /**
   * 发送卡片消息 (简化版图文)
   */
  async sendCardMessage(dto: SendCardMessageDto): Promise<SendMessageResponse> {
    // 1. 获取服务器地址
    const serverUrl =
      this.configService.get<string>('SERVER_URL') ||
      `http://localhost:${this.configService.get<number>('PORT', 8089)}`;

    // 2. 构造页面 URL
    const params = new URLSearchParams({
      title: dto.title,
      content: dto.content,
      level: dto.level || 'urgent',
    });
    if (dto.image) {
      params.append('image', dto.image);
    }

    // ServeStatic 默认将 assets 下的文件映射到根目录
    // 假设 API_PREFIX 不影响静态资源（需确认 ServeStatic 配置，通常 rootPath 映射到 host/）
    // 直接使用 /html/notification.html
    const urlLink = `${serverUrl}/html/notification.html?${params.toString()}`;

    // 3. 固定封面图
    const picurl = `${serverUrl}/images/notify.webp`;

    // 4. 发送
    return this.sendNewsMessage({
      touser: dto.touser,
      toparty: dto.toparty,
      totag: dto.totag,
      articles: [
        {
          title: dto.title,
          description: dto.content,
          url: urlLink,
          picurl: picurl,
        },
      ],
    });
  }

  /**
   * 通用发送消息方法
   */
  private async sendMessage(
    url: string,
    payload: any,
  ): Promise<SendMessageResponse> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post<SendMessageResponse>(url, payload),
      );

      if (data.errcode !== 0) {
        this.logger.error(`发送消息失败: ${data.errmsg}`);
        throw new Error(`发送消息失败: ${data.errmsg}`);
      }

      this.logger.log('消息发送成功');
      return data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '发送消息失败';
      const errorStack = error instanceof Error ? error.stack : '';
      this.logger.error('发送消息失败', errorStack);
      throw new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
