// src/modules/data-models/controllers/test-data-generator.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TestDataGeneratorService } from '../services/test-data-generator.service';
import {
  TestDataGenerationRequestDto,
  TestDataPreviewRequestDto,
  TestDataTemplateDto,
} from '../dto/test-data-generator.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../auth/guards/permission.guard';
import { CheckPermission } from '../../auth/decorators/check-permission.decorator';

@ApiTags('测试数据生成')
@Controller('data-models/test-data')
@UseGuards(JwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class TestDataGeneratorController {
  constructor(
    private readonly testDataGeneratorService: TestDataGeneratorService,
  ) {}

  @Post('generate')
  @ApiOperation({ summary: '生成测试数据' })
  @ApiResponse({ status: 200, description: '生成成功' })
  @CheckPermission('generate:testData')
  generateTestData(
    @Body() requestDto: TestDataGenerationRequestDto,
    @Request() req,
  ) {
    return this.testDataGeneratorService.generateTestData(
      requestDto,
      req.user.id,
    );
  }

  @Post('preview')
  @ApiOperation({ summary: '预览测试数据' })
  @ApiResponse({ status: 200, description: '预览成功' })
  @CheckPermission('generate:testData')
  previewTestData(@Body() requestDto: TestDataPreviewRequestDto) {
    return this.testDataGeneratorService.previewTestData(requestDto);
  }

  @Post('templates')
  @ApiOperation({ summary: '保存测试数据模板' })
  @ApiResponse({ status: 201, description: '保存成功' })
  @CheckPermission('create:testDataTemplate')
  saveTemplate(@Body() templateDto: TestDataTemplateDto, @Request() req) {
    return this.testDataGeneratorService.saveTestDataTemplate(
      templateDto,
      req.user.id,
    );
  }

  @Get('templates/:tableId')
  @ApiOperation({ summary: '获取表的测试数据模板' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @CheckPermission('read:testDataTemplate')
  getTemplates(@Param('tableId') tableId: string) {
    return this.testDataGeneratorService.getTestDataTemplates(tableId);
  }

  @Get('templates/detail/:id')
  @ApiOperation({ summary: '获取测试数据模板详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @CheckPermission('read:testDataTemplate')
  getTemplate(@Param('id') id: string) {
    return this.testDataGeneratorService.getTestDataTemplate(id);
  }

  @Delete('templates/:id')
  @ApiOperation({ summary: '删除测试数据模板' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @CheckPermission('delete:testDataTemplate')
  deleteTemplate(@Param('id') id: string) {
    return this.testDataGeneratorService.deleteTestDataTemplate(id);
  }
}
