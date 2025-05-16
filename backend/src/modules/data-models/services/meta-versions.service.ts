import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../services/prisma.service';
import { CreateMetaVersionDto } from '../dto/create-meta-version.dto';
import { UpdateMetaVersionDto } from '../dto/update-meta-version.dto';
import { MetaVersion } from '../entities/meta-version.entity';
import { MetaTablesService } from './meta-tables.service';

@Injectable()
export class MetaVersionsService {
  constructor(
    private prisma: PrismaService,
    private metaTablesService: MetaTablesService,
  ) {}

  async create(
    createMetaVersionDto: CreateMetaVersionDto,
    userId: string,
  ): Promise<MetaVersion> {
    // 获取元表信息
    const metaTable = await this.metaTablesService.findOne(
      createMetaVersionDto.tableId,
    );

    // 获取当前最大版本号
    const maxVersion = await this.prisma.metaVersion.findFirst({
      where: { tableId: createMetaVersionDto.tableId },
      orderBy: { version: 'desc' },
      select: { version: true },
    });

    const nextVersion = maxVersion ? maxVersion.version + 1 : 1;

    // 创建表快照
    const tableSnapshot = {
      ...metaTable,
      fields: metaTable.fields,
      relations: [...metaTable.relations, ...metaTable.targetRelations],
    };

    // 创建版本记录
    const version = await this.prisma.metaVersion.create({
      data: {
        tableId: createMetaVersionDto.tableId,
        version: nextVersion,
        name: createMetaVersionDto.name,
        description: createMetaVersionDto.description,
        snapshot: tableSnapshot,
        isPublished: createMetaVersionDto.isPublished,
        createdBy: userId,
        comment: createMetaVersionDto.comment,
      },
    });

    // 转换为实体类
    return this.mapToEntity(version);
  }

  async findAll(tableId: string): Promise<MetaVersion[]> {
    const versions = await this.prisma.metaVersion.findMany({
      where: { tableId },
      orderBy: { version: 'desc' },
    });

    return versions.map((version) => this.mapToEntity(version));
  }

  async findOne(id: string): Promise<MetaVersion> {
    const metaVersion = await this.prisma.metaVersion.findUnique({
      where: { id },
    });

    if (!metaVersion) {
      throw new NotFoundException(`元数据版本 ID ${id} 不存在`);
    }

    return this.mapToEntity(metaVersion);
  }

  async update(
    id: string,
    updateMetaVersionDto: UpdateMetaVersionDto,
    userId: string,
  ): Promise<MetaVersion> {
    await this.findOne(id);

    const updatedVersion = await this.prisma.metaVersion.update({
      where: { id },
      data: {
        name: updateMetaVersionDto.name,
        description: updateMetaVersionDto.description,
        comment: updateMetaVersionDto.comment,
      },
    });

    return this.mapToEntity(updatedVersion);
  }

  async publish(id: string, userId: string): Promise<MetaVersion> {
    const version = await this.findOne(id);

    // 获取表信息
    await this.metaTablesService.findOne(version.tableId);

    // 更新表状态为已发布
    await this.prisma.metaTable.update({
      where: { id: version.tableId },
      data: {
        status: 'PUBLISHED',
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });

    // 将版本标记为已发布
    const publishedVersion = await this.prisma.metaVersion.update({
      where: { id },
      data: {
        isPublished: true,
      },
    });

    return this.mapToEntity(publishedVersion);
  }

  async restore(id: string): Promise<MetaVersion> {
    const version = await this.findOne(id);

    // 从快照中恢复表结构
    const snapshot = version.snapshot as any;

    // 这里可以实现具体的恢复逻辑
    // 1. 恢复表基本信息
    await this.prisma.metaTable.update({
      where: { id: version.tableId },
      data: {
        displayName: snapshot.displayName,
        description: snapshot.description,
        isSoftDelete: snapshot.isSoftDelete,
        isVersioned: snapshot.isVersioned,
        auditFields: snapshot.auditFields,
        apiEnabled: snapshot.apiEnabled,
        customOptions: snapshot.customOptions || {},
      },
    });

    // 2. 删除现有字段，重新创建字段
    // 先删除所有现有字段
    await this.prisma.metaField.deleteMany({
      where: { tableId: version.tableId },
    });

    // 重新创建字段
    for (const field of snapshot.fields) {
      // 移除ID以便创建新记录
      const { id, ...fieldData } = field;
      await this.prisma.metaField.create({
        data: {
          ...fieldData,
          tableId: version.tableId,
        },
      });
    }

    // 3. 处理关系（这部分较复杂，需要谨慎处理关联关系）
    // 删除现有关系
    await this.prisma.metaRelation.deleteMany({
      where: {
        OR: [
          { sourceTableId: version.tableId },
          {
            targetTableId: version.tableId,
            sourceTableId: { not: version.tableId },
          },
        ],
      },
    });

    // 重新创建关系
    if (snapshot.relations) {
      for (const relation of snapshot.relations) {
        // 这里需要确保关系中引用的字段ID是有效的
        // 实际实现中可能需要映射新旧字段ID
        const { id, ...relationData } = relation;
        await this.prisma.metaRelation.create({
          data: relationData,
        });
      }
    }

    return version;
  }

  async compare(oldVersionId: string, newVersionId: string): Promise<any> {
    const oldVersion = await this.findOne(oldVersionId);
    const newVersion = await this.findOne(newVersionId);

    // 确保两个版本属于同一个表
    if (oldVersion.tableId !== newVersion.tableId) {
      throw new ConflictException('无法比较不同表的版本');
    }

    // 构建差异对象
    const oldSnapshot = oldVersion.snapshot as any;
    const newSnapshot = newVersion.snapshot as any;

    // 基本信息差异
    const basicDiffs = this.compareBasicInfo(oldSnapshot, newSnapshot);

    // 字段差异
    const fieldDiffs = this.compareFields(
      oldSnapshot.fields,
      newSnapshot.fields,
    );

    // 关系差异
    const relationDiffs = this.compareRelations(
      oldSnapshot.relations || [],
      newSnapshot.relations || [],
    );

    return {
      oldVersion: {
        id: oldVersion.id,
        version: oldVersion.version,
        name: oldVersion.name,
      },
      newVersion: {
        id: newVersion.id,
        version: newVersion.version,
        name: newVersion.name,
      },
      diffs: {
        basic: basicDiffs,
        fields: fieldDiffs,
        relations: relationDiffs,
      },
    };
  }

  // 将数据库模型映射为实体类
  private mapToEntity(data: any): MetaVersion {
    const entity = new MetaVersion();
    entity.id = data.id;
    entity.tableId = data.tableId;
    entity.version = data.version;
    entity.name = data.name;
    entity.description = data.description;
    entity.snapshot = data.snapshot;
    entity.isPublished = data.isPublished;
    entity.createdBy = data.createdBy;
    entity.createdAt = data.createdAt;
    entity.comment = data.comment;
    return entity;
  }

  private compareBasicInfo(oldSnapshot: any, newSnapshot: any): any[] {
    const diffs: Array<{ property: string; oldValue: any; newValue: any }> = [];
    const properties = [
      'displayName',
      'description',
      'isSoftDelete',
      'isVersioned',
      'auditFields',
      'apiEnabled',
    ];

    for (const prop of properties) {
      if (oldSnapshot[prop] !== newSnapshot[prop]) {
        diffs.push({
          property: prop,
          oldValue: oldSnapshot[prop],
          newValue: newSnapshot[prop],
        });
      }
    }

    return diffs;
  }

  private compareFields(oldFields: any[], newFields: any[]): any {
    // 创建字段映射便于比较
    const oldFieldMap = new Map(oldFields.map((f) => [f.name, f]));
    const newFieldMap = new Map(newFields.map((f) => [f.name, f]));

    const added: any[] = [];
    const removed: any[] = [];
    const modified: Array<{
      field: string;
      changes: Array<{ property: string; oldValue: any; newValue: any }>;
    }> = [];

    // 检查新增字段
    for (const field of newFields) {
      if (!oldFieldMap.has(field.name)) {
        added.push(field);
      }
    }

    // 检查删除字段
    for (const field of oldFields) {
      if (!newFieldMap.has(field.name)) {
        removed.push(field);
      }
    }

    // 检查修改字段
    for (const oldField of oldFields) {
      const newField = newFieldMap.get(oldField.name);
      if (newField) {
        const changes = this.compareFieldProperties(oldField, newField);
        if (changes.length > 0) {
          modified.push({
            field: oldField.name,
            changes,
          });
        }
      }
    }

    return { added, removed, modified };
  }

  private compareFieldProperties(
    oldField: any,
    newField: any,
  ): Array<{ property: string; oldValue: any; newValue: any }> {
    const changes: Array<{ property: string; oldValue: any; newValue: any }> =
      [];
    const properties = [
      'displayName',
      'description',
      'type',
      'isPrimaryKey',
      'isRequired',
      'isUnique',
      'isSystem',
      'isHidden',
      'defaultValue',
      'isSearchable',
      'isSortable',
      'isFilterable',
      'isAggregatable',
    ];

    for (const prop of properties) {
      if (oldField[prop] !== newField[prop]) {
        changes.push({
          property: prop,
          oldValue: oldField[prop],
          newValue: newField[prop],
        });
      }
    }

    // 比较高级设置
    if (oldField.advancedSettings || newField.advancedSettings) {
      const oldSettings = oldField.advancedSettings || {};
      const newSettings = newField.advancedSettings || {};

      // 简化处理，直接比较JSON字符串
      if (JSON.stringify(oldSettings) !== JSON.stringify(newSettings)) {
        changes.push({
          property: 'advancedSettings',
          oldValue: oldSettings,
          newValue: newSettings,
        });
      }
    }

    return changes;
  }

  private compareRelations(oldRelations: any[], newRelations: any[]): any {
    // 创建关系映射便于比较
    const oldRelationMap = new Map(oldRelations.map((r) => [r.name, r]));
    const newRelationMap = new Map(newRelations.map((r) => [r.name, r]));

    const added: any[] = [];
    const removed: any[] = [];
    const modified: Array<{
      relation: string;
      changes: Array<{ property: string; oldValue: any; newValue: any }>;
    }> = [];

    // 检查新增关系
    for (const relation of newRelations) {
      if (!oldRelationMap.has(relation.name)) {
        added.push(relation);
      }
    }

    // 检查删除关系
    for (const relation of oldRelations) {
      if (!newRelationMap.has(relation.name)) {
        removed.push(relation);
      }
    }

    // 检查修改关系
    for (const oldRelation of oldRelations) {
      const newRelation = newRelationMap.get(oldRelation.name);
      if (newRelation) {
        const changes = this.compareRelationProperties(
          oldRelation,
          newRelation,
        );
        if (changes.length > 0) {
          modified.push({
            relation: oldRelation.name,
            changes,
          });
        }
      }
    }

    return { added, removed, modified };
  }

  private compareRelationProperties(
    oldRelation: any,
    newRelation: any,
  ): Array<{ property: string; oldValue: any; newValue: any }> {
    const changes: Array<{ property: string; oldValue: any; newValue: any }> =
      [];
    const properties = [
      'description',
      'type',
      'cascadeDelete',
      'cascadeUpdate',
      'isRequired',
    ];

    for (const prop of properties) {
      if (oldRelation[prop] !== newRelation[prop]) {
        changes.push({
          property: prop,
          oldValue: oldRelation[prop],
          newValue: newRelation[prop],
        });
      }
    }

    return changes;
  }
}
