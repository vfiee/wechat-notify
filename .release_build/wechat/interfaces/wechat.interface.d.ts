export interface WechatApiResponse<T = any> {
    errcode: number;
    errmsg: string;
    data?: T;
}
export interface AccessTokenResponse {
    errcode: number;
    errmsg: string;
    access_token: string;
    expires_in: number;
}
export interface SendMessageResponse {
    errcode: number;
    errmsg: string;
    invaliduser?: string;
    invalidparty?: string;
    invalidtag?: string;
    msgid?: string;
}
