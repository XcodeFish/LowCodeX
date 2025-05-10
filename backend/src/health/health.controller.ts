import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  HealthCheckService,
  HealthCheck,
  PrismaHealthIndicator,
  DiskHealthIndicator,
  MemoryHealthIndicator,
  HealthCheckResult,
} from '@nestjs/terminus';
import { PrismaService } from '../services/prisma.service';
import { SkipAuth } from '../modules/auth/decorators/skip-auth.decorator';

@ApiTags('健康检查')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealthIndicator: PrismaHealthIndicator,
    private diskHealthIndicator: DiskHealthIndicator,
    private memoryHealthIndicator: MemoryHealthIndicator,
    private prismaService: PrismaService,
  ) {}

  @Get()
  @SkipAuth()
  @HealthCheck()
  @ApiOperation({ summary: '系统健康检查' })
  @ApiResponse({
    status: 200,
    description: '系统健康状态',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string' },
        info: { type: 'object' },
        error: { type: 'object' },
        details: { type: 'object' },
      },
    },
  })
  check(): Promise<HealthCheckResult> {
    return this.health.check([
      // 检查数据库连接
      async () =>
        this.prismaHealthIndicator.pingCheck('database', this.prismaService),

      // 检查磁盘空间
      async () =>
        this.diskHealthIndicator.checkStorage('disk', {
          thresholdPercent: 0.9, // 当使用超过90%时报警
          path: '/',
        }),

      // 检查内存使用
      async () => this.memoryHealthIndicator.checkHeap('memory_heap', 0.8), // 当使用超过80%时报警

      // 检查内存RSS
      async () => this.memoryHealthIndicator.checkRSS('memory_rss', 0.8), // 当使用超过80%时报警
    ]);
  }
}
