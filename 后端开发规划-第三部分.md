# LowCodeX 后端开发规划文档 (第三部分)

## 5. 表单管理模块

### 5.1 功能点详细拆解

1. **表单模板管理**
   - 表单模板的创建、更新、删除
   - 模板版本控制
   - 模板分类与标签管理
   - 模板预览功能

2. **表单配置定义**
   - JSON Schema 定义表单结构
   - 表单字段类型与验证规则
   - 表单布局配置
   - 表单逻辑与事件定义

3. **表单数据处理**
   - 表单数据提交与存储
   - 表单数据验证
   - 表单数据版本管理
   - 表单数据查询与导出

4. **表单权限控制**
   - 表单访问权限设置
   - 表单字段级权限控制
   - 表单操作权限管理
   - 数据查看权限控制

5. **表单生命周期管理**
   - 表单状态管理
   - 表单发布与停用
   - 表单升级与迁移
   - 表单数据归档

### 5.2 开发任务与时间安排

| 任务 | 描述 | 时间估计 | 优先级 |
|-----|------|---------|-------|
| 设计表单模型结构 | 定义表单模板和数据的数据结构 | 3天 | P0 |
| 实现表单模板API | 表单模板的CRUD操作 | 4天 | P0 |
| 开发表单验证引擎 | 实现基于JSON Schema的表单验证 | 4天 | P0 |
| 实现表单数据API | 表单数据的提交和查询 | 3天 | P0 |
| 添加表单版本管理 | 实现表单模板版本控制 | 3天 | P1 |
| 开发表单权限控制 | 实现字段级和操作级权限 | 4天 | P1 |
| 实现表单状态流转 | 表单生命周期管理 | 3天 | P2 |
| 开发数据导入导出 | 支持表单数据批量操作 | 3天 | P2 |
| 单元测试 | 测试表单功能 | 3天 | P1 |

### 5.3 核心实体与接口定义

**表单模型实体 (modules/forms/entities/form.entity.ts)**

```typescript
import { Prisma } from '@prisma/client';

export class FormTemplate implements Prisma.FormTemplateUncheckedCreateInput {
  id?: number;
  code: string; // 表单编码，唯一标识
  name: string;
  description?: string;
  schema: string; // JSON Schema格式的表单定义
  uiSchema?: string; // UI展示相关的配置
  dataModelId?: number; // 关联的数据模型ID
  version: number;
  status?: string; // draft, published, deprecated
  categoryId?: number;
  tags?: string; // JSON数组存储标签
  tenantId: number;
  applicationId?: number;
  createdBy: number;
  updatedBy?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  publishedAt?: Date | string;
}

export class FormTemplateVersion implements Prisma.FormTemplateVersionUncheckedCreateInput {
  id?: number;
  templateId: number;
  version: number;
  schema: string;
  uiSchema?: string;
  changelog?: string;
  createdBy: number;
  createdAt?: Date | string;
  publishedAt?: Date | string;
  status: string; // draft, published, deprecated
}

export class FormCategory implements Prisma.FormCategoryUncheckedCreateInput {
  id?: number;
  name: string;
  description?: string;
  parentId?: number;
  tenantId: number;
  createdBy: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export class FormSubmission implements Prisma.FormSubmissionUncheckedCreateInput {
  id?: number;
  formId: number;
  formVersion: number;
  data: string; // JSON格式的表单数据
  status: string; // draft, submitted, approved, rejected
  submittedAt?: Date | string;
  tenantId: number;
  createdBy: number;
  updatedBy?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export class FormPermission implements Prisma.FormPermissionUncheckedCreateInput {
  id?: number;
  formId: number;
  roleId: number;
  permissionType: string; // view, edit, submit, approve, admin
  fieldPermissions?: string; // JSON格式，字段级权限
  tenantId: number;
  createdBy: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
```

**表单控制器 (modules/forms/controllers/form-template.controller.ts)**

```typescript
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
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../auth/guards/permission.guard';
import { CheckPermission } from '../../auth/decorators/check-permission.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../../entities/user.entity';
import { FormTemplateService } from '../services/form-template.service';
import { CreateFormTemplateDto } from '../dto/create-form-template.dto';
import { UpdateFormTemplateDto } from '../dto/update-form-template.dto';
import { QueryFormTemplateDto } from '../dto/query-form-template.dto';
import { PublishFormTemplateDto } from '../dto/publish-form-template.dto';

@ApiTags('表单管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('form-templates')
export class FormTemplateController {
  constructor(private readonly formTemplateService: FormTemplateService) {}

  @ApiOperation({ summary: '创建表单模板' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @CheckPermission('create', 'formTemplate')
  @Post()
  async create(
    @Body() createFormTemplateDto: CreateFormTemplateDto,
    @CurrentUser() user: User,
  ) {
    return this.formTemplateService.create(createFormTemplateDto, user);
  }

  @ApiOperation({ summary: '获取表单模板列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @CheckPermission('read', 'formTemplate')
  @Get()
  async findAll(@Query() query: QueryFormTemplateDto, @CurrentUser() user: User) {
    return this.formTemplateService.findAll(query, user);
  }

  @ApiOperation({ summary: '获取单个表单模板' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @CheckPermission('read', 'formTemplate')
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.formTemplateService.findOne(id, user);
  }

  @ApiOperation({ summary: '更新表单模板' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @CheckPermission('update', 'formTemplate')
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFormTemplateDto: UpdateFormTemplateDto,
    @CurrentUser() user: User,
  ) {
    return this.formTemplateService.update(id, updateFormTemplateDto, user);
  }

  @ApiOperation({ summary: '删除表单模板' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @CheckPermission('delete', 'formTemplate')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.formTemplateService.remove(id, user);
  }

  @ApiOperation({ summary: '发布表单模板' })
  @ApiResponse({ status: 200, description: '发布成功' })
  @CheckPermission('publish', 'formTemplate')
  @Post(':id/publish')
  async publish(
    @Param('id', ParseIntPipe) id: number,
    @Body() publishDto: PublishFormTemplateDto,
    @CurrentUser() user: User,
  ) {
    return this.formTemplateService.publish(id, publishDto, user);
  }

  @ApiOperation({ summary: '复制表单模板' })
  @ApiResponse({ status: 201, description: '复制成功' })
  @CheckPermission('create', 'formTemplate')
  @Post(':id/duplicate')
  async duplicate(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.formTemplateService.duplicate(id, user);
  }

  @ApiOperation({ summary: '预览表单模板' })
  @ApiResponse({ status: 200, description: '预览成功' })
  @CheckPermission('read', 'formTemplate')
  @Get(':id/preview')
  async preview(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.formTemplateService.getPreviewData(id, user);
  }

  @ApiOperation({ summary: '获取表单模板版本列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @CheckPermission('read', 'formTemplate')
  @Get(':id/versions')
  async getVersions(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.formTemplateService.getVersions(id, user);
  }

  @ApiOperation({ summary: '比较表单模板版本' })
  @ApiResponse({ status: 200, description: '比较成功' })
  @CheckPermission('read', 'formTemplate')
  @Get(':id/versions/compare')
  async compareVersions(
    @Param('id', ParseIntPipe) id: number,
    @Query('version1') version1: number,
    @Query('version2') version2: number,
    @CurrentUser() user: User,
  ) {
    return this.formTemplateService.compareVersions(id, version1, version2, user);
  }
}
```

**表单提交控制器 (modules/forms/controllers/form-submission.controller.ts)**

```typescript
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
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../auth/guards/permission.guard';
import { CheckPermission } from '../../auth/decorators/check-permission.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../../entities/user.entity';
import { FormSubmissionService } from '../services/form-submission.service';
import { CreateFormSubmissionDto } from '../dto/create-form-submission.dto';
import { UpdateFormSubmissionDto } from '../dto/update-form-submission.dto';
import { QueryFormSubmissionDto } from '../dto/query-form-submission.dto';

@ApiTags('表单提交')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('form-submissions')
export class FormSubmissionController {
  constructor(private readonly formSubmissionService: FormSubmissionService) {}

  @ApiOperation({ summary: '提交表单数据' })
  @ApiResponse({ status: 201, description: '提交成功' })
  @CheckPermission('submit', 'form')
  @Post()
  async create(
    @Body() createFormSubmissionDto: CreateFormSubmissionDto,
    @CurrentUser() user: User,
  ) {
    return this.formSubmissionService.create(createFormSubmissionDto, user);
  }

  @ApiOperation({ summary: '获取表单提交列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @CheckPermission('read', 'formSubmission')
  @Get()
  async findAll(@Query() query: QueryFormSubmissionDto, @CurrentUser() user: User) {
    return this.formSubmissionService.findAll(query, user);
  }

  @ApiOperation({ summary: '获取单个表单提交' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @CheckPermission('read', 'formSubmission')
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.formSubmissionService.findOne(id, user);
  }

  @ApiOperation({ summary: '更新表单提交' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @CheckPermission('update', 'formSubmission')
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFormSubmissionDto: UpdateFormSubmissionDto,
    @CurrentUser() user: User,
  ) {
    return this.formSubmissionService.update(id, updateFormSubmissionDto, user);
  }

  @ApiOperation({ summary: '删除表单提交' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @CheckPermission('delete', 'formSubmission')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.formSubmissionService.remove(id, user);
  }

  @ApiOperation({ summary: '改变表单提交状态' })
  @ApiResponse({ status: 200, description: '状态变更成功' })
  @CheckPermission('update', 'formSubmission')
  @Put(':id/status')
  async changeStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
    @Body('comment') comment: string,
    @CurrentUser() user: User,
  ) {
    return this.formSubmissionService.changeStatus(id, status, comment, user);
  }

  @ApiOperation({ summary: '获取表单提交历史' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @CheckPermission('read', 'formSubmission')
  @Get(':id/history')
  async getHistory(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.formSubmissionService.getHistory(id, user);
  }

  @ApiOperation({ summary: '导出表单提交数据' })
  @ApiResponse({ status: 200, description: '导出成功' })
  @CheckPermission('export', 'formSubmission')
  @Get('export')
  async exportData(@Query() query: QueryFormSubmissionDto, @CurrentUser() user: User) {
    return this.formSubmissionService.exportData(query, user);
  }
}
```

**表单验证服务 (modules/forms/services/form-validation.service.ts)**

```typescript
import { Injectable, BadRequestException } from '@nestjs/common';
import * as Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { FormTemplateService } from './form-template.service';

@Injectable()
export class FormValidationService {
  private ajv: Ajv;

  constructor(private readonly formTemplateService: FormTemplateService) {
    this.ajv = new Ajv({
      allErrors: true,
      verbose: true,
      $data: true,
    });
    addFormats(this.ajv);

    // 添加自定义格式和关键字
    this.setupCustomValidations();
  }

  /**
   * 验证表单数据
   */
  async validateFormData(formId: number, data: any, user: any) {
    // 获取表单模板
    const formTemplate = await this.formTemplateService.findOne(formId, user);
    if (!formTemplate) {
      throw new BadRequestException(`表单模板 ${formId} 不存在`);
    }

    try {
      // 解析schema
      const schema = JSON.parse(formTemplate.schema);

      // 创建验证函数
      const validate = this.ajv.compile(schema);

      // 验证数据
      const valid = validate(data);

      if (!valid) {
        // 格式化错误信息
        const errors = this.formatValidationErrors(validate.errors);
        throw new BadRequestException({
          message: '表单数据验证失败',
          errors,
        });
      }

      return { valid: true };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`表单验证失败: ${error.message}`);
    }
  }

  /**
   * 验证表单schema
   */
  validateFormSchema(schema: any) {
    try {
      // 验证schema是否为有效的JSON Schema
      const jsonSchema = require('ajv/lib/refs/json-schema-draft-07.json');
      const validate = this.ajv.compile(jsonSchema);

      const valid = validate(schema);

      if (!valid) {
        // 格式化错误信息
        const errors = this.formatValidationErrors(validate.errors);
        throw new BadRequestException({
          message: '表单Schema验证失败',
          errors,
        });
      }

      return { valid: true };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Schema验证失败: ${error.message}`);
    }
  }

  /**
   * 格式化验证错误信息
   */
  private formatValidationErrors(errors: any[]) {
    return errors.map(error => {
      const path = error.instancePath || '';
      const fieldName = path.replace(/^\//, '') || '(root)';

      let message = error.message || '验证失败';

      // 添加额外的错误信息
      if (error.keyword === 'required') {
        const missingProperty = error.params.missingProperty;
        message = `缺少必填字段: ${missingProperty}`;
      } else if (error.keyword === 'enum') {
        const allowedValues = error.params.allowedValues;
        message = `值必须是以下选项之一: ${allowedValues.join(', ')}`;
      }

      return {
        field: fieldName,
        message,
        keyword: error.keyword,
        params: error.params,
      };
    });
  }

  /**
   * 设置自定义验证规则
   */
  private setupCustomValidations() {
    // 添加中国手机号格式
    this.ajv.addFormat('china-phone', /^1[3-9]\d{9}$/);

    // 添加中国身份证号格式
    this.ajv.addFormat('china-id', /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/);

    // 添加自定义关键字: 依赖字段条件验证
    this.ajv.addKeyword({
      keyword: 'dependentRequired',
      type: 'object',
      validate: (
        schema: Record<string, string[]>,
        data: Record<string, any>,
      ) => {
        for (const [prop, deps] of Object.entries(schema)) {
          if (data[prop] !== undefined) {
            for (const dep of deps) {
              if (data[dep] === undefined) {
                return false;
              }
            }
          }
        }
        return true;
      },
      error: {
        message: '依赖字段不能为空',
      },
    });

    // 添加自定义关键字: 字段比较
    this.ajv.addKeyword({
      keyword: 'compareFields',
      type: 'object',
      validate: (
        schema: Record<string, { fields: [string, string]; operator: string }>,
        data: Record<string, any>,
      ) => {
        for (const [key, rule] of Object.entries(schema)) {
          const [field1, field2] = rule.fields;
          const operator = rule.operator;

          if (data[field1] === undefined || data[field2] === undefined) {
            continue;
          }

          const val1 = data[field1];
          const val2 = data[field2];

          switch (operator) {
            case 'eq':
              if (val1 !== val2) return false;
              break;
            case 'ne':
              if (val1 === val2) return false;
              break;
            case 'gt':
              if (val1 <= val2) return false;
              break;
            case 'gte':
              if (val1 < val2) return false;
              break;
            case 'lt':
              if (val1 >= val2) return false;
              break;
            case 'lte':
              if (val1 > val2) return false;
              break;
          }
        }
        return true;
      },
      error: {
        message: '字段比较验证失败',
      },
    });
  }
}
```

### 5.4 Cursor提示词

```
创建表单管理模块，实现动态表单的定义和提交处理。

1. 设置表单相关的Prisma模型，包括FormTemplate、FormSubmission等
2. 实现FormTemplateService，提供表单模板管理功能
3. 开发FormTemplateController，暴露表单模板管理API
4. 创建FormSubmissionService，处理表单数据提交和查询
5. 实现FormValidationService，验证表单数据符合定义规则
6. 添加FormPermissionService，管理表单访问和操作权限
7. 开发FormCategoryController，管理表单分类
8. 实现FormExportService，支持表单数据导出
9. 创建表单历史记录功能，跟踪表单数据变更
```
