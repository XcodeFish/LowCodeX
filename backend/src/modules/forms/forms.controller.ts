import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { FormsService } from './forms.service';
import { CreateFormDto, UpdateFormDto, FormQueryDto } from './dto/forms.dto';

@ApiTags('表单管理')
@Controller('forms')
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  /**
   * 创建表单模板
   */
  @Post('template')
  @ApiOperation({ summary: '创建表单模板' })
  @ApiResponse({ status: 201, description: '表单模板创建成功' })
  async createFormTemplate(@Body() dto: CreateFormDto) {
    return this.formsService.createFormTemplate(dto);
  }

  /**
   * 获取表单模板列表（支持分页、状态、关键字搜索）
   */
  @Get('template')
  @ApiOperation({ summary: '获取表单模板列表' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'keyword', required: false, type: String })
  async getFormTemplates(@Query() query: FormQueryDto) {
    return this.formsService.getFormTemplates(query);
  }

  /**
   * 获取单个表单模板详情
   */
  @Get('template/:id')
  @ApiOperation({ summary: '获取表单模板详情' })
  @ApiParam({ name: 'id', description: '表单模板ID' })
  async getFormTemplate(@Param('id') id: string) {
    return this.formsService.getFormTemplate(id);
  }

  /**
   * 更新表单模板
   */
  @Put('template/:id')
  @ApiOperation({ summary: '更新表单模板' })
  @ApiParam({ name: 'id', description: '表单模板ID' })
  async updateFormTemplate(
    @Param('id') id: string,
    @Body() dto: UpdateFormDto,
  ) {
    return this.formsService.updateFormTemplate(id, dto);
  }

  /**
   * 删除表单模板
   */
  @Delete('template/:id')
  @ApiOperation({ summary: '删除表单模板' })
  @ApiParam({ name: 'id', description: '表单模板ID' })
  async deleteFormTemplate(@Param('id') id: string) {
    return this.formsService.deleteFormTemplate(id);
  }

  /**
   * 发布表单模板
   */
  @Post('template/:id/publish')
  @ApiOperation({ summary: '发布表单模板' })
  @ApiParam({ name: 'id', description: '表单模板ID' })
  async publishForm(@Param('id') id: string) {
    return this.formsService.publishForm(id);
  }

  /**
   * 归档表单模板
   */
  @Post('template/:id/archive')
  @ApiOperation({ summary: '归档表单模板' })
  @ApiParam({ name: 'id', description: '表单模板ID' })
  async archiveForm(@Param('id') id: string) {
    return this.formsService.archiveForm(id);
  }

  /**
   * 归档表单数据
   */
  @Post('data/:id/archive')
  @ApiOperation({ summary: '归档表单数据' })
  @ApiParam({ name: 'id', description: '表单数据ID' })
  async archiveFormData(@Param('id') id: string) {
    return this.formsService.archiveFormData(id);
  }

  /**
   * 提交表单数据
   */
  @Post('data/:formId')
  @ApiOperation({ summary: '提交表单数据' })
  @ApiParam({ name: 'formId', description: '表单模板ID' })
  async submitFormData(@Param('formId') formId: string, @Body() data: any) {
    return this.formsService.submitFormData(formId, data);
  }

  /**
   * 获取表单数据列表
   */
  @Get('data/:formId')
  @ApiOperation({ summary: '获取表单数据列表' })
  @ApiParam({ name: 'formId', description: '表单模板ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  async getFormData(@Param('formId') formId: string, @Query() query: any) {
    return this.formsService.getFormData(formId, query);
  }
}
