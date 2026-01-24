export declare class SendTextMessageDto {
    content: string;
    touser?: string;
    toparty?: string;
    totag?: string;
    safe?: number;
}
export declare class SendMarkdownMessageDto {
    content: string;
    touser?: string;
    toparty?: string;
    totag?: string;
}
export declare class SendNewsMessageDto {
    articles: Array<{
        title: string;
        description?: string;
        url: string;
        picurl?: string;
    }>;
    touser?: string;
    toparty?: string;
    totag?: string;
}
