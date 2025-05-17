// src/modules/data-models/controllers/visual-designer.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { VisualDesignerService } from '../services/visual-designer.service';
import { VisualDiagramSaveDto } from '../dto/visual-designer.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../auth/guards/permission.guard';
import { CheckPermission } from '../../auth/decorators/check-permission.decorator';
import { SkipAuth } from '../../auth/decorators/skip-auth.decorator';

@ApiTags('模型可视化设计')
@Controller('data-models/visual-designer')
// TODO: 临时禁用权限检查，完成开发后需要恢复权限控制
@SkipAuth()
// @UseGuards(JwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class VisualDesignerController {
  constructor(private readonly visualDesignerService: VisualDesignerService) {}

  @Post('diagrams')
  @ApiOperation({ summary: '保存可视化图表' })
  @ApiResponse({ status: 201, description: '保存成功' })
  // TODO: 临时禁用权限检查，完成开发后需要恢复
  // @CheckPermission('create:visualDiagram')
  saveDiagram(@Body() diagramDto: VisualDiagramSaveDto, @Request() req) {
    return this.visualDesignerService.saveDiagram(
      diagramDto,
      req.user?.id || 'system',
    );
  }

  @Put('diagrams/:id')
  @ApiOperation({ summary: '更新可视化图表' })
  @ApiResponse({ status: 200, description: '更新成功' })
  // TODO: 临时禁用权限检查，完成开发后需要恢复
  // @CheckPermission('update:visualDiagram')
  updateDiagram(
    @Param('id') id: string,
    @Body() diagramDto: VisualDiagramSaveDto,
    @Request() req,
  ) {
    return this.visualDesignerService.updateDiagram(
      id,
      diagramDto,
      req.user?.id || 'system',
    );
  }

  @Get('diagrams')
  @ApiOperation({ summary: '获取所有可视化图表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  // TODO: 临时禁用权限检查，完成开发后需要恢复
  // @CheckPermission('read:visualDiagram')
  getDiagrams() {
    return this.visualDesignerService.getDiagrams();
  }

  @Get('diagrams/:id')
  @ApiOperation({ summary: '获取单个可视化图表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  // TODO: 临时禁用权限检查，完成开发后需要恢复
  // @CheckPermission('read:visualDiagram')
  getDiagram(@Param('id') id: string) {
    return this.visualDesignerService.getDiagram(id);
  }

  @Delete('diagrams/:id')
  @ApiOperation({ summary: '删除可视化图表' })
  @ApiResponse({ status: 200, description: '删除成功' })
  // TODO: 临时禁用权限检查，完成开发后需要恢复
  // @CheckPermission('delete:visualDiagram')
  deleteDiagram(@Param('id') id: string) {
    return this.visualDesignerService.deleteDiagram(id);
  }

  @Post('generate-er-diagram')
  @ApiOperation({ summary: '自动生成ER图' })
  @ApiResponse({ status: 200, description: '生成成功' })
  // TODO: 临时禁用权限检查，完成开发后需要恢复
  // @CheckPermission('read:metaTable')
  generateERDiagram(@Body() { tableIds }: { tableIds: string[] }) {
    return this.visualDesignerService.generateERDiagram(tableIds);
  }
}
