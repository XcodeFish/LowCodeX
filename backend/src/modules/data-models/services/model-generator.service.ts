import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../services/prisma.service';
import { MetaTablesService } from './meta-tables.service';
import { join } from 'path';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import * as Handlebars from 'handlebars';
import { exec } from 'child_process';
import { promisify } from 'util';
import { FieldType } from '../interfaces/field-type.enum';
import { TableStatus } from '../interfaces/table-status.enum';

const execAsync = promisify(exec);

@Injectable()
export class ModelGeneratorService {
  private readonly logger = new Logger(ModelGeneratorService.name);

  constructor(
    private prisma: PrismaService,
    private metaTablesService: MetaTablesService,
  ) {}

  /**
   * 生成Prisma模型定义
   * @param tableId 元表ID
   */
  async generatePrismaModel(tableId: string): Promise<string> {
    const metaTable = await this.metaTablesService.findOne(tableId);

    if (metaTable.status !== TableStatus.PUBLISHED) {
      throw new Error(`只能为已发布的表生成模型`);
    }

    // 构建Prisma模型
    const modelName = this.formatModelName(metaTable.name);
    let modelCode = `// 自动生成的模型: ${metaTable.displayName}\n`;
    modelCode += `model ${modelName} {\n`;

    // 添加字段
    for (const field of metaTable.fields) {
      modelCode += `  ${this.formatFieldName(field.name)} ${this.getPrismaFieldType(field)}`;

      // 添加修饰符
      const modifiers: string[] = [];
      if (field.isPrimaryKey) {
        modifiers.push('@id');

        if (
          field.type === FieldType.STRING &&
          field.name.toLowerCase() === 'id'
        ) {
          modifiers.push('@default(uuid())');
        } else if (field.type === FieldType.INTEGER) {
          modifiers.push('@default(autoincrement())');
        }
      }

      if (field.isUnique) {
        modifiers.push('@unique');
      }

      if (!field.isRequired && !field.isPrimaryKey) {
        modifiers.push('?');
      }

      // 添加默认值
      if (field.defaultValue && !field.isPrimaryKey) {
        const defaultValue = this.formatDefaultValue(field);
        if (defaultValue) {
          modifiers.push(`@default(${defaultValue})`);
        }
      }

      // 添加DB类型
      const dbType = this.getDbType(field);
      if (dbType) {
        modifiers.push(dbType);
      }

      // 添加映射
      modifiers.push(`@map("${field.name}")`);

      if (modifiers.length > 0) {
        modelCode += ` ${modifiers.join(' ')}`;
      }

      modelCode += '\n';
    }

    // 添加关系
    if (metaTable.relations.length > 0) {
      modelCode += '\n  // 关联关系\n';

      for (const relation of metaTable.relations) {
        const targetModelName = this.formatModelName(relation.targetTable.name);
        const sourceFieldName = this.formatFieldName(relation.sourceField.name);
        const targetFieldName = this.formatFieldName(relation.targetField.name);

        // 添加关系定义
        switch (relation.type) {
          case 'oneToOne':
            modelCode += `  ${this.formatRelationName(targetModelName)} ${targetModelName}`;
            if (!relation.isRequired) modelCode += '?';
            modelCode += ` @relation("${relation.name}", fields: [${sourceFieldName}], references: [${targetFieldName}])`;
            if (relation.cascadeDelete) modelCode += ', onDelete: Cascade';
            modelCode += '\n';
            break;

          case 'oneToMany':
            modelCode += `  ${this.formatRelationName(targetModelName, true)} ${targetModelName}[]`;
            modelCode += ` @relation("${relation.name}")`;
            modelCode += '\n';
            break;

          case 'manyToOne':
            modelCode += `  ${this.formatRelationName(targetModelName)} ${targetModelName}`;
            if (!relation.isRequired) modelCode += '?';
            modelCode += ` @relation("${relation.name}", fields: [${sourceFieldName}], references: [${targetFieldName}])`;
            if (relation.cascadeDelete) modelCode += ', onDelete: Cascade';
            modelCode += '\n';
            break;

          case 'manyToMany':
            // 多对多关系通常需要中间表，这里简化处理
            modelCode += `  ${this.formatRelationName(targetModelName, true)} ${targetModelName}[]`;
            modelCode += ` @relation("${relation.name}")`;
            modelCode += '\n';
            break;
        }
      }
    }

    // 添加表映射
    modelCode += `\n  @@map("${metaTable.name}")`;

    // 添加索引
    if (metaTable.indexes && metaTable.indexes.length > 0) {
      for (const index of metaTable.indexes) {
        const fields = index.fields.map(
          (f) => `${this.formatFieldName(f.field.name)}`,
        );

        if (index.isUnique) {
          modelCode += `\n  @@unique([${fields.join(', ')}])`;
        } else {
          modelCode += `\n  @@index([${fields.join(', ')}])`;
        }
      }
    }

    modelCode += '\n}\n';

    return modelCode;
  }

  /**
   * 生成并应用Prisma迁移
   * @param tableId 元表ID
   */
  async generateAndApplyMigration(tableId: string): Promise<void> {
    // 获取当前Prisma Schema
    const prismaSchema = await this.readPrismaSchema();

    // 生成新模型定义
    const modelCode = await this.generatePrismaModel(tableId);

    // 将模型添加到Schema
    const newSchema = this.addModelToSchema(prismaSchema, modelCode);

    // 写入更新后的Schema
    this.writePrismaSchema(newSchema);

    // 创建迁移并应用
    try {
      await this.createAndApplyMigration(`add_${tableId}`);
      this.logger.log(`成功为表${tableId}生成并应用迁移`);
    } catch (error) {
      this.logger.error(`迁移失败: ${error.message}`, error.stack);
      throw new Error(`迁移失败: ${error.message}`);
    }
  }

  /**
   * 生成DTO
   * @param tableId 元表ID
   */
  async generateDtos(
    tableId: string,
  ): Promise<{ createDto: string; updateDto: string }> {
    const metaTable = await this.metaTablesService.findOne(tableId);
    const modelName = this.formatModelName(metaTable.name);

    // 构建CreateDTO
    let createDtoCode = `import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';\n`;
    createDtoCode += `import { IsString, IsNumber, IsBoolean, IsDate, IsOptional, IsEnum, IsUUID, ValidateNested } from 'class-validator';\n`;
    createDtoCode += `import { Type } from 'class-transformer';\n\n`;

    createDtoCode += `export class Create${modelName}Dto {\n`;

    for (const field of metaTable.fields) {
      // 跳过系统字段
      if (field.isSystem || field.isPrimaryKey) continue;

      // 添加装饰器
      const isOptional = !field.isRequired;
      const decorator = isOptional ? 'ApiPropertyOptional' : 'ApiProperty';

      createDtoCode += `  @${decorator}({ description: '${field.displayName}' })\n`;

      // 添加验证装饰器
      if (isOptional) {
        createDtoCode += `  @IsOptional()\n`;
      }

      switch (field.type) {
        case FieldType.STRING:
        case FieldType.TEXT:
        case FieldType.RICH_TEXT:
        case FieldType.EMAIL:
        case FieldType.URL:
        case FieldType.PHONE:
        case FieldType.COLOR:
          createDtoCode += `  @IsString()\n`;
          break;
        case FieldType.INTEGER:
        case FieldType.FLOAT:
        case FieldType.DECIMAL:
          createDtoCode += `  @IsNumber()\n`;
          break;
        case FieldType.BOOLEAN:
          createDtoCode += `  @IsBoolean()\n`;
          break;
        case FieldType.DATE:
        case FieldType.DATETIME:
        case FieldType.TIME:
          createDtoCode += `  @IsDate()\n`;
          break;
        case FieldType.ENUM:
          const enumOptions = field.advancedSettings?.enumOptions || [];
          const enumValues = enumOptions.map((o) => `'${o.value}'`).join(', ');
          createDtoCode += `  @IsEnum([${enumValues}])\n`;
          break;
        case FieldType.REFERENCE:
          createDtoCode += `  @IsUUID("4")\n`;
          break;
      }

      createDtoCode += `  ${field.name}: ${this.getTypeScriptType(field)};\n\n`;
    }

    createDtoCode += `}\n`;

    // 构建UpdateDTO
    let updateDtoCode = `import { PartialType } from '@nestjs/swagger';\n`;
    updateDtoCode += `import { Create${modelName}Dto } from './create-${this.toKebabCase(modelName)}.dto';\n\n`;
    updateDtoCode += `export class Update${modelName}Dto extends PartialType(Create${modelName}Dto) {}\n`;

    return {
      createDto: createDtoCode,
      updateDto: updateDtoCode,
    };
  }

  /**
   * 生成服务类
   * @param tableId 元表ID
   */
  async generateService(tableId: string): Promise<string> {
    const metaTable = await this.metaTablesService.findOne(tableId);
    const modelName = this.formatModelName(metaTable.name);
    const modelNameLower =
      modelName.charAt(0).toLowerCase() + modelName.slice(1);

    // 服务类模板
    const serviceTemplate = `
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';
import { Create{{modelName}}Dto } from './dto/create-{{kebabModelName}}.dto';
import { Update{{modelName}}Dto } from './dto/update-{{kebabModelName}}.dto';
import { {{modelName}} } from '@prisma/client';

@Injectable()
export class {{modelName}}Service {
  constructor(private prisma: PrismaService) {}

  async create(create{{modelName}}Dto: Create{{modelName}}Dto): Promise<{{modelName}}> {
    return this.prisma.{{modelNameLower}}.create({
      data: create{{modelName}}Dto,
    });
  }

  async findAll(): Promise<{{modelName}}[]> {
    return this.prisma.{{modelNameLower}}.findMany();
  }

  async findOne(id: string): Promise<{{modelName}}> {
    const {{modelNameLower}} = await this.prisma.{{modelNameLower}}.findUnique({
      where: { id },
    });

    if (!{{modelNameLower}}) {
      throw new NotFoundException(\`{{modelName}} with ID \${id} not found\`);
    }

    return {{modelNameLower}};
  }

  async update(id: string, update{{modelName}}Dto: Update{{modelName}}Dto): Promise<{{modelName}}> {
    try {
      return await this.prisma.{{modelNameLower}}.update({
        where: { id },
        data: update{{modelName}}Dto,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(\`{{modelName}} with ID \${id} not found\`);
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.{{modelNameLower}}.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(\`{{modelName}} with ID \${id} not found\`);
      }
      throw error;
    }
  }
}
`;

    // 使用Handlebars编译模板
    const template = Handlebars.compile(serviceTemplate);
    const result = template({
      modelName,
      modelNameLower,
      kebabModelName: this.toKebabCase(modelName),
    });

    return result;
  }

  /**
   * 生成控制器
   * @param tableId 元表ID
   */
  async generateController(tableId: string): Promise<string> {
    const metaTable = await this.metaTablesService.findOne(tableId);
    const modelName = this.formatModelName(metaTable.name);
    const modelNameLower =
      modelName.charAt(0).toLowerCase() + modelName.slice(1);

    // 控制器模板
    const controllerTemplate = `
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { {{modelName}}Service } from './{{kebabModelName}}.service';
import { Create{{modelName}}Dto } from './dto/create-{{kebabModelName}}.dto';
import { Update{{modelName}}Dto } from './dto/update-{{kebabModelName}}.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { CheckPermissions } from '../auth/decorators/check-permissions.decorator';

@ApiTags('{{displayName}}')
@Controller('{{routePath}}')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class {{modelName}}Controller {
  constructor(private readonly {{modelNameLower}}Service: {{modelName}}Service) {}

  @Post()
  @ApiOperation({ summary: '创建{{displayName}}' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @CheckPermissions('create:{{modelNameLower}}')
  create(@Body() create{{modelName}}Dto: Create{{modelName}}Dto) {
    return this.{{modelNameLower}}Service.create(create{{modelName}}Dto);
  }

  @Get()
  @ApiOperation({ summary: '获取所有{{displayName}}' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @CheckPermissions('read:{{modelNameLower}}')
  findAll() {
    return this.{{modelNameLower}}Service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个{{displayName}}' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @CheckPermissions('read:{{modelNameLower}}')
  findOne(@Param('id') id: string) {
    return this.{{modelNameLower}}Service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新{{displayName}}' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @CheckPermissions('update:{{modelNameLower}}')
  update(@Param('id') id: string, @Body() update{{modelName}}Dto: Update{{modelName}}Dto) {
    return this.{{modelNameLower}}Service.update(id, update{{modelName}}Dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除{{displayName}}' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @CheckPermissions('delete:{{modelNameLower}}')
  remove(@Param('id') id: string) {
    return this.{{modelNameLower}}Service.remove(id);
  }
}
`;

    // 使用Handlebars编译模板
    const template = Handlebars.compile(controllerTemplate);
    const result = template({
      modelName,
      modelNameLower,
      kebabModelName: this.toKebabCase(modelName),
      displayName: metaTable.displayName,
      routePath: metaTable.name,
    });

    return result;
  }

  /**
   * 生成模块
   * @param tableId 元表ID
   */
  async generateModule(tableId: string): Promise<string> {
    const metaTable = await this.metaTablesService.findOne(tableId);
    const modelName = this.formatModelName(metaTable.name);
    const kebabModelName = this.toKebabCase(modelName);

    // 模块模板
    const moduleTemplate = `
import { Module } from '@nestjs/common';
import { {{modelName}}Service } from './{{kebabModelName}}.service';
import { {{modelName}}Controller } from './{{kebabModelName}}.controller';
import { PrismaService } from '../../services/prisma.service';

@Module({
  controllers: [{{modelName}}Controller],
  providers: [{{modelName}}Service, PrismaService],
  exports: [{{modelName}}Service],
})
export class {{modelName}}Module {}
`;

    // 使用Handlebars编译模板
    const template = Handlebars.compile(moduleTemplate);
    const result = template({
      modelName,
      kebabModelName,
    });

    return result;
  }

  /**
   * 生成并保存所有模块文件
   * @param tableId 元表ID
   */
  async generateAndSaveModuleFiles(tableId: string): Promise<void> {
    const metaTable = await this.metaTablesService.findOne(tableId);
    const modelName = this.formatModelName(metaTable.name);
    const kebabModelName = this.toKebabCase(modelName);

    // 确定模块目录
    const moduleDir = join(process.cwd(), 'src', 'modules', kebabModelName);
    const dtoDir = join(moduleDir, 'dto');

    // 创建目录
    if (!existsSync(moduleDir)) {
      mkdirSync(moduleDir, { recursive: true });
    }

    if (!existsSync(dtoDir)) {
      mkdirSync(dtoDir, { recursive: true });
    }

    // 生成并保存DTO文件
    const { createDto, updateDto } = await this.generateDtos(tableId);
    writeFileSync(join(dtoDir, `create-${kebabModelName}.dto.ts`), createDto);
    writeFileSync(join(dtoDir, `update-${kebabModelName}.dto.ts`), updateDto);

    // 生成并保存服务文件
    const service = await this.generateService(tableId);
    writeFileSync(join(moduleDir, `${kebabModelName}.service.ts`), service);

    // 生成并保存控制器文件
    const controller = await this.generateController(tableId);
    writeFileSync(
      join(moduleDir, `${kebabModelName}.controller.ts`),
      controller,
    );

    // 生成并保存模块文件
    const module = await this.generateModule(tableId);
    writeFileSync(join(moduleDir, `${kebabModelName}.module.ts`), module);

    this.logger.log(`为表 ${metaTable.name} 生成的所有模块文件已保存`);
  }

  /**
   * 根据元表生成应用模块
   * @param tableId 元表ID
   */
  async generateApplicationModule(tableId: string): Promise<void> {
    // 生成Prisma模型并应用迁移
    await this.generateAndApplyMigration(tableId);

    // 生成并保存模块文件
    await this.generateAndSaveModuleFiles(tableId);

    // 更新表状态为已发布
    await this.prisma.metaTable.update({
      where: { id: tableId },
      data: {
        status: TableStatus.PUBLISHED,
      },
    });

    this.logger.log(`成功为表 ${tableId} 生成应用模块`);
  }

  // 辅助方法
  private formatModelName(name: string): string {
    return name
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
  }

  private formatFieldName(name: string): string {
    return name;
  }

  private formatRelationName(modelName: string, isMany = false): string {
    if (isMany) {
      return modelName.charAt(0).toLowerCase() + modelName.slice(1) + 's';
    }
    return modelName.charAt(0).toLowerCase() + modelName.slice(1);
  }

  private getPrismaFieldType(field: any): string {
    switch (field.type) {
      case FieldType.STRING:
        return 'String';
      case FieldType.TEXT:
      case FieldType.RICH_TEXT:
        return 'String';
      case FieldType.INTEGER:
        return 'Int';
      case FieldType.FLOAT:
        return 'Float';
      case FieldType.DECIMAL:
        return 'Decimal';
      case FieldType.BOOLEAN:
        return 'Boolean';
      case FieldType.DATE:
        return 'DateTime';
      case FieldType.DATETIME:
        return 'DateTime';
      case FieldType.TIME:
        return 'DateTime';
      case FieldType.ENUM:
        // 使用String存储枚举值
        return 'String';
      case FieldType.JSON:
        return 'Json';
      case FieldType.ARRAY:
        // Prisma目前不直接支持数组类型，使用JSON存储
        return 'Json';
      case FieldType.REFERENCE:
        return 'String'; // 存储引用ID
      case FieldType.FILE:
      case FieldType.IMAGE:
        return 'String'; // 存储文件路径或ID
      case FieldType.EMAIL:
      case FieldType.URL:
      case FieldType.PHONE:
      case FieldType.COLOR:
        return 'String';
      case FieldType.GEO:
        return 'Json'; // 存储地理坐标
      default:
        return 'String';
    }
  }

  private getTypeScriptType(field: any): string {
    switch (field.type) {
      case FieldType.STRING:
      case FieldType.TEXT:
      case FieldType.RICH_TEXT:
      case FieldType.EMAIL:
      case FieldType.URL:
      case FieldType.PHONE:
      case FieldType.COLOR:
      case FieldType.FILE:
      case FieldType.IMAGE:
      case FieldType.ENUM:
        return 'string';
      case FieldType.INTEGER:
      case FieldType.FLOAT:
      case FieldType.DECIMAL:
        return 'number';
      case FieldType.BOOLEAN:
        return 'boolean';
      case FieldType.DATE:
      case FieldType.DATETIME:
      case FieldType.TIME:
        return 'Date';
      case FieldType.JSON:
      case FieldType.GEO:
        return 'Record<string, any>';
      case FieldType.ARRAY:
        return 'any[]';
      case FieldType.REFERENCE:
        return 'string'; // 引用ID
      default:
        return 'any';
    }
  }

  private getDbType(field: any): string {
    switch (field.type) {
      case FieldType.TEXT:
        return '@db.Text';
      case FieldType.RICH_TEXT:
        return '@db.Text';
      case FieldType.DECIMAL:
        const precision = field.advancedSettings?.precision || 10;
        const scale = field.advancedSettings?.scale || 2;
        return `@db.Decimal(${precision}, ${scale})`;
      case FieldType.DATE:
        return '@db.Date';
      case FieldType.DATETIME:
        return '@db.DateTime(6)';
      case FieldType.TIME:
        return '@db.Time(6)';
      default:
        return '';
    }
  }

  private formatDefaultValue(field: any): string | null {
    switch (field.type) {
      case FieldType.STRING:
      case FieldType.TEXT:
      case FieldType.RICH_TEXT:
      case FieldType.EMAIL:
      case FieldType.URL:
      case FieldType.PHONE:
      case FieldType.COLOR:
        return `"${field.defaultValue}"`;
      case FieldType.INTEGER:
      case FieldType.FLOAT:
      case FieldType.DECIMAL:
        return `${field.defaultValue}`;
      case FieldType.BOOLEAN:
        return field.defaultValue ? 'true' : 'false';
      case FieldType.DATE:
      case FieldType.DATETIME:
        if (field.defaultValue === 'now') {
          return 'now()';
        }
        return `"${field.defaultValue}"`;
      default:
        return null;
    }
  }

  private toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/\s+/g, '-')
      .toLowerCase();
  }

  private async readPrismaSchema(): Promise<string> {
    // 实际项目中应读取真实的schema文件
    const schemaPath = join(process.cwd(), 'prisma', 'schema.prisma');
    // 这里简化处理，实际应该使用fs.readFile
    return '// 这里是现有的Prisma Schema';
  }

  private addModelToSchema(schema: string, modelCode: string): string {
    // 实际项目中应检查是否已存在模型，并正确添加到schema中
    return `${schema}\n\n${modelCode}`;
  }

  private writePrismaSchema(schema: string): void {
    // 实际项目中应写入真实的schema文件
    const schemaPath = join(process.cwd(), 'prisma', 'schema.prisma');
    // 这里简化处理，实际应该使用fs.writeFile
    this.logger.log('写入Schema:', schema);
  }

  private async createAndApplyMigration(migrationName: string): Promise<void> {
    // 实际项目中应执行Prisma迁移命令
    try {
      // 创建迁移
      await execAsync(
        `npx prisma migrate dev --name ${migrationName} --preview-feature`,
      );

      // 生成客户端
      await execAsync(`npx prisma generate`);

      this.logger.log(`迁移 ${migrationName} 创建并应用成功`);
    } catch (error) {
      this.logger.error(`迁移失败: ${error.message}`, error.stack);
      throw error;
    }
  }
}
