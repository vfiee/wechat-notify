"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    const apiPrefix = configService.get('API_PREFIX', 'api');
    app.setGlobalPrefix(apiPrefix);
    app.enableCors();
    const port = configService.get('PORT', 8089);
    await app.listen(port);
    console.log(`🚀 应用运行在: http://localhost:${port}/${apiPrefix}`);
}
void bootstrap();
//# sourceMappingURL=main.js.map