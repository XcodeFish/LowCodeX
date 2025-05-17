import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MetaRelationsService } from '../services/meta-relations.service';
import { CreateMetaRelationDto } from '../dto/create-meta-relation.dto';
import { UpdateMetaRelationDto } from '../dto/meta-relation.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../auth/guards/permission.guard';
import { CheckPermission } from '../../auth/decorators/check-permission.decorator';
import { SkipAuth } from '../../auth/decorators/skip-auth.decorator';

@ApiTags('元数据关系')
@Controller('data-models/relations')
// TODO: 临时禁用权限检查，完成开发后需要恢复权限控制
@SkipAuth()
// @UseGuards(JwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class MetaRelationsController {
  constructor(private readonly metaRelationsService: MetaRelationsService) {}

  @Post()
  @ApiOperation({ summary: '创建元数据关系' })
  @ApiResponse({ status: 201, description: '创建成功' })
  // TODO: 临时禁用权限检查，完成开发后需要恢复
  // @CheckPermission('create:metaRelation')
  create(@Body() createMetaRelationDto: CreateMetaRelationDto, @Request() req) {
    return this.metaRelationsService.create(
      createMetaRelationDto,
      req.user?.id || 'system',
    );
  }

  @Get()
  @ApiOperation({ summary: '获取元数据关系列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  // TODO: 临时禁用权限检查，完成开发后需要恢复
  // @CheckPermission('read:metaRelation')
  findAll(
    @Query('sourceTableId') sourceTableId: string,
    @Query('targetTableId') targetTableId: string,
  ) {
    return this.metaRelationsService.findAll(sourceTableId, targetTableId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个元数据关系' })
  @ApiResponse({ status: 200, description: '获取成功' })
  // TODO: 临时禁用权限检查，完成开发后需要恢复
  // @CheckPermission('read:metaRelation')
  findOne(@Param('id') id: string) {
    return this.metaRelationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新元数据关系' })
  @ApiResponse({ status: 200, description: '更新成功' })
  // TODO: 临时禁用权限检查，完成开发后需要恢复
  // @CheckPermission('update:metaRelation')
  update(
    @Param('id') id: string,
    @Body() updateMetaRelationDto: UpdateMetaRelationDto,
    @Request() req,
  ) {
    return this.metaRelationsService.update(
      id,
      updateMetaRelationDto,
      req.user?.id || 'system',
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除元数据关系' })
  @ApiResponse({ status: 200, description: '删除成功' })
  // TODO: 临时禁用权限检查，完成开发后需要恢复
  // @CheckPermission('delete:metaRelation')
  remove(@Param('id') id: string) {
    return this.metaRelationsService.remove(id);
  }

  @Get('types/all')
  @ApiOperation({ summary: '获取所有关系类型' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getRelationTypes() {
    return this.metaRelationsService.getRelationTypes();
  }
}
