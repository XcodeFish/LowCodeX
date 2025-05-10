import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';
import { RedisService } from '../../services/redis.service';

export interface HealthCheckResult {
  status: 'up' | 'down';
  timestamp: string;
  details: {
    [key: string]: {
      status: 'up' | 'down';
      responseTime?: number;
      error?: string;
    };
  };
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async checkHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const [dbStatus, redisStatus] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
    ]);

    const status =
      dbStatus.details.database.status === 'up' &&
      redisStatus.details.redis.status === 'up'
        ? 'up'
        : 'down';

    return {
      status,
      timestamp: new Date().toISOString(),
      details: {
        ...dbStatus.details,
        ...redisStatus.details,
        system: {
          status: 'up',
          responseTime: Date.now() - startTime,
        },
      },
    };
  }

  async checkDatabase(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    let status: 'up' | 'down' = 'down';
    let error: string | undefined;

    try {
      // 执行简单查询检查数据库连接
      await this.prismaService.$queryRaw`SELECT 1`;
      status = 'up';
    } catch (err) {
      error = err.message;
      this.logger.error(`数据库健康检查失败: ${err.message}`, err.stack);
    }

    const responseTime = Date.now() - startTime;

    return {
      status,
      timestamp: new Date().toISOString(),
      details: {
        database: {
          status,
          responseTime,
          ...(error && { error }),
        },
      },
    };
  }

  async checkRedis(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    let status: 'up' | 'down' = 'down';
    let error: string | undefined;

    try {
      const client = this.redisService.getClient();
      await client.ping();
      status = 'up';
    } catch (err) {
      error = err.message;
      this.logger.error(`Redis健康检查失败: ${err.message}`, err.stack);
    }

    const responseTime = Date.now() - startTime;

    return {
      status,
      timestamp: new Date().toISOString(),
      details: {
        redis: {
          status,
          responseTime,
          ...(error && { error }),
        },
      },
    };
  }
}
