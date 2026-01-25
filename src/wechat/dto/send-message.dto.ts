import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * 发送文本消息 DTO
 */
export class SendTextMessageDto {
  @IsString()
  @IsNotEmpty({ message: '消息内容不能为空' })
  content: string;

  @IsString()
  @IsOptional()
  touser?: string; // 成员ID列表（消息接收者，多个接收者用'|'分隔）

  @IsString()
  @IsOptional()
  toparty?: string; // 部门ID列表，多个接收者用'|'分隔

  @IsString()
  @IsOptional()
  totag?: string; // 标签ID列表，多个接收者用'|'分隔

  @IsOptional()
  safe?: number; // 表示是否是保密消息，0表示否，1表示是，默认0
}

/**
 * 发送 Markdown 消息 DTO
 */
export class SendMarkdownMessageDto {
  @IsString()
  @IsNotEmpty({ message: 'Markdown 内容不能为空' })
  content: string;

  @IsString()
  @IsOptional()
  touser?: string;

  @IsString()
  @IsOptional()
  toparty?: string;

  @IsString()
  @IsOptional()
  totag?: string;
}

/**
 * 发送图文消息 DTO
 */
export class SendNewsMessageDto {
  @IsArray()
  @IsNotEmpty({ message: '图文消息不能为空' })
  articles: Array<{
    title: string;
    description?: string;
    url: string;
    picurl?: string;
  }>;

  @IsString()
  @IsOptional()
  touser?: string;

  @IsString()
  @IsOptional()
  toparty?: string;

  @IsString()
  @IsOptional()
  totag?: string;
}

/**
 * 发送卡片消息 DTO (简化版图文消息)
 */
export class SendCardMessageDto {
  @IsString()
  @IsNotEmpty({ message: '标题不能为空' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: '内容不能为空' })
  content: string;

  @IsString()
  @IsOptional()
  // generally: 'normal' | 'urgent' | 'critical'
  // or user specified: '一般', '紧急', '非常紧急'
  level?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsOptional()
  touser?: string;

  @IsString()
  @IsOptional()
  toparty?: string;

  @IsString()
  @IsOptional()
  totag?: string;

  @IsString()
  @IsOptional()
  url?: string;
}
