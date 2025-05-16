// src/modules/data-models/controllers/impact-analysis.controller.ts
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ImpactAnalysisService } from '../services/impact-analysis.service';
import {
  ImpactAnalysisRequestDto,
  ImpactAnalysisResponseDto,
} from '../dto/impact-analysis.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../auth/guards/permission.guard';
import { CheckPermission } from '../../auth/decorators/check-permission.decorator';

@ApiTags('模型变更影响分析')
@Controller('data-models/impact-analysis')
@UseGuards(JwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class ImpactAnalysisController {
  constructor(private readonly impactAnalysisService: ImpactAnalysisService) {}

  @Post()
  @ApiOperation({ summary: '分析模型变更影响' })
  @ApiResponse({
    status: 200,
    description: '分析成功',
    type: ImpactAnalysisResponseDto,
  })
  @CheckPermission('read:metaTable')
  analyzeImpact(
    @Body() requestDto: ImpactAnalysisRequestDto,
  ): Promise<ImpactAnalysisResponseDto> {
    return this.impactAnalysisService.analyzeImpact(requestDto);
  }
}
