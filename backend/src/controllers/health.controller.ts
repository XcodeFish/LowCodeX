import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../services/prisma.service';
import { RedisService } from '../services/redis.service';

// 定义服务状态接口
interface ServiceStatus {
  status: string;
  message?: string; // 添加可选的message属性
}

@ApiTags('健康检查')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  @ApiOperation({ summary: '检查API服务状态' })
  @Get()
  async check() {
    const result = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        api: { status: 'ok' } as ServiceStatus,
        database: { status: 'unknown' } as ServiceStatus,
        cache: { status: 'unknown' } as ServiceStatus,
      },
      version: process.env.APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };

    // 检查数据库连接
    try {
      await this.prismaService.$queryRaw`SELECT 1`;
      result.services.database = { status: 'ok' };
    } catch (error) {
      result.services.database = {
        status: 'error',
        message: error.message,
      };
      result.status = 'error';
    }

    // 检查Redis连接
    try {
      const redisClient = this.redisService.getClient();
      await redisClient.ping();
      result.services.cache = { status: 'ok' };
    } catch (error) {
      result.services.cache = {
        status: 'error',
        message: error.message,
      };
      result.status = 'error';
    }

    return result;
  }

  @ApiOperation({ summary: '获取详细系统信息' })
  @Get('details')
  async getDetails() {
    return {
      system: {
        platform: process.platform,
        nodeVersion: process.version,
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime(),
      },
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.APP_VERSION || '1.0.0',
    };
  }
}
