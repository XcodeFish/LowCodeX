import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MetaVersionsService } from '../services/meta-versions.service';
import { CreateMetaVersionDto } from '../dto/create-meta-version.dto';
import { VersionHistoryDto } from '../dto/meta-version.dto';
import { UpdateMetaVersionDto } from '../dto/update-meta-version.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../auth/guards/permission.guard';
import { CheckPermission } from '../../auth/decorators/check-permission.decorator';

@ApiTags('元数据版本')
@Controller('data-models/versions')
@UseGuards(JwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class MetaVersionsController {
  constructor(private readonly metaVersionsService: MetaVersionsService) {}

  @Post()
  @ApiOperation({ summary: '创建元数据版本' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @CheckPermission('create:metaVersion')
  create(@Body() createMetaVersionDto: CreateMetaVersionDto, @Request() req) {
    return this.metaVersionsService.create(createMetaVersionDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: '获取元数据版本列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @CheckPermission('read:metaVersion')
  findAll(@Query('tableId') tableId: string) {
    return this.metaVersionsService.findAll(tableId);
  }

  @Get('history')
  @ApiOperation({ summary: '获取版本历史' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @CheckPermission('read:metaVersion')
  getHistory(@Query() query: VersionHistoryDto) {
    const { tableId, publishedOnly, page, pageSize } = query;
    return this.metaVersionsService.findAll(tableId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个元数据版本详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @CheckPermission('read:metaVersion')
  findOne(@Param('id') id: string) {
    return this.metaVersionsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新元数据版本' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @CheckPermission('update:metaVersion')
  update(
    @Param('id') id: string,
    @Body() updateMetaVersionDto: UpdateMetaVersionDto,
    @Request() req,
  ) {
    return this.metaVersionsService.update(
      id,
      updateMetaVersionDto,
      req.user.id,
    );
  }

  @Post(':id/publish')
  @ApiOperation({ summary: '发布版本' })
  @ApiResponse({ status: 200, description: '发布成功' })
  @CheckPermission('update:metaVersion')
  publish(@Param('id') id: string, @Request() req) {
    return this.metaVersionsService.publish(id, req.user.id);
  }

  @Post('compare')
  @ApiOperation({ summary: '比较版本' })
  @ApiResponse({ status: 200, description: '比较成功' })
  @CheckPermission('read:metaVersion')
  compare(
    @Body('oldVersionId') oldVersionId: string,
    @Body('newVersionId') newVersionId: string,
  ) {
    return this.metaVersionsService.compare(oldVersionId, newVersionId);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: '恢复版本' })
  @ApiResponse({ status: 200, description: '恢复成功' })
  @CheckPermission('update:metaVersion')
  restore(@Param('id') id: string) {
    return this.metaVersionsService.restore(id);
  }
}
