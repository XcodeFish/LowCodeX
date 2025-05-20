import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { WorkflowDefinitionService } from '../services/workflow-definition.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import {
  CreateWorkflowDto,
  UpdateWorkflowDto,
  QueryWorkflowDto,
  PublishWorkflowDto,
} from '../dto';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@ApiTags('工作流定义')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workflow-definitions')
export class WorkflowDefinitionController {
  constructor(
    private readonly workflowDefinitionService: WorkflowDefinitionService,
  ) {}

  /**
   * 创建工作流定义
   */
  @ApiOperation({ summary: '创建工作流定义' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @Post()
  async create(
    @Body() createWorkflowDto: CreateWorkflowDto,
    @CurrentUser() user: any,
  ) {
    return this.workflowDefinitionService.create(createWorkflowDto, user);
  }

  /**
   * 获取工作流定义列表
   */
  @ApiOperation({ summary: '获取工作流定义列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @Get()
  async findAll(@Query() query: QueryWorkflowDto, @CurrentUser() user: any) {
    return this.workflowDefinitionService.findAll(query, user);
  }

  /**
   * 获取单个工作流定义
   */
  @ApiOperation({ summary: '获取单个工作流定义' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.workflowDefinitionService.findOne(id, user);
  }

  /**
   * 更新工作流定义
   */
  @ApiOperation({ summary: '更新工作流定义' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateWorkflowDto: UpdateWorkflowDto,
    @CurrentUser() user: any,
  ) {
    return this.workflowDefinitionService.update(id, updateWorkflowDto, user);
  }

  /**
   * 删除工作流定义
   */
  @ApiOperation({ summary: '删除工作流定义' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.workflowDefinitionService.remove(id, user);
  }

  /**
   * 发布工作流定义
   */
  @ApiOperation({ summary: '发布工作流定义' })
  @ApiResponse({ status: 200, description: '发布成功' })
  @Post(':id/publish')
  async publish(
    @Param('id') id: string,
    @Body() publishDto: PublishWorkflowDto,
    @CurrentUser() user: any,
  ) {
    return this.workflowDefinitionService.publish(id, publishDto, user);
  }

  /**
   * 获取工作流定义版本列表
   */
  @ApiOperation({ summary: '获取工作流定义版本列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @Get(':id/versions')
  async getVersions(@Param('id') id: string, @CurrentUser() user: any) {
    return this.workflowDefinitionService.getVersions(id, user);
  }

  /**
   * 验证工作流定义
   */
  @ApiOperation({ summary: '验证工作流定义' })
  @ApiResponse({ status: 200, description: '验证成功' })
  @Post(':id/validate')
  async validate(@Param('id') id: string, @CurrentUser() user: any) {
    return this.workflowDefinitionService.validate(id, user);
  }
}
