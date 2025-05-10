import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health.controller';
import { PrismaModule } from '../services/prisma.module';

@Module({
  imports: [
    // Terminus模块用于健康检查
    TerminusModule,
    // HttpModule用于HTTP健康检查
    HttpModule,
    // Prisma模块用于数据库连接检查
    PrismaModule,
  ],
  controllers: [HealthController],
})
export class HealthModule {}
