import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as compression from 'compression';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from './config';

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
      whitelist: true, // 过滤掉非DTO中定义的属性
      transform: true, // 自动转换类型
      forbidNonWhitelisted: true, // 对非白名单属性抛出错误
      transformOptions: {
        enableImplicitConversion: true, // 启用隐式类型转换
      },
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
    .setDescription('低代码平台API文档')
    .setVersion(appConfig.apiVersion)
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  // 启动应用
  await app.listen(appConfig.port);
  console.log(`应用已启动: http://localhost:${appConfig.port}`);
  console.log(`API文档: http://localhost:${appConfig.port}/docs`);
}

bootstrap();
