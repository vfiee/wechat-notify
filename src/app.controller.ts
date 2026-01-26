import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('健康检查')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOperation({
    summary: '健康检查',
    description: '检查服务运行状态',
  })
  @ApiResponse({
    status: 200,
    description: '服务正常运行',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2026-01-26T08:28:00.000Z' },
      },
    },
  })
  getHealth(): object {
    return this.appService.getHealth();
  }
}
