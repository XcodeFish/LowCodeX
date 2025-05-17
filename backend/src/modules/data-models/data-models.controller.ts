import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DataModelsService } from './data-models.service';
import { CreateMetaTableDto } from './dto/create-meta-table.dto';
import { CreateMetaFieldDto } from './dto/create-meta-field.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CheckPermission } from '../auth/decorators/check-permission.decorator';
import { MetaTable } from './entities/meta-table.entity';
import { SkipAuth } from '../auth/decorators/skip-auth.decorator';

@ApiTags('数据模型')
@Controller('data-models')
// TODO: 临时禁用权限检查，完成开发后需要恢复权限控制
@SkipAuth()
// @UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DataModelsController {
  constructor(private readonly dataModelsService: DataModelsService) {}

  @Post('complete')
  @ApiOperation({ summary: '创建完整数据模型' })
  @ApiResponse({ status: 201, description: '创建成功', type: MetaTable })
  // TODO: 临时禁用权限检查，完成开发后需要恢复
  // @CheckPermission('create:data-model')
  async createCompleteModel(
    @Body('model') model: CreateMetaTableDto,
    @Body('fields') fields: CreateMetaFieldDto[],
    @Req() req,
  ) {
    return this.dataModelsService.createCompleteModel(
      model,
      fields,
      req.user?.id || 'system',
    );
  }

  @Put(':tableId/publish')
  @ApiOperation({ summary: '发布数据模型' })
  @ApiResponse({ status: 200, description: '发布成功', type: MetaTable })
  // TODO: 临时禁用权限检查，完成开发后需要恢复
  // @CheckPermission('publish:data-model')
  async publishModel(@Param('tableId') tableId: string, @Req() req) {
    return this.dataModelsService.publishModel(
      tableId,
      req.user?.id || 'system',
    );
  }

  @Post(':tableId/clone')
  @ApiOperation({ summary: '克隆数据模型' })
  @ApiResponse({ status: 201, description: '克隆成功', type: MetaTable })
  // TODO: 临时禁用权限检查，完成开发后需要恢复
  // @CheckPermission('create:data-model')
  async cloneModel(
    @Param('tableId') tableId: string,
    @Body('newName') newName: string,
    @Body('newDisplayName') newDisplayName: string,
    @Req() req,
  ) {
    return this.dataModelsService.cloneModel(
      tableId,
      newName,
      newDisplayName,
      req.user?.id || 'system',
    );
  }

  @Get(':tableId/complete')
  @ApiOperation({ summary: '获取完整数据模型信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  // TODO: 临时禁用权限检查，完成开发后需要恢复
  // @CheckPermission('read:data-model')
  async getCompleteModel(@Param('tableId') tableId: string) {
    return this.dataModelsService.getCompleteModel(tableId);
  }

  @Get(':tableId/export')
  @ApiOperation({ summary: '导出数据模型定义' })
  @ApiResponse({ status: 200, description: '导出成功' })
  // TODO: 临时禁用权限检查，完成开发后需要恢复
  // @CheckPermission('read:data-model')
  async exportModelDefinition(@Param('tableId') tableId: string) {
    return this.dataModelsService.exportModelDefinition(tableId);
  }

  @Post('import')
  @ApiOperation({ summary: '导入数据模型定义' })
  @ApiResponse({ status: 201, description: '导入成功', type: MetaTable })
  // TODO: 临时禁用权限检查，完成开发后需要恢复
  // @CheckPermission('create:data-model')
  async importModelDefinition(
    @Body('definition') definition: any,
    @Body('tenant') tenant: string,
    @Req() req,
  ) {
    return this.dataModelsService.importModelDefinition(
      definition,
      tenant,
      req.user?.id || 'system',
    );
  }
}
