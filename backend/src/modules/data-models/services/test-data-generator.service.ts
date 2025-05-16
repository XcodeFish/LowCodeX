// src/modules/data-models/services/test-data-generator.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../services/prisma.service';
import {
  TestDataGenerationRequestDto,
  TestDataPreviewRequestDto,
  TestDataTemplateDto,
  FieldOverrideDto,
} from '../dto/test-data-generator.dto';
import { MetaTablesService } from './meta-tables.service';
import { FieldType } from '../interfaces/field-type.enum';
import { faker } from '@faker-js/faker';
import * as uuid from 'uuid';

@Injectable()
export class TestDataGeneratorService {
  constructor(
    private prisma: PrismaService,
    private tablesService: MetaTablesService,
  ) {}

  async generateTestData(dto: TestDataGenerationRequestDto, userId: string) {
    // 获取元表信息
    const table = await this.tablesService.findOne(dto.tableId);

    // 设置faker本地化 - 新版faker不使用setLocale
    if (dto.options?.language) {
      // 跳过，当前版本需要直接导入特定语言的faker实例
    }

    // 设置随机种子
    if (dto.options?.seed) {
      faker.seed(Number(dto.options.seed));
    }

    // 生成测试数据
    const generatedData: Record<string, any>[] = [];
    for (let i = 0; i < dto.count; i++) {
      const record = await this.generateRecord(
        table,
        dto.options?.customFields,
        dto.options?.strictMode,
      );
      generatedData.push(record);
    }

    // 如果需要关联数据
    if (dto.includeRelations && dto.relationDepth && dto.relationDepth > 0) {
      // 生成关联数据的逻辑 (在实际项目中实现)
    }

    // 保存测试数据生成记录
    await this.prisma.testDataGeneration.create({
      data: {
        tableId: dto.tableId,
        count: dto.count,
        includeRelations: dto.includeRelations || false,
        relationDepth: dto.relationDepth || 0,
        options: dto.options || {},
        createdBy: userId,
      },
    });

    return {
      table: {
        id: table.id,
        name: table.name,
        displayName: table.displayName,
      },
      count: generatedData.length,
      options: dto.options,
      data: generatedData,
    };
  }

  async previewTestData(dto: TestDataPreviewRequestDto) {
    // 获取元表信息
    const table = await this.tablesService.findOne(dto.tableId);

    // 设置faker本地化 - 新版faker不使用setLocale
    if (dto.options?.language) {
      // 跳过，当前版本需要直接导入特定语言的faker实例
    }

    // 设置随机种子
    if (dto.options?.seed) {
      faker.seed(Number(dto.options.seed));
    }

    // 生成测试数据
    const generatedData: Record<string, any>[] = [];
    for (let i = 0; i < dto.count; i++) {
      const record = await this.generateRecord(
        table,
        dto.options?.customFields,
        dto.options?.strictMode,
      );
      generatedData.push(record);
    }

    return {
      table: {
        id: table.id,
        name: table.name,
        displayName: table.displayName,
      },
      count: generatedData.length,
      options: dto.options,
      data: generatedData,
    };
  }

  async saveTestDataTemplate(dto: TestDataTemplateDto, userId: string) {
    // 检查元表是否存在
    await this.tablesService.findOne(dto.tableId);

    // 保存模板 - 修复fieldOverrides类型问题
    return this.prisma.testDataTemplate.create({
      data: {
        name: dto.name,
        tableId: dto.tableId,
        description: dto.description,
        fieldOverrides: dto.fieldOverrides as any, // 强制类型转换解决Prisma JSON类型问题
        createdBy: userId,
      },
    });
  }

  async getTestDataTemplates(tableId: string) {
    return this.prisma.testDataTemplate.findMany({
      where: {
        tableId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getTestDataTemplate(id: string) {
    const template = await this.prisma.testDataTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException(`ID为${id}的测试数据模板不存在`);
    }

    return template;
  }

  async deleteTestDataTemplate(id: string) {
    const template = await this.getTestDataTemplate(id);

    await this.prisma.testDataTemplate.delete({
      where: { id },
    });

    return { success: true };
  }

  // 生成单条记录
  private async generateRecord(
    table: any,
    customFields?: Record<string, any>,
    strictMode = false,
  ) {
    const record = {};

    // 遍历表的所有字段
    for (const field of table.fields) {
      // 如果有自定义字段值
      if (customFields && customFields[field.name] !== undefined) {
        record[field.name] = customFields[field.name];
        continue;
      }

      // 根据字段类型生成数据
      record[field.name] = this.generateFieldValue(field, strictMode);
    }

    return record;
  }

  // 根据字段类型生成随机值
  private generateFieldValue(field: any, strictMode = false) {
    // 如果是主键且名为id，生成UUID
    if (field.isPrimaryKey && field.name.toLowerCase() === 'id') {
      return uuid.v4();
    }

    // 系统字段处理
    if (field.isSystem) {
      if (field.name === 'createdAt' || field.name === 'updatedAt') {
        return new Date();
      }
      if (field.name === 'createdBy' || field.name === 'updatedBy') {
        return faker.string.uuid();
      }
    }

    // 根据字段类型生成数据
    switch (field.type) {
      case FieldType.STRING:
        // 根据字段名智能匹配内容
        if (field.name.includes('name') || field.name.includes('Name')) {
          return faker.person.fullName();
        } else if (field.name.includes('email')) {
          return faker.internet.email();
        } else if (field.name.includes('phone')) {
          return faker.phone.number();
        } else if (field.name.includes('address')) {
          return faker.location.streetAddress();
        } else if (field.name.includes('title')) {
          return faker.lorem.sentence(3);
        } else {
          // 根据高级设置调整字符串长度
          const minLength = field.advancedSettings?.minLength || 5;
          const maxLength = field.advancedSettings?.maxLength || 20;
          return faker.string.alpha({
            length: { min: minLength, max: maxLength },
          });
        }

      case FieldType.TEXT:
      case FieldType.RICH_TEXT:
        return faker.lorem.paragraphs(2);

      case FieldType.INTEGER:
        const min =
          field.advancedSettings?.min !== undefined
            ? field.advancedSettings.min
            : 1;
        const max =
          field.advancedSettings?.max !== undefined
            ? field.advancedSettings.max
            : 1000;
        return faker.number.int({ min, max });

      case FieldType.FLOAT:
      case FieldType.DECIMAL:
        const minFloat =
          field.advancedSettings?.min !== undefined
            ? field.advancedSettings.min
            : 0;
        const maxFloat =
          field.advancedSettings?.max !== undefined
            ? field.advancedSettings.max
            : 1000;
        const precision = field.advancedSettings?.precision || 2;
        return parseFloat(
          faker.number
            .float({ min: minFloat, max: maxFloat, fractionDigits: precision })
            .toFixed(precision),
        );

      case FieldType.BOOLEAN:
        return faker.datatype.boolean();

      case FieldType.DATE:
        return faker.date.past({ years: 2 });

      case FieldType.DATETIME:
        return faker.date.recent();

      case FieldType.TIME:
        const date = faker.date.recent();
        return date.toTimeString().split(' ')[0];

      case FieldType.ENUM:
        const enumOptions = field.advancedSettings?.enumOptions || [];
        if (enumOptions.length > 0) {
          const option =
            enumOptions[
              faker.number.int({ min: 0, max: enumOptions.length - 1 })
            ];
          return option.value;
        }
        return null;

      case FieldType.JSON:
        return { key: faker.word.sample(), value: faker.word.sample() };

      case FieldType.ARRAY:
        return [faker.word.sample(), faker.word.sample(), faker.word.sample()];

      case FieldType.REFERENCE:
        return faker.string.uuid();

      case FieldType.FILE:
      case FieldType.IMAGE:
        return `https://example.com/files/${faker.string.uuid()}.${field.type === FieldType.IMAGE ? 'jpg' : 'pdf'}`;

      case FieldType.EMAIL:
        return faker.internet.email();

      case FieldType.URL:
        return faker.internet.url();

      case FieldType.PHONE:
        return faker.phone.number();

      case FieldType.COLOR:
        return faker.internet.color();

      case FieldType.GEO:
        return {
          lat: faker.location.latitude(),
          lng: faker.location.longitude(),
        };

      default:
        return null;
    }
  }

  // 验证生成的数据是否符合验证规则
  private validateFieldValue(field: any, value: any): boolean {
    if (!field.validationRules || field.validationRules.length === 0) {
      return true;
    }

    // 实现验证逻辑
    for (const rule of field.validationRules) {
      switch (rule.type) {
        case 'required':
          if (value === null || value === undefined || value === '') {
            return false;
          }
          break;
        case 'length':
          if (typeof value === 'string') {
            const minLength = rule.parameters?.min;
            const maxLength = rule.parameters?.max;

            if (minLength !== undefined && value.length < minLength) {
              return false;
            }
            if (maxLength !== undefined && value.length > maxLength) {
              return false;
            }
          }
          break;
        case 'range':
          if (typeof value === 'number') {
            const min = rule.parameters?.min;
            const max = rule.parameters?.max;

            if (min !== undefined && value < min) {
              return false;
            }
            if (max !== undefined && value > max) {
              return false;
            }
          }
          break;
        case 'regex':
          if (typeof value === 'string' && rule.parameters?.pattern) {
            const regex = new RegExp(rule.parameters.pattern);
            if (!regex.test(value)) {
              return false;
            }
          }
          break;
        // 其他验证类型...
      }
    }

    return true;
  }
}
