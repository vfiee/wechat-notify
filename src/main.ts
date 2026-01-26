import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // 设置全局前缀
  const apiPrefix = configService.get<string>('API_PREFIX', 'api');
  app.setGlobalPrefix(apiPrefix);

  // 启用 CORS
  app.enableCors();

  // 配置 Swagger
  const config = new DocumentBuilder()
    .setTitle('企业微信通知服务 API')
    .setDescription('企业微信消息推送服务接口文档')
    .setVersion('1.0')
    .addTag('健康检查', '服务健康状态检查')
    .addTag('企业微信', '企业微信消息推送相关接口')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = configService.get<number>('PORT', 8089);
  await app.listen(port);

  console.log(`🚀 应用运行在: http://localhost:${port}/${apiPrefix}`);
  console.log(`📚 API 文档地址: http://localhost:${port}/api-docs`);
}

void bootstrap();
