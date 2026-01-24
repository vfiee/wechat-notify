import { SendMarkdownMessageDto, SendNewsMessageDto, SendTextMessageDto } from './dto/send-message.dto';
import { WechatService } from './wechat.service';
export declare class WechatController {
    private readonly wechatService;
    constructor(wechatService: WechatService);
    sendTextMessage(dto: SendTextMessageDto): Promise<{
        success: boolean;
        message: string;
        data: import("./interfaces/wechat.interface").SendMessageResponse;
    }>;
    sendMarkdownMessage(dto: SendMarkdownMessageDto): Promise<{
        success: boolean;
        message: string;
        data: import("./interfaces/wechat.interface").SendMessageResponse;
    }>;
    sendNewsMessage(dto: SendNewsMessageDto): Promise<{
        success: boolean;
        message: string;
        data: import("./interfaces/wechat.interface").SendMessageResponse;
    }>;
}
