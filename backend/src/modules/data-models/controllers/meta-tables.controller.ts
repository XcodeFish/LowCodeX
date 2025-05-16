import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MetaTablesService } from '../services/meta-tables.service';
import { CreateMetaTableDto } from '../dto/create-meta-table.dto';
import { UpdateMetaTableDto } from '../dto/meta-table.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../auth/guards/permission.guard';
import { CheckPermission } from '../../auth/decorators/check-permission.decorator';
@ApiTags('元数据表')
@Controller('data-models/tables')
@UseGuards(JwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class MetaTablesController {
  constructor(private readonly metaTablesService: MetaTablesService) {}

  @Post()
  @ApiOperation({ summary: '创建元数据表' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @CheckPermission('create:metaTable')
  create(@Body() createMetaTableDto: CreateMetaTableDto, @Request() req) {
    return this.metaTablesService.create(createMetaTableDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: '获取所有元数据表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @CheckPermission('read:metaTable')
  findAll(
    @Query('tenant') tenant: string,
    @Query('application') application: string,
  ) {
    return this.metaTablesService.findAll(tenant, application);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个元数据表详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @CheckPermission('read:metaTable')
  findOne(@Param('id') id: string) {
    return this.metaTablesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新元数据表' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @CheckPermission('update:metaTable')
  update(
    @Param('id') id: string,
    @Body() updateMetaTableDto: UpdateMetaTableDto,
    @Request() req,
  ) {
    return this.metaTablesService.update(id, updateMetaTableDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除元数据表' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @CheckPermission('delete:metaTable')
  remove(@Param('id') id: string) {
    return this.metaTablesService.remove(id);
  }
}
