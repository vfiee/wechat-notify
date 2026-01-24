/**
 * 企业微信 API 响应接口
 */
export interface WechatApiResponse<T = any> {
  errcode: number;
  errmsg: string;
  data?: T;
}

/**
 * Access Token 响应
 */
export interface AccessTokenResponse {
  errcode: number;
  errmsg: string;
  access_token: string;
  expires_in: number;
}

/**
 * 发送消息响应
 */
export interface SendMessageResponse {
  errcode: number;
  errmsg: string;
  invaliduser?: string;
  invalidparty?: string;
  invalidtag?: string;
  msgid?: string;
}
