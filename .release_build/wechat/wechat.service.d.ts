import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { SendMarkdownMessageDto, SendNewsMessageDto, SendTextMessageDto } from './dto/send-message.dto';
import { SendMessageResponse } from './interfaces/wechat.interface';
export declare class WechatService {
    private readonly configService;
    private readonly httpService;
    private readonly logger;
    private readonly baseUrl;
    private readonly corpId;
    private readonly agentId;
    private readonly secret;
    private accessToken;
    private tokenExpireTime;
    constructor(configService: ConfigService, httpService: HttpService);
    private getAccessToken;
    sendTextMessage(dto: SendTextMessageDto): Promise<SendMessageResponse>;
    sendMarkdownMessage(dto: SendMarkdownMessageDto): Promise<SendMessageResponse>;
    sendNewsMessage(dto: SendNewsMessageDto): Promise<SendMessageResponse>;
    private sendMessage;
}
