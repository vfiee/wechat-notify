import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * 发送文本消息 DTO
 */
export class SendTextMessageDto {
  @ApiProperty({
    description: '消息内容',
    example: '这是一条测试消息',
  })
  @IsString()
  @IsNotEmpty({ message: '消息内容不能为空' })
  content: string;

  @ApiPropertyOptional({
    description: '成员ID列表（消息接收者，多个接收者用"|"分隔）',
    example: 'user1|user2',
  })
  @IsString()
  @IsOptional()
  touser?: string; // 成员ID列表（消息接收者，多个接收者用'|'分隔）

  @ApiPropertyOptional({
    description: '部门ID列表，多个接收者用"|"分隔',
    example: '1|2',
  })
  @IsString()
  @IsOptional()
  toparty?: string; // 部门ID列表，多个接收者用'|'分隔

  @ApiPropertyOptional({
    description: '标签ID列表，多个接收者用"|"分隔',
    example: 'tag1|tag2',
  })
  @IsString()
  @IsOptional()
  totag?: string; // 标签ID列表，多个接收者用'|'分隔

  @ApiPropertyOptional({
    description: '表示是否是保密消息，0表示否，1表示是，默认0',
    example: 0,
    enum: [0, 1],
  })
  @IsOptional()
  safe?: number; // 表示是否是保密消息，0表示否，1表示是，默认0
}

/**
 * 发送 Markdown 消息 DTO
 */
export class SendMarkdownMessageDto {
  @ApiProperty({
    description: 'Markdown 格式的消息内容',
    example: '# 标题\n\n这是**加粗**文本',
  })
  @IsString()
  @IsNotEmpty({ message: 'Markdown 内容不能为空' })
  content: string;

  @ApiPropertyOptional({
    description: '成员ID列表（消息接收者，多个接收者用"|"分隔）',
    example: 'user1|user2',
  })
  @IsString()
  @IsOptional()
  touser?: string;

  @ApiPropertyOptional({
    description: '部门ID列表，多个接收者用"|"分隔',
    example: '1|2',
  })
  @IsString()
  @IsOptional()
  toparty?: string;

  @ApiPropertyOptional({
    description: '标签ID列表，多个接收者用"|"分隔',
    example: 'tag1|tag2',
  })
  @IsString()
  @IsOptional()
  totag?: string;
}

/**
 * 发送图文消息 DTO
 */
export class SendNewsMessageDto {
  @ApiProperty({
    description: '图文消息列表',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        title: { type: 'string', description: '标题' },
        description: { type: 'string', description: '描述' },
        url: { type: 'string', description: '点击后跳转的链接' },
        picurl: { type: 'string', description: '图文消息的图片链接' },
      },
    },
    example: [
      {
        title: '通知标题',
        description: '通知描述内容',
        url: 'https://example.com',
        picurl: 'https://example.com/image.jpg',
      },
    ],
  })
  @IsArray()
  @IsNotEmpty({ message: '图文消息不能为空' })
  articles: Array<{
    title: string;
    description?: string;
    url: string;
    picurl?: string;
  }>;

  @ApiPropertyOptional({
    description: '成员ID列表（消息接收者，多个接收者用"|"分隔）',
    example: 'user1|user2',
  })
  @IsString()
  @IsOptional()
  touser?: string;

  @ApiPropertyOptional({
    description: '部门ID列表，多个接收者用"|"分隔',
    example: '1|2',
  })
  @IsString()
  @IsOptional()
  toparty?: string;

  @ApiPropertyOptional({
    description: '标签ID列表，多个接收者用"|"分隔',
    example: 'tag1|tag2',
  })
  @IsString()
  @IsOptional()
  totag?: string;
}

/**
 * 发送卡片消息 DTO (简化版图文消息)
 */
export class SendCardMessageDto {
  @ApiProperty({
    description: '卡片标题',
    example: '系统通知',
  })
  @IsString()
  @IsNotEmpty({ message: '标题不能为空' })
  title: string;

  @ApiProperty({
    description: '卡片内容',
    example: '这是一条重要通知',
  })
  @IsString()
  @IsNotEmpty({ message: '内容不能为空' })
  content: string;

  @ApiPropertyOptional({
    description: '紧急程度',
    example: '一般',
    enum: ['一般', '紧急', '非常紧急', 'normal', 'urgent', 'critical'],
  })
  @IsString()
  @IsOptional()
  // generally: 'normal' | 'urgent' | 'critical'
  // or user specified: '一般', '紧急', '非常紧急'
  level?: string;

  @ApiPropertyOptional({
    description: '图片URL',
    example: 'https://example.com/image.jpg',
  })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiPropertyOptional({
    description: '成员ID列表（消息接收者，多个接收者用"|"分隔）',
    example: 'user1|user2',
  })
  @IsString()
  @IsOptional()
  touser?: string;

  @ApiPropertyOptional({
    description: '部门ID列表，多个接收者用"|"分隔',
    example: '1|2',
  })
  @IsString()
  @IsOptional()
  toparty?: string;

  @ApiPropertyOptional({
    description: '标签ID列表，多个接收者用"|"分隔',
    example: 'tag1|tag2',
  })
  @IsString()
  @IsOptional()
  totag?: string;

  @ApiPropertyOptional({
    description: '点击卡片后跳转的URL',
    example: 'https://example.com',
  })
  @IsString()
  @IsOptional()
  url?: string;
}
