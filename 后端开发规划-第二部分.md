# LowCodeX 后端开发规划文档 (第二部分)

## 4. 数据模型管理模块

### 4.1 功能点详细拆解

1. **元数据模型定义**
   - 元表管理（表名、描述等）
   - 元字段管理（字段名、类型、约束等）
   - 索引和关系管理
   - 元数据版本控制

2. **动态实体服务**
   - 动态创建数据表
   - 动态生成Prisma模型
   - 数据表迁移管理
   - 实体关系处理

3. **数据验证规则**
   - 字段级验证规则
   - 表级验证规则
   - 自定义验证器支持
   - 验证规则执行

4. **模型版本管理**
   - 版本创建与发布
   - 版本差异比较
   - 版本回滚功能
   - 变更记录生成

5. **数据管理API**
   - 动态CRUD操作
   - 批量操作支持
   - 条件查询构建
   - 数据导入导出

### 4.2 开发任务与时间安排

| 任务 | 描述 | 时间估计 | 优先级 |
|-----|------|---------|-------|
| 设计元数据模型 | 确定元表和元字段的数据结构 | 3天 | P0 |
| 实现元数据API | 元数据的CRUD操作 | 4天 | P0 |
| 开发动态表生成器 | 通过元数据创建物理表 | 5天 | P0 |
| 实现动态实体服务 | 动态操作数据的服务层 | 5天 | P0 |
| 添加数据验证框架 | 验证规则解析和执行 | 4天 | P1 |
| 开发模型版本管理 | 版本创建和比较功能 | 4天 | P1 |
| 实现批量数据操作 | 支持大量数据的导入导出 | 3天 | P2 |
| 添加数据关系处理 | 处理表间复杂关系 | 4天 | P2 |
| 单元测试 | 测试动态模型功能 | 3天 | P1 |

### 4.3 核心实体与接口定义

**元数据模型 (modules/data-models/entities/meta-model.entity.ts)**

```typescript
import { Prisma } from '@prisma/client';

export class MetaTable implements Prisma.MetaTableUncheckedCreateInput {
  id?: number;
  name: string; // 技术名称，用于数据库表名
  displayName: string; // 显示名称，用于UI显示
  description?: string;
  tenantId: number;
  applicationId?: number;
  isSystem?: boolean; // 是否系统表，系统表不可删除
  version: number;
  status?: string; // draft, published
  createdBy: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  publishedAt?: Date | string;

  // 关联字段
  fields?: MetaField[];
  indexes?: MetaIndex[];
}

export enum FieldType {
  STRING = 'string',
  TEXT = 'text',
  INTEGER = 'integer',
  FLOAT = 'float',
  DECIMAL = 'decimal',
  BOOLEAN = 'boolean',
  DATE = 'date',
  DATETIME = 'datetime',
  TIME = 'time',
  ENUM = 'enum',
  JSON = 'json',
  UUID = 'uuid',
  REFERENCE = 'reference' // 引用其他表
}

export class MetaField implements Prisma.MetaFieldUncheckedCreateInput {
  id?: number;
  tableId: number;
  name: string; // 技术名称，用于数据库字段名
  displayName: string; // 显示名称，用于UI显示
  description?: string;
  type: string; // FieldType的字符串值
  length?: number; // 字符串长度
  precision?: number; // 数值精度
  scale?: number; // 数值小数位
  nullable: boolean;
  defaultValue?: string; // JSON格式存储默认值
  isPrimaryKey?: boolean;
  isUnique?: boolean;
  isSystem?: boolean; // 系统字段不可修改
  enumValues?: string; // JSON数组存储枚举值
  referenceTableId?: number; // 引用的表ID
  referenceFieldId?: number; // 引用的字段ID
  validationRules?: string; // JSON格式存储验证规则
  order: number; // 字段顺序
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export class MetaIndex implements Prisma.MetaIndexUncheckedCreateInput {
  id?: number;
  tableId: number;
  name: string;
  type: string; // 'unique', 'index', 'fulltext'
  fields: string; // JSON数组存储字段ID
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export class MetaRelation implements Prisma.MetaRelationUncheckedCreateInput {
  id?: number;
  name: string;
  sourceTableId: number;
  targetTableId: number;
  type: string; // 'oneToOne', 'oneToMany', 'manyToMany'
  sourceFieldId: number;
  targetFieldId: number;
  junctionTableId?: number; // 多对多关系的中间表
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export class MetaTableVersion implements Prisma.MetaTableVersionUncheckedCreateInput {
  id?: number;
  tableId: number;
  version: number;
  data: string; // JSON格式存储表的完整数据
  changes?: string; // JSON格式存储与上一版本的变更
  createdBy: number;
  createdAt?: Date | string;
  publishedAt?: Date | string;
  status: string; // 'draft', 'published', 'deprecated'
}
```

**数据模型控制器 (modules/data-models/controllers/meta-table.controller.ts)**

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
import { MetaTableService } from '../services/meta-table.service';
import { CreateMetaTableDto } from '../dto/create-meta-table.dto';
import { UpdateMetaTableDto } from '../dto/update-meta-table.dto';
import { QueryMetaTableDto } from '../dto/query-meta-table.dto';
import { PublishMetaTableDto } from '../dto/publish-meta-table.dto';

@ApiTags('数据模型')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('meta-tables')
export class MetaTableController {
  constructor(private readonly metaTableService: MetaTableService) {}

  @ApiOperation({ summary: '创建数据模型' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @CheckPermission('create', 'metaTable')
  @Post()
  async create(
    @Body() createMetaTableDto: CreateMetaTableDto,
    @CurrentUser() user: User,
  ) {
    return this.metaTableService.create(createMetaTableDto, user);
  }

  @ApiOperation({ summary: '获取数据模型列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @CheckPermission('read', 'metaTable')
  @Get()
  async findAll(@Query() query: QueryMetaTableDto, @CurrentUser() user: User) {
    return this.metaTableService.findAll(query, user);
  }

  @ApiOperation({ summary: '获取单个数据模型' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @CheckPermission('read', 'metaTable')
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.metaTableService.findOne(id, user);
  }

  @ApiOperation({ summary: '更新数据模型' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @CheckPermission('update', 'metaTable')
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMetaTableDto: UpdateMetaTableDto,
    @CurrentUser() user: User,
  ) {
    return this.metaTableService.update(id, updateMetaTableDto, user);
  }

  @ApiOperation({ summary: '删除数据模型' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @CheckPermission('delete', 'metaTable')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.metaTableService.remove(id, user);
  }

  @ApiOperation({ summary: '发布数据模型' })
  @ApiResponse({ status: 200, description: '发布成功' })
  @CheckPermission('publish', 'metaTable')
  @Post(':id/publish')
  async publish(
    @Param('id', ParseIntPipe) id: number,
    @Body() publishDto: PublishMetaTableDto,
    @CurrentUser() user: User,
  ) {
    return this.metaTableService.publish(id, publishDto, user);
  }

  @ApiOperation({ summary: '复制数据模型' })
  @ApiResponse({ status: 201, description: '复制成功' })
  @CheckPermission('create', 'metaTable')
  @Post(':id/duplicate')
  async duplicate(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.metaTableService.duplicate(id, user);
  }

  @ApiOperation({ summary: '获取数据模型版本列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @CheckPermission('read', 'metaTable')
  @Get(':id/versions')
  async getVersions(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.metaTableService.getVersions(id, user);
  }

  @ApiOperation({ summary: '比较数据模型版本' })
  @ApiResponse({ status: 200, description: '比较成功' })
  @CheckPermission('read', 'metaTable')
  @Get(':id/versions/compare')
  async compareVersions(
    @Param('id', ParseIntPipe) id: number,
    @Query('version1') version1: number,
    @Query('version2') version2: number,
    @CurrentUser() user: User,
  ) {
    return this.metaTableService.compareVersions(id, version1, version2, user);
  }
}
```

**动态实体服务 (modules/data-models/services/dynamic-entity.service.ts)**

```typescript
import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../services/prisma.service';
import { MetaTableService } from './meta-table.service';
import { FieldType } from '../entities/meta-model.entity';
import { User } from '../../../entities/user.entity';

@Injectable()
export class DynamicEntityService {
  private readonly logger = new Logger(DynamicEntityService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly metaTableService: MetaTableService,
  ) {}

  /**
   * 根据表名创建记录
   */
  async create(tableName: string, data: any, user: User) {
    // 获取表元数据
    const metaTable = await this.metaTableService.findByName(tableName, user);
    if (!metaTable) {
      throw new NotFoundException(`表 ${tableName} 不存在`);
    }

    // 验证数据
    await this.validateData(metaTable, data);

    // 处理转换数据类型
    const processedData = await this.processData(metaTable, data, 'create');

    // 添加租户ID
    if (!processedData.tenantId && user.tenantId) {
      processedData.tenantId = user.tenantId;
    }

    // 记录创建者
    if (!processedData.createdBy) {
      processedData.createdBy = user.id;
    }

    // 执行创建操作
    try {
      // 动态执行Prisma操作
      const result = await (this.prisma as any)[tableName].create({
        data: processedData,
      });

      return result;
    } catch (error) {
      this.logger.error(`创建${tableName}记录失败: ${error.message}`, error.stack);
      throw new BadRequestException(`创建记录失败: ${error.message}`);
    }
  }

  /**
   * 根据表名查询记录列表
   */
  async findAll(
    tableName: string,
    query: {
      skip?: number;
      take?: number;
      orderBy?: string;
      orderDirection?: 'asc' | 'desc';
      filter?: Record<string, any>;
    },
    user: User,
  ) {
    // 获取表元数据
    const metaTable = await this.metaTableService.findByName(tableName, user);
    if (!metaTable) {
      throw new NotFoundException(`表 ${tableName} 不存在`);
    }

    // 构建查询参数
    const params: any = {
      where: {},
    };

    // 处理分页
    if (query.skip !== undefined) {
      params.skip = query.skip;
    }
    if (query.take !== undefined) {
      params.take = query.take;
    }

    // 处理排序
    if (query.orderBy) {
      params.orderBy = {
        [query.orderBy]: query.orderDirection || 'asc',
      };
    }

    // 处理过滤条件
    if (query.filter) {
      params.where = this.buildFilterCondition(metaTable, query.filter);
    }

    // 添加租户过滤
    if (user.tenantId && metaTable.fields.some(f => f.name === 'tenantId')) {
      params.where.tenantId = user.tenantId;
    }

    // 执行查询
    try {
      // 获取总数
      const total = await (this.prisma as any)[tableName].count({
        where: params.where,
      });

      // 获取记录列表
      const items = await (this.prisma as any)[tableName].findMany(params);

      return {
        items,
        total,
        skip: query.skip || 0,
        take: query.take,
      };
    } catch (error) {
      this.logger.error(`查询${tableName}记录失败: ${error.message}`, error.stack);
      throw new BadRequestException(`查询记录失败: ${error.message}`);
    }
  }

  /**
   * 根据表名和ID查询单条记录
   */
  async findOne(tableName: string, id: number | string, user: User) {
    // 获取表元数据
    const metaTable = await this.metaTableService.findByName(tableName, user);
    if (!metaTable) {
      throw new NotFoundException(`表 ${tableName} 不存在`);
    }

    // 查询条件
    const where: any = { id };

    // 添加租户过滤
    if (user.tenantId && metaTable.fields.some(f => f.name === 'tenantId')) {
      where.tenantId = user.tenantId;
    }

    // 执行查询
    try {
      const result = await (this.prisma as any)[tableName].findFirst({
        where,
      });

      if (!result) {
        throw new NotFoundException(`ID为${id}的记录不存在`);
      }

      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`查询${tableName}记录失败: ${error.message}`, error.stack);
      throw new BadRequestException(`查询记录失败: ${error.message}`);
    }
  }

  /**
   * 根据表名和ID更新记录
   */
  async update(tableName: string, id: number | string, data: any, user: User) {
    // 获取表元数据
    const metaTable = await this.metaTableService.findByName(tableName, user);
    if (!metaTable) {
      throw new NotFoundException(`表 ${tableName} 不存在`);
    }

    // 验证记录是否存在
    await this.findOne(tableName, id, user);

    // 验证数据
    await this.validateData(metaTable, data, 'update');

    // 处理转换数据类型
    const processedData = await this.processData(metaTable, data, 'update');

    // 记录更新者
    if (!processedData.updatedBy) {
      processedData.updatedBy = user.id;
    }

    // 执行更新操作
    try {
      const result = await (this.prisma as any)[tableName].update({
        where: { id },
        data: processedData,
      });

      return result;
    } catch (error) {
      this.logger.error(`更新${tableName}记录失败: ${error.message}`, error.stack);
      throw new BadRequestException(`更新记录失败: ${error.message}`);
    }
  }

  /**
   * 根据表名和ID删除记录
   */
  async remove(tableName: string, id: number | string, user: User) {
    // 获取表元数据
    const metaTable = await this.metaTableService.findByName(tableName, user);
    if (!metaTable) {
      throw new NotFoundException(`表 ${tableName} 不存在`);
    }

    // 验证记录是否存在
    await this.findOne(tableName, id, user);

    // 执行删除操作
    try {
      await (this.prisma as any)[tableName].delete({
        where: { id },
      });

      return { success: true, message: '删除成功' };
    } catch (error) {
      this.logger.error(`删除${tableName}记录失败: ${error.message}`, error.stack);
      throw new BadRequestException(`删除记录失败: ${error.message}`);
    }
  }

  /**
   * 批量创建记录
   */
  async bulkCreate(tableName: string, dataList: any[], user: User) {
    if (!Array.isArray(dataList) || dataList.length === 0) {
      throw new BadRequestException('数据必须是非空数组');
    }

    // 获取表元数据
    const metaTable = await this.metaTableService.findByName(tableName, user);
    if (!metaTable) {
      throw new NotFoundException(`表 ${tableName} 不存在`);
    }

    // 处理数据
    const processedDataList = await Promise.all(
      dataList.map(async (data) => {
        // 验证数据
        await this.validateData(metaTable, data);

        // 处理转换数据类型
        const processedData = await this.processData(metaTable, data, 'create');

        // 添加租户ID
        if (!processedData.tenantId && user.tenantId) {
          processedData.tenantId = user.tenantId;
        }

        // 记录创建者
        if (!processedData.createdBy) {
          processedData.createdBy = user.id;
        }

        return processedData;
      })
    );

    // 执行批量创建操作
    try {
      // 分批处理，避免单次操作过多
      const batchSize = 100;
      const results = [];

      for (let i = 0; i < processedDataList.length; i += batchSize) {
        const batch = processedDataList.slice(i, i + batchSize);
        const batchResults = await (this.prisma as any)[tableName].createMany({
          data: batch,
          skipDuplicates: false,
        });

        results.push(batchResults);
      }

      return {
        success: true,
        count: processedDataList.length,
        results,
      };
    } catch (error) {
      this.logger.error(`批量创建${tableName}记录失败: ${error.message}`, error.stack);
      throw new BadRequestException(`批量创建记录失败: ${error.message}`);
    }
  }

  /**
   * 构建过滤条件
   */
  private buildFilterCondition(metaTable: any, filter: Record<string, any>) {
    const condition: any = {};
    const fieldMap = new Map(metaTable.fields.map((f: any) => [f.name, f]));

    // 处理过滤条件
    Object.entries(filter).forEach(([key, value]) => {
      // 解析操作符
      const [fieldName, operator = 'equals'] = key.split('_');

      // 检查字段是否存在
      const field = fieldMap.get(fieldName);
      if (!field) {
        return; // 忽略不存在的字段
      }

      // 根据操作符构建条件
      switch (operator) {
        case 'equals':
          condition[fieldName] = { equals: this.convertValue(field, value) };
          break;
        case 'not':
          condition[fieldName] = { not: this.convertValue(field, value) };
          break;
        case 'in':
          condition[fieldName] = { in: Array.isArray(value) ? value.map(v => this.convertValue(field, v)) : [this.convertValue(field, value)] };
          break;
        case 'notIn':
          condition[fieldName] = { notIn: Array.isArray(value) ? value.map(v => this.convertValue(field, v)) : [this.convertValue(field, value)] };
          break;
        case 'lt':
          condition[fieldName] = { lt: this.convertValue(field, value) };
          break;
        case 'lte':
          condition[fieldName] = { lte: this.convertValue(field, value) };
          break;
        case 'gt':
          condition[fieldName] = { gt: this.convertValue(field, value) };
          break;
        case 'gte':
          condition[fieldName] = { gte: this.convertValue(field, value) };
          break;
        case 'contains':
          condition[fieldName] = { contains: value };
          break;
        case 'startsWith':
          condition[fieldName] = { startsWith: value };
          break;
        case 'endsWith':
          condition[fieldName] = { endsWith: value };
          break;
        // 其他操作符...
      }
    });

    return condition;
  }

  /**
   * 验证数据是否符合表结构
   */
  private async validateData(metaTable: any, data: any, action: 'create' | 'update' = 'create') {
    const errors: string[] = [];

    for (const field of metaTable.fields) {
      const value = data[field.name];

      // 跳过系统字段
      if (field.isSystem) {
        continue;
      }

      // 创建时检查必填字段
      if (action === 'create' && !field.nullable && !field.isPrimaryKey && value === undefined) {
        errors.push(`字段 ${field.name} 不能为空`);
        continue;
      }

      // 如果字段未提供，跳过后续验证
      if (value === undefined) {
        continue;
      }

      // 检查字段类型
      switch (field.type) {
        case FieldType.INTEGER:
        case FieldType.FLOAT:
        case FieldType.DECIMAL:
          if (isNaN(Number(value))) {
            errors.push(`字段 ${field.name} 必须是数字`);
          }
          break;
        case FieldType.BOOLEAN:
          if (typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
            errors.push(`字段 ${field.name} 必须是布尔值`);
          }
          break;
        case FieldType.DATE:
        case FieldType.DATETIME:
          if (isNaN(Date.parse(value))) {
            errors.push(`字段 ${field.name} 必须是有效的日期`);
          }
          break;
        case FieldType.ENUM:
          if (field.enumValues) {
            const allowedValues = JSON.parse(field.enumValues);
            if (!allowedValues.includes(value)) {
              errors.push(`字段 ${field.name} 必须是以下值之一: ${allowedValues.join(', ')}`);
            }
          }
          break;
        // 其他类型验证...
      }

      // 验证规则
      if (field.validationRules) {
        try {
          const rules = JSON.parse(field.validationRules);
          for (const rule of rules) {
            switch (rule.type) {
              case 'required':
                if (value === undefined || value === null || value === '') {
                  errors.push(rule.message || `字段 ${field.name} 不能为空`);
                }
                break;
              case 'minLength':
                if (value.length < rule.value) {
                  errors.push(rule.message || `字段 ${field.name} 长度不能小于 ${rule.value}`);
                }
                break;
              case 'maxLength':
                if (value.length > rule.value) {
                  errors.push(rule.message || `字段 ${field.name} 长度不能大于 ${rule.value}`);
                }
                break;
              case 'pattern':
                if (!new RegExp(rule.value).test(value)) {
                  errors.push(rule.message || `字段 ${field.name} 格式不正确`);
                }
                break;
              // 其他规则...
            }
          }
        } catch (e) {
          this.logger.error(`解析验证规则失败: ${e.message}`, e.stack);
        }
      }
    }

    if (errors.length > 0) {
      throw new BadRequestException(errors.join('; '));
    }
  }

  /**
   * 处理数据类型转换
   */
  private async processData(
    metaTable: any,
    data: any,
    action: 'create' | 'update',
  ) {
    const result: any = {};

    for (const field of metaTable.fields) {
      const value = data[field.name];

      // 跳过未提供的字段
      if (value === undefined) {
        continue;
      }

      // 根据字段类型转换值
      result[field.name] = this.convertValue(field, value);
    }

    return result;
  }

  /**
   * 根据字段类型转换值
   */
  private convertValue(field: any, value: any) {
    if (value === null) {
      return null;
    }

    switch (field.type) {
      case FieldType.INTEGER:
        return parseInt(value, 10);
      case FieldType.FLOAT:
      case FieldType.DECIMAL:
        return parseFloat(value);
      case FieldType.BOOLEAN:
        return value === true || value === 'true';
      case FieldType.DATE:
      case FieldType.DATETIME:
        return new Date(value);
      case FieldType.JSON:
        return typeof value === 'string' ? JSON.parse(value) : value;
      default:
        return value;
    }
  }
}
```

### 4.4 Cursor提示词

```
创建数据模型管理模块，实现动态数据模型的定义和管理。

1. 设置元数据相关的Prisma模型，包括MetaTable、MetaField等
2. 实现MetaTableService，提供模型元数据的管理功能
3. 开发MetaTableController，暴露模型管理API接口
4. 创建DynamicEntityService，支持动态操作数据
5. 实现SchemaGenerator，根据元数据生成Prisma模式
6. 添加DataMigrator，处理模型变更后的数据迁移
7. 开发ValidationService，实现数据验证规则执行
8. 实现VersionController，管理模型版本
9. 创建ExportImportService，支持数据导入导出
```
