import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../services/prisma.service';
import { CreateMetaFieldDto } from '../dto/create-meta-field.dto';
import { MetaField, FieldType } from '../entities/meta-field.entity';

@Injectable()
export class MetaFieldsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createMetaFieldDto: CreateMetaFieldDto,
    userId: string,
  ): Promise<MetaField> {
    // 检查表是否存在
    const table = await this.prisma.metaTable.findUnique({
      where: { id: createMetaFieldDto.tableId },
    });

    if (!table) {
      throw new NotFoundException(`表 ID ${createMetaFieldDto.tableId} 不存在`);
    }

    // 检查字段名称是否已存在
    const existingField = await this.prisma.metaField.findFirst({
      where: {
        tableId: createMetaFieldDto.tableId,
        name: createMetaFieldDto.name,
      },
    });

    if (existingField) {
      throw new ConflictException(
        `字段 ${createMetaFieldDto.name} 在表中已存在`,
      );
    }

    // 创建字段
    const metaField = await this.prisma.metaField.create({
      data: {
        tableId: createMetaFieldDto.tableId,
        name: createMetaFieldDto.name,
        displayName: createMetaFieldDto.displayName,
        description: createMetaFieldDto.description,
        type: createMetaFieldDto.type,
        isPrimaryKey: createMetaFieldDto.isPrimaryKey,
        isRequired: createMetaFieldDto.isRequired,
        isUnique: createMetaFieldDto.isUnique,
        isSystem: createMetaFieldDto.isSystem,
        isHidden: createMetaFieldDto.isHidden,
        ordinal: createMetaFieldDto.ordinal,
        defaultValue: createMetaFieldDto.defaultValue,
        validationRules: createMetaFieldDto.validationRules
          ? JSON.parse(JSON.stringify(createMetaFieldDto.validationRules))
          : [],
        isSearchable: createMetaFieldDto.isSearchable,
        isSortable: createMetaFieldDto.isSortable,
        isFilterable: createMetaFieldDto.isFilterable,
        isAggregatable: createMetaFieldDto.isAggregatable,
        advancedSettings: createMetaFieldDto.advancedSettings
          ? JSON.parse(JSON.stringify(createMetaFieldDto.advancedSettings))
          : {},
      },
    });

    return this.mapToEntity(metaField);
  }

  async findAll(tableId: string): Promise<MetaField[]> {
    const fields = await this.prisma.metaField.findMany({
      where: { tableId },
      orderBy: { ordinal: 'asc' },
      include: {
        sourceRelations: true,
        targetRelations: true,
        indexFields: {
          include: {
            index: true,
          },
        },
      },
    });

    return fields.map((field) => this.mapToEntity(field));
  }

  async findOne(id: string): Promise<MetaField> {
    const metaField = await this.prisma.metaField.findUnique({
      where: { id },
      include: {
        sourceRelations: true,
        targetRelations: true,
        indexFields: {
          include: {
            index: true,
          },
        },
      },
    });

    if (!metaField) {
      throw new NotFoundException(`字段 ID ${id} 不存在`);
    }

    return this.mapToEntity(metaField);
  }

  async update(
    id: string,
    updateMetaFieldDto: any,
    userId: string,
  ): Promise<MetaField> {
    // 检查字段是否存在
    await this.findOne(id);

    // 更新字段
    const updatedField = await this.prisma.metaField.update({
      where: { id },
      data: {
        displayName: updateMetaFieldDto.displayName,
        description: updateMetaFieldDto.description,
        isRequired: updateMetaFieldDto.isRequired,
        isUnique: updateMetaFieldDto.isUnique,
        isHidden: updateMetaFieldDto.isHidden,
        ordinal: updateMetaFieldDto.ordinal,
        defaultValue: updateMetaFieldDto.defaultValue,
        validationRules: updateMetaFieldDto.validationRules,
        isSearchable: updateMetaFieldDto.isSearchable,
        isSortable: updateMetaFieldDto.isSortable,
        isFilterable: updateMetaFieldDto.isFilterable,
        isAggregatable: updateMetaFieldDto.isAggregatable,
        advancedSettings: updateMetaFieldDto.advancedSettings,
      },
      include: {
        sourceRelations: true,
        targetRelations: true,
        indexFields: {
          include: {
            index: true,
          },
        },
      },
    });

    return this.mapToEntity(updatedField);
  }

  async remove(id: string): Promise<void> {
    // 检查字段是否存在
    await this.findOne(id);

    // 检查字段是否被关系引用
    const relations = await this.prisma.metaRelation.findMany({
      where: {
        OR: [{ sourceFieldId: id }, { targetFieldId: id }],
      },
    });

    if (relations.length > 0) {
      throw new BadRequestException(`字段 ID ${id} 正在被关系引用，无法删除`);
    }

    // 检查字段是否被索引引用
    const indexFields = await this.prisma.metaIndexField.findMany({
      where: { fieldId: id },
    });

    if (indexFields.length > 0) {
      throw new BadRequestException(`字段 ID ${id} 正在被索引引用，无法删除`);
    }

    // 删除字段
    await this.prisma.metaField.delete({
      where: { id },
    });
  }

  async getFieldTypes() {
    return Object.values(FieldType).map((type) => ({
      value: type,
      label: this.getFieldTypeLabel(type),
    }));
  }

  private getFieldTypeLabel(type: FieldType): string {
    const labels = {
      [FieldType.STRING]: '字符串',
      [FieldType.TEXT]: '文本',
      [FieldType.RICH_TEXT]: '富文本',
      [FieldType.INTEGER]: '整数',
      [FieldType.FLOAT]: '浮点数',
      [FieldType.DECIMAL]: '精确小数',
      [FieldType.BOOLEAN]: '布尔值',
      [FieldType.DATE]: '日期',
      [FieldType.DATETIME]: '日期时间',
      [FieldType.TIME]: '时间',
      [FieldType.ENUM]: '枚举',
      [FieldType.JSON]: 'JSON',
      [FieldType.ARRAY]: '数组',
      [FieldType.REFERENCE]: '引用',
      [FieldType.FILE]: '文件',
      [FieldType.IMAGE]: '图片',
      [FieldType.EMAIL]: '电子邮件',
      [FieldType.URL]: '网址',
      [FieldType.PHONE]: '电话号码',
      [FieldType.COLOR]: '颜色',
      [FieldType.GEO]: '地理位置',
    };
    return labels[type] || type;
  }

  // 将数据库模型映射为实体类
  private mapToEntity(data: any): MetaField {
    const entity = new MetaField();
    Object.assign(entity, data);
    return entity;
  }
}
