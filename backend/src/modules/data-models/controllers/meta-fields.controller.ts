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
import { MetaFieldsService } from '../services/meta-fields.service';
import { CreateMetaFieldDto } from '../dto/create-meta-field.dto';
import { UpdateMetaFieldDto } from '../dto/meta-field.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../auth/guards/permission.guard';
import { CheckPermission } from '../../auth/decorators/check-permission.decorator';

@ApiTags('元数据字段')
@Controller('data-models/fields')
@UseGuards(JwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class MetaFieldsController {
  constructor(private readonly metaFieldsService: MetaFieldsService) {}

  @Post()
  @ApiOperation({ summary: '创建元数据字段' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @CheckPermission('create:metaField')
  create(@Body() createMetaFieldDto: CreateMetaFieldDto, @Request() req) {
    return this.metaFieldsService.create(createMetaFieldDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: '获取元数据字段列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @CheckPermission('read:metaField')
  findAll(@Query('tableId') tableId: string) {
    return this.metaFieldsService.findAll(tableId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个元数据字段' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @CheckPermission('read:metaField')
  findOne(@Param('id') id: string) {
    return this.metaFieldsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新元数据字段' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @CheckPermission('update:metaField')
  update(
    @Param('id') id: string,
    @Body() updateMetaFieldDto: UpdateMetaFieldDto,
    @Request() req,
  ) {
    return this.metaFieldsService.update(id, updateMetaFieldDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除元数据字段' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @CheckPermission('delete:metaField')
  remove(@Param('id') id: string) {
    return this.metaFieldsService.remove(id);
  }

  @Get('types/all')
  @ApiOperation({ summary: '获取所有字段类型' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getFieldTypes() {
    return this.metaFieldsService.getFieldTypes();
  }
}
