import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { WechatController } from './wechat.controller';
import { WechatService } from './wechat.service';

@Module({
  imports: [HttpModule],
  controllers: [WechatController],
  providers: [WechatService],
  exports: [WechatService],
})
export class WechatModule {}
