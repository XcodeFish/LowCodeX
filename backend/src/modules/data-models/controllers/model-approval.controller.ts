import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
  Put,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ModelApprovalService } from '../services/model-approval.service';
import {
  CreateModelApprovalDto,
  ApproveModelDto,
  ModelApprovalQueryDto,
} from '../dto/model-approval.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../auth/guards/permission.guard';
import { CheckPermission } from '../../auth/decorators/check-permission.decorator';

@ApiTags('模型发布审批')
@Controller('data-models/approvals')
@UseGuards(JwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class ModelApprovalController {
  constructor(private readonly modelApprovalService: ModelApprovalService) {}

  @Post()
  @ApiOperation({ summary: '创建模型发布审批申请' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @CheckPermission('create:modelApproval')
  create(@Body() createDto: CreateModelApprovalDto, @Request() req) {
    return this.modelApprovalService.create(createDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: '获取模型发布审批列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @CheckPermission('read:modelApproval')
  findAll(@Query() query: ModelApprovalQueryDto) {
    return this.modelApprovalService.findAll(
      query.tableId,
      query.status,
      query.requestedBy,
      query.approvedBy,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个模型发布审批详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @CheckPermission('read:modelApproval')
  findOne(@Param('id') id: string) {
    return this.modelApprovalService.findOne(id);
  }

  @Put(':id/approve')
  @ApiOperation({ summary: '审批模型发布申请' })
  @ApiResponse({ status: 200, description: '审批成功' })
  @CheckPermission('approve:modelApproval')
  approve(
    @Param('id') id: string,
    @Body() approveDto: ApproveModelDto,
    @Request() req,
  ) {
    return this.modelApprovalService.approve(id, approveDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '取消模型发布审批申请' })
  @ApiResponse({ status: 200, description: '取消成功' })
  @CheckPermission('cancel:modelApproval')
  cancel(@Param('id') id: string, @Request() req) {
    return this.modelApprovalService.cancel(id, req.user.id);
  }

  @Get('table/:tableId/history')
  @ApiOperation({ summary: '获取模型审批历史' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @CheckPermission('read:modelApproval')
  getApprovalHistory(@Param('tableId') tableId: string) {
    return this.modelApprovalService.getApprovalHistory(tableId);
  }
}
