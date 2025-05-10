import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AuditLogService } from '../services/audit-log.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../auth/guards/permission.guard';
import {
  CheckAbility,
  RequirePermission,
} from '../../auth/decorators/check-permission.decorator';
import { Action } from '../../auth/ability.factory';

@ApiTags('审计日志')
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @RequirePermission({ action: Action.READ, subject: 'AuditLog' })
  @ApiOperation({ summary: '获取审计日志列表' })
  @ApiResponse({
    status: 200,
    description: '返回审计日志列表和分页信息',
  })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'tenantId', required: false, type: String })
  @ApiQuery({ name: 'action', required: false, type: String })
  @ApiQuery({ name: 'resource', required: false, type: String })
  @ApiQuery({ name: 'resourceId', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    description: '跳过的记录数，用于分页',
  })
  @ApiQuery({
    name: 'take',
    required: false,
    type: Number,
    description: '获取的记录数，用于分页',
  })
  async findAll(
    @Query('userId') userId?: string,
    @Query('tenantId') tenantId?: string,
    @Query('action') action?: string,
    @Query('resource') resource?: string,
    @Query('resourceId') resourceId?: string,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.auditLogService.findAll({
      userId,
      tenantId,
      action,
      resource,
      resourceId,
      startDate,
      endDate,
      skip: skip ? parseInt(skip.toString(), 10) : undefined,
      take: take ? parseInt(take.toString(), 10) : undefined,
    });
  }
}
