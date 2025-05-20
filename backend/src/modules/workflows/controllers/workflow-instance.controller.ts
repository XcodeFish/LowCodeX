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
import { WorkflowInstanceService } from '../services/workflow-instance.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { StartWorkflowDto, QueryInstanceDto } from '../dto';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@ApiTags('工作流实例')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workflow-instances')
export class WorkflowInstanceController {
  constructor(
    private readonly workflowInstanceService: WorkflowInstanceService,
  ) {}

  /**
   * 启动工作流实例
   */
  @ApiOperation({ summary: '启动工作流实例' })
  @ApiResponse({ status: 201, description: '启动成功' })
  @Post()
  async start(
    @Body() startWorkflowDto: StartWorkflowDto,
    @CurrentUser() user: any,
  ) {
    return this.workflowInstanceService.start(startWorkflowDto, user);
  }

  /**
   * 获取工作流实例列表
   */
  @ApiOperation({ summary: '获取工作流实例列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @Get()
  async findAll(@Query() query: QueryInstanceDto, @CurrentUser() user: any) {
    return this.workflowInstanceService.findAll(query, user);
  }

  /**
   * 获取单个工作流实例
   */
  @ApiOperation({ summary: '获取单个工作流实例' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.workflowInstanceService.findOne(id, user);
  }

  /**
   * 暂停工作流实例
   */
  @ApiOperation({ summary: '暂停工作流实例' })
  @ApiResponse({ status: 200, description: '暂停成功' })
  @Put(':id/suspend')
  async suspend(@Param('id') id: string, @CurrentUser() user: any) {
    return this.workflowInstanceService.suspend(id, user);
  }

  /**
   * 恢复工作流实例
   */
  @ApiOperation({ summary: '恢复工作流实例' })
  @ApiResponse({ status: 200, description: '恢复成功' })
  @Put(':id/resume')
  async resume(@Param('id') id: string, @CurrentUser() user: any) {
    return this.workflowInstanceService.resume(id, user);
  }

  /**
   * 终止工作流实例
   */
  @ApiOperation({ summary: '终止工作流实例' })
  @ApiResponse({ status: 200, description: '终止成功' })
  @Put(':id/terminate')
  async terminate(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentUser() user: any,
  ) {
    return this.workflowInstanceService.terminate(id, reason, user);
  }

  /**
   * 获取工作流实例历史
   */
  @ApiOperation({ summary: '获取工作流实例历史' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @Get(':id/history')
  async getHistory(@Param('id') id: string, @CurrentUser() user: any) {
    return this.workflowInstanceService.getHistory(id, user);
  }

  /**
   * 获取工作流实例变量
   */
  @ApiOperation({ summary: '获取工作流实例变量' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @Get(':id/variables')
  async getVariables(@Param('id') id: string, @CurrentUser() user: any) {
    return this.workflowInstanceService.getVariables(id, user);
  }
}
