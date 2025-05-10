import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as compression from 'compression';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from './config';
import { ApiResponse, PageData } from './common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const appConfig = configService.get<AppConfig>('app');

  if (!appConfig) {
    throw new Error('应用配置未找到');
  }

  // 配置全局路由前缀
  if (appConfig.useGlobalPrefix) {
    app.setGlobalPrefix(`${appConfig.apiPrefix}/${appConfig.apiVersion}`);
  }

  // 配置全局管道
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // 安全中间件
  app.use(helmet());

  // 启用压缩
  app.use(compression());

  // 启用cookie解析
  app.use(cookieParser());

  // 跨域配置
  app.enableCors({
    origin: appConfig.cors.origin,
    methods: appConfig.cors.methods,
    credentials: appConfig.cors.credentials,
  });

  // Swagger文档配置
  const swaggerConfig = new DocumentBuilder()
    .setTitle('LowCodeX API')
    .setDescription('LowCodeX平台API文档')
    .setVersion(appConfig.apiVersion)
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    extraModels: [ApiResponse, PageData],
  });
  SwaggerModule.setup('api/docs', app, document);

  // 启动应用
  const port = process.env.PORT || appConfig.port;
  await app.listen(port);
  console.log(`应用已启动，监听端口: ${port}`);
  console.log(`API文档: http://localhost:${port}/docs`);
}

bootstrap();
