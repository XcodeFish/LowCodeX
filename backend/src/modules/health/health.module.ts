import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { PrismaService } from '../../services/prisma.service';
import { RedisService } from '../../services/redis.service';

@Module({
  controllers: [HealthController],
  providers: [HealthService, PrismaService, RedisService],
  exports: [HealthService],
})
export class HealthModule {}
