import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('健康检查')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: '获取系统健康状态' })
  @ApiResponse({ status: 200, description: '返回系统健康状态详情' })
  async check() {
    return this.healthService.checkHealth();
  }

  @Get('redis')
  @ApiOperation({ summary: '检查Redis连接状态' })
  @ApiResponse({ status: 200, description: '返回Redis健康状态' })
  async checkRedis() {
    return this.healthService.checkRedis();
  }

  @Get('database')
  @ApiOperation({ summary: '检查数据库连接状态' })
  @ApiResponse({ status: 200, description: '返回数据库健康状态' })
  async checkDatabase() {
    return this.healthService.checkDatabase();
  }
}
