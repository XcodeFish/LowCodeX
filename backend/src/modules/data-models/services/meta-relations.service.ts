import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../services/prisma.service';
import { CreateMetaRelationDto } from '../dto/create-meta-relation.dto';
import { MetaRelation } from '../entities/meta-relation.entity';
import { RelationType } from '../entities/meta-field.entity';

@Injectable()
export class MetaRelationsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createMetaRelationDto: CreateMetaRelationDto,
    userId: string,
  ): Promise<MetaRelation> {
    // 检查表是否存在
    const sourceTable = await this.prisma.metaTable.findUnique({
      where: { id: createMetaRelationDto.sourceTableId },
    });

    if (!sourceTable) {
      throw new NotFoundException(
        `源表 ID ${createMetaRelationDto.sourceTableId} 不存在`,
      );
    }

    const targetTable = await this.prisma.metaTable.findUnique({
      where: { id: createMetaRelationDto.targetTableId },
    });

    if (!targetTable) {
      throw new NotFoundException(
        `目标表 ID ${createMetaRelationDto.targetTableId} 不存在`,
      );
    }

    // 检查字段是否存在
    const sourceField = await this.prisma.metaField.findUnique({
      where: { id: createMetaRelationDto.sourceFieldId },
    });

    if (!sourceField) {
      throw new NotFoundException(
        `源字段 ID ${createMetaRelationDto.sourceFieldId} 不存在`,
      );
    }

    const targetField = await this.prisma.metaField.findUnique({
      where: { id: createMetaRelationDto.targetFieldId },
    });

    if (!targetField) {
      throw new NotFoundException(
        `目标字段 ID ${createMetaRelationDto.targetFieldId} 不存在`,
      );
    }

    // 如果提供了中间表ID，检查它是否存在
    if (createMetaRelationDto.junctionTableId) {
      const junctionTable = await this.prisma.metaTable.findUnique({
        where: { id: createMetaRelationDto.junctionTableId },
      });

      if (!junctionTable) {
        throw new NotFoundException(
          `中间表 ID ${createMetaRelationDto.junctionTableId} 不存在`,
        );
      }
    }

    // 检查关系名称是否已存在
    const existingRelation = await this.prisma.metaRelation.findFirst({
      where: {
        OR: [
          {
            name: createMetaRelationDto.name,
            sourceTableId: createMetaRelationDto.sourceTableId,
          },
          {
            name: createMetaRelationDto.name,
            targetTableId: createMetaRelationDto.targetTableId,
          },
        ],
      },
    });

    if (existingRelation) {
      throw new ConflictException(`关系 ${createMetaRelationDto.name} 已存在`);
    }

    // 创建关系
    const metaRelation = await this.prisma.metaRelation.create({
      data: {
        name: createMetaRelationDto.name,
        description: createMetaRelationDto.description,
        sourceTableId: createMetaRelationDto.sourceTableId,
        targetTableId: createMetaRelationDto.targetTableId,
        sourceFieldId: createMetaRelationDto.sourceFieldId,
        targetFieldId: createMetaRelationDto.targetFieldId,
        type: createMetaRelationDto.type,
        cascadeDelete: createMetaRelationDto.cascadeDelete,
        cascadeUpdate: createMetaRelationDto.cascadeUpdate,
        isRequired: createMetaRelationDto.isRequired,
        junctionTableId: createMetaRelationDto.junctionTableId,
        customOptions: createMetaRelationDto.customOptions,
      },
      include: {
        sourceTable: true,
        targetTable: true,
        sourceField: true,
        targetField: true,
        junctionTable: true,
      },
    });

    return this.mapToEntity(metaRelation);
  }

  async findAll(
    sourceTableId?: string,
    targetTableId?: string,
  ): Promise<MetaRelation[]> {
    let where = {};

    if (sourceTableId && targetTableId) {
      where = {
        AND: [{ sourceTableId }, { targetTableId }],
      };
    } else if (sourceTableId) {
      where = { sourceTableId };
    } else if (targetTableId) {
      where = { targetTableId };
    }

    const relations = await this.prisma.metaRelation.findMany({
      where,
      include: {
        sourceTable: true,
        targetTable: true,
        sourceField: true,
        targetField: true,
        junctionTable: true,
      },
    });

    return relations.map((relation) => this.mapToEntity(relation));
  }

  async findOne(id: string): Promise<MetaRelation> {
    const metaRelation = await this.prisma.metaRelation.findUnique({
      where: { id },
      include: {
        sourceTable: true,
        targetTable: true,
        sourceField: true,
        targetField: true,
        junctionTable: true,
      },
    });

    if (!metaRelation) {
      throw new NotFoundException(`关系 ID ${id} 不存在`);
    }

    return this.mapToEntity(metaRelation);
  }

  async update(
    id: string,
    updateMetaRelationDto: any,
    userId: string,
  ): Promise<MetaRelation> {
    // 检查关系是否存在
    await this.findOne(id);

    // 更新关系
    const updatedRelation = await this.prisma.metaRelation.update({
      where: { id },
      data: {
        name: updateMetaRelationDto.name,
        description: updateMetaRelationDto.description,
        type: updateMetaRelationDto.type,
        cascadeDelete: updateMetaRelationDto.cascadeDelete,
        cascadeUpdate: updateMetaRelationDto.cascadeUpdate,
        isRequired: updateMetaRelationDto.isRequired,
        customOptions: updateMetaRelationDto.customOptions,
      },
      include: {
        sourceTable: true,
        targetTable: true,
        sourceField: true,
        targetField: true,
        junctionTable: true,
      },
    });

    return this.mapToEntity(updatedRelation);
  }

  async remove(id: string): Promise<void> {
    // 检查关系是否存在
    await this.findOne(id);

    // 删除关系
    await this.prisma.metaRelation.delete({
      where: { id },
    });
  }

  async getRelationTypes() {
    return Object.values(RelationType).map((type) => ({
      value: type,
      label: this.getRelationTypeLabel(type),
    }));
  }

  private getRelationTypeLabel(type: RelationType): string {
    const labels = {
      [RelationType.ONE_TO_ONE]: '一对一',
      [RelationType.ONE_TO_MANY]: '一对多',
      [RelationType.MANY_TO_ONE]: '多对一',
      [RelationType.MANY_TO_MANY]: '多对多',
    };
    return labels[type] || type;
  }

  // 将数据库模型映射为实体类
  private mapToEntity(data: any): MetaRelation {
    const entity = new MetaRelation();
    Object.assign(entity, data);
    return entity;
  }
}
