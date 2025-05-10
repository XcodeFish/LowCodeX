import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';

// 控制器模块
import { AppController } from './app.controller';

// 服务模块
import { AppService } from './app.service';
import { PrismaService } from './services/prisma.service';
import { RedisService } from './services/redis.service';
import { LoggerService } from './services/logger.service';

// 过滤器模块
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { RolesGuard } from './common/guards/roles.guard';

// 健康检查模块
import { HealthModule } from './health/health.module';

// 用户和认证模块
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';

// 系统模块
import { SystemModule } from './modules/system/system.module';

// 配置模块
import { configModules } from './config';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local'],
      load: configModules,
      cache: true,
    }),
    // 健康检查模块
    HealthModule,
    // 用户模块
    UsersModule,
    // 认证模块
    AuthModule,
    // 系统模块
    SystemModule,
  ],
  controllers: [AppController],
  providers: [
    // 基础服务
    AppService,
    PrismaService,
    RedisService,
    LoggerService,

    // 全局异常过滤器
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },

    // 全局拦截器
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },

    // 全局角色守卫
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },

    // 全局JWT认证守卫
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
