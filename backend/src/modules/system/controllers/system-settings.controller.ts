import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { ConfigService, SystemConfig } from '../services/config.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../auth/guards/permission.guard';
import {
  CheckAbility,
  RequirePermission,
} from '../../auth/decorators/check-permission.decorator';
import { Action } from '../../auth/ability.factory';
import { SkipAuth } from '../../auth/decorators/skip-auth.decorator';

@ApiTags('系统设置')
@Controller('system-settings')
export class SystemSettingsController {
  constructor(private readonly configService: ConfigService) {}

  @Get('public')
  @SkipAuth()
  @ApiOperation({ summary: '获取所有公开系统设置' })
  @ApiResponse({
    status: 200,
    description: '返回所有公开系统设置，按分组组织',
  })
  async getPublicSettings() {
    // 只获取公开设置
    return this.configService.getAll(false);
  }

  @Get('group/:group/public')
  @SkipAuth()
  @ApiOperation({ summary: '获取指定分组的公开系统设置' })
  @ApiResponse({
    status: 200,
    description: '返回指定分组的所有公开系统设置',
  })
  async getPublicGroupSettings(@Param('group') group: string) {
    // 只获取公开设置
    return this.configService.getByGroup(group, false);
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission({ action: Action.READ, subject: 'SystemConfig' })
  @ApiOperation({ summary: '获取所有系统设置' })
  @ApiResponse({
    status: 200,
    description: '返回所有系统设置，按分组组织',
  })
  @ApiQuery({
    name: 'includePrivate',
    required: false,
    type: Boolean,
    description: '是否包含私有设置',
  })
  async getAllSettings(@Query('includePrivate') includePrivate?: string) {
    const includePrivateBoolean = includePrivate === 'true';
    return this.configService.getAll(includePrivateBoolean);
  }

  @Get('group/:group')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission({ action: Action.READ, subject: 'SystemConfig' })
  @ApiOperation({ summary: '获取指定分组的系统设置' })
  @ApiResponse({
    status: 200,
    description: '返回指定分组的所有系统设置',
  })
  @ApiQuery({
    name: 'includePrivate',
    required: false,
    type: Boolean,
    description: '是否包含私有设置',
  })
  async getGroupSettings(
    @Param('group') group: string,
    @Query('includePrivate') includePrivate?: string,
  ) {
    const includePrivateBoolean = includePrivate === 'true';
    return this.configService.getByGroup(group, includePrivateBoolean);
  }

  @Get(':key')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission({ action: Action.READ, subject: 'SystemConfig' })
  @ApiOperation({ summary: '获取指定键的系统设置' })
  @ApiResponse({
    status: 200,
    description: '返回指定键的系统设置值',
  })
  async getSetting(@Param('key') key: string) {
    return { key, value: await this.configService.get(key) };
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission({ action: Action.CREATE, subject: 'SystemConfig' })
  @ApiOperation({ summary: '创建或更新系统设置' })
  @ApiResponse({
    status: 200,
    description: '系统设置创建或更新成功',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        key: { type: 'string', description: '设置键名' },
        value: { type: 'object', description: '设置值' },
        description: { type: 'string', description: '设置描述' },
        isPublic: { type: 'boolean', description: '是否公开' },
        group: { type: 'string', description: '设置分组' },
      },
      required: ['key', 'value'],
    },
  })
  async setSetting(
    @Body()
    body: {
      key: string;
      value: any;
      description?: string;
      isPublic?: boolean;
      group?: string;
    },
  ) {
    if (!body.key) {
      throw new BadRequestException('缺少必要的键名');
    }

    // 创建或更新设置
    await this.configService.set(body.key, body.value, {
      description: body.description,
      isPublic: body.isPublic,
      group: body.group,
    });

    return { success: true, message: '系统设置已更新' };
  }

  @Delete(':key')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission({ action: Action.DELETE, subject: 'SystemConfig' })
  @ApiOperation({ summary: '删除系统设置' })
  @ApiResponse({
    status: 200,
    description: '系统设置删除成功',
  })
  async deleteSetting(@Param('key') key: string) {
    const result = await this.configService.delete(key);

    if (!result) {
      throw new BadRequestException('删除系统设置失败');
    }

    return { success: true, message: '系统设置已删除' };
  }

  @Post('cache/clear')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission({ action: Action.UPDATE, subject: 'SystemConfig' })
  @ApiOperation({ summary: '清除系统设置缓存' })
  @ApiResponse({
    status: 200,
    description: '系统设置缓存已清除',
  })
  async clearCache() {
    this.configService.clearCache();
    return { success: true, message: '系统设置缓存已清除' };
  }
}
