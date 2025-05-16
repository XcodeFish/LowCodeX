import { Injectable, Logger } from '@nestjs/common';
import { MetaTablesService } from './services/meta-tables.service';
import { MetaFieldsService } from './services/meta-fields.service';
import { MetaRelationsService } from './services/meta-relations.service';
import { MetaVersionsService } from './services/meta-versions.service';
import { ModelGeneratorService } from './services/model-generator.service';
import { CreateMetaTableDto } from './dto/create-meta-table.dto';
import { CreateMetaFieldDto } from './dto/create-meta-field.dto';
import { CreateMetaRelationDto } from './dto/create-meta-relation.dto';
import { CreateMetaVersionDto } from './dto/create-meta-version.dto';
import { TableStatus } from './interfaces/table-status.enum';
import { MetaField } from './entities/meta-field.entity';

@Injectable()
export class DataModelsService {
  private readonly logger = new Logger(DataModelsService.name);

  constructor(
    private metaTablesService: MetaTablesService,
    private metaFieldsService: MetaFieldsService,
    private metaRelationsService: MetaRelationsService,
    private metaVersionsService: MetaVersionsService,
    private modelGeneratorService: ModelGeneratorService,
  ) {}

  /**
   * 创建完整的数据模型
   * @param model 元表定义
   * @param fields 元字段列表
   * @param userId 用户ID
   */
  async createCompleteModel(
    model: CreateMetaTableDto,
    fields: CreateMetaFieldDto[],
    userId: string,
  ) {
    // 1. 创建元表
    const createdTable = await this.metaTablesService.create(model, userId);
    this.logger.log(
      `创建元表 ${createdTable.name} 成功，ID: ${createdTable.id}`,
    );

    // 2. 创建元字段
    const createdFields: MetaField[] = [];
    for (const field of fields) {
      field.tableId = createdTable.id;
      const createdField = await this.metaFieldsService.create(field, userId);
      createdFields.push(createdField);
    }
    this.logger.log(
      `为表 ${createdTable.name} 创建了 ${createdFields.length} 个字段`,
    );

    // 3. 创建初始版本
    const versionDto: CreateMetaVersionDto = {
      tableId: createdTable.id,
      name: `${createdTable.displayName} v1`,
      description: '初始版本',
      isPublished: false,
    };
    await this.metaVersionsService.create(versionDto, userId);
    this.logger.log(`为表 ${createdTable.name} 创建初始版本成功`);

    return {
      table: createdTable,
      fields: createdFields,
    };
  }

  /**
   * 发布数据模型
   * @param tableId 元表ID
   * @param userId 用户ID
   */
  async publishModel(tableId: string, userId: string) {
    // 1. 检查元表状态
    const table = await this.metaTablesService.findOne(tableId);
    if (table.status === TableStatus.PUBLISHED) {
      this.logger.log(`表 ${table.name} 已经是发布状态`);
      return table;
    }

    // 2. 创建发布版本
    const versionDto: CreateMetaVersionDto = {
      tableId,
      name: `${table.displayName} 发布版本`,
      description: '发布到生产环境的版本',
      isPublished: true,
      comment: '自动发布',
    };
    const version = await this.metaVersionsService.create(versionDto, userId);
    this.logger.log(`为表 ${table.name} 创建发布版本成功`);

    // 3. 标记版本为已发布
    await this.metaVersionsService.publish(version.id, userId);

    // 4. 生成数据库表和API
    await this.modelGeneratorService.generateApplicationModule(tableId);
    this.logger.log(`为表 ${table.name} 生成应用模块成功`);

    // 5. 返回更新后的表信息
    return this.metaTablesService.findOne(tableId);
  }

  /**
   * 克隆数据模型（复制模型结构）
   * @param sourceTableId 源表ID
   * @param newName 新表名称
   * @param newDisplayName 新表显示名称
   * @param userId 用户ID
   */
  async cloneModel(
    sourceTableId: string,
    newName: string,
    newDisplayName: string,
    userId: string,
  ) {
    // 1. 获取源表信息
    const sourceTable = await this.metaTablesService.findOne(sourceTableId);

    // 2. 创建新表
    const tableDto: CreateMetaTableDto = {
      name: newName,
      displayName: newDisplayName,
      description: `克隆自 ${sourceTable.displayName}`,
      isSystem: false,
      isSoftDelete: sourceTable.isSoftDelete,
      isVersioned: sourceTable.isVersioned,
      status: TableStatus.DRAFT,
      tenant: sourceTable.tenant,
      application: sourceTable.application,
      auditFields: sourceTable.auditFields,
      apiEnabled: sourceTable.apiEnabled,
      customOptions: sourceTable.customOptions,
    };
    const newTable = await this.metaTablesService.create(tableDto, userId);
    this.logger.log(`克隆表 ${sourceTable.name} 为 ${newName} 成功`);

    // 3. 克隆字段
    const fieldMap = new Map(); // 用于存储旧字段ID到新字段ID的映射
    for (const sourceField of sourceTable.fields) {
      const fieldDto: CreateMetaFieldDto = {
        tableId: newTable.id,
        name: sourceField.name,
        displayName: sourceField.displayName,
        description: sourceField.description,
        type: sourceField.type,
        isPrimaryKey: sourceField.isPrimaryKey,
        isRequired: sourceField.isRequired,
        isUnique: sourceField.isUnique,
        isSystem: sourceField.isSystem,
        isHidden: sourceField.isHidden,
        ordinal: sourceField.ordinal,
        defaultValue: sourceField.defaultValue,
        validationRules: sourceField.validationRules,
        isSearchable: sourceField.isSearchable,
        isSortable: sourceField.isSortable,
        isFilterable: sourceField.isFilterable,
        isAggregatable: sourceField.isAggregatable,
        advancedSettings: sourceField.advancedSettings,
      };
      const newField = await this.metaFieldsService.create(fieldDto, userId);
      fieldMap.set(sourceField.id, newField.id);
    }
    this.logger.log(`克隆表 ${sourceTable.name} 的字段成功`);

    // 4. 克隆关系
    for (const sourceRelation of sourceTable.relations) {
      // 只克隆源表是当前表的关系
      if (sourceRelation.sourceTableId === sourceTableId) {
        const relationDto: CreateMetaRelationDto = {
          name: sourceRelation.name,
          description: sourceRelation.description,
          sourceTableId: newTable.id,
          targetTableId: sourceRelation.targetTableId,
          sourceFieldId: fieldMap.get(sourceRelation.sourceFieldId),
          targetFieldId: sourceRelation.targetFieldId,
          type: sourceRelation.type,
          cascadeDelete: sourceRelation.cascadeDelete,
          cascadeUpdate: sourceRelation.cascadeUpdate,
          isRequired: sourceRelation.isRequired,
          customOptions: sourceRelation.customOptions,
        };

        if (sourceRelation.junctionTableId) {
          relationDto.junctionTableId = sourceRelation.junctionTableId;
        }

        await this.metaRelationsService.create(relationDto, userId);
      }
    }
    this.logger.log(`克隆表 ${sourceTable.name} 的关系成功`);

    // 5. 创建初始版本
    const versionDto: CreateMetaVersionDto = {
      tableId: newTable.id,
      name: `${newDisplayName} v1`,
      description: `克隆自 ${sourceTable.displayName} 的初始版本`,
      isPublished: false,
    };
    await this.metaVersionsService.create(versionDto, userId);
    this.logger.log(`为克隆表 ${newName} 创建初始版本成功`);

    return this.metaTablesService.findOne(newTable.id);
  }

  /**
   * 获取模型完整信息（包含表、字段、关系和版本）
   * @param tableId 元表ID
   */
  async getCompleteModel(tableId: string) {
    // 获取表信息（包含字段和关系）
    const table = await this.metaTablesService.findOne(tableId);

    // 获取版本信息
    const versions = await this.metaVersionsService.findAll(tableId);

    // 合并为完整模型信息
    return {
      table,
      versions,
    };
  }

  /**
   * 导出模型定义为JSON
   * @param tableId 元表ID
   */
  async exportModelDefinition(tableId: string) {
    const model = await this.getCompleteModel(tableId);

    // 格式化为可导出的JSON结构
    const exportData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        modelType: 'LowCodeX_DataModel',
        version: '1.0',
      },
      model: {
        table: {
          name: model.table.name,
          displayName: model.table.displayName,
          description: model.table.description,
          isSoftDelete: model.table.isSoftDelete,
          isVersioned: model.table.isVersioned,
          auditFields: model.table.auditFields,
          apiEnabled: model.table.apiEnabled,
          customOptions: model.table.customOptions,
        },
        fields: model.table.fields.map((field) => ({
          name: field.name,
          displayName: field.displayName,
          description: field.description,
          type: field.type,
          isPrimaryKey: field.isPrimaryKey,
          isRequired: field.isRequired,
          isUnique: field.isUnique,
          isSystem: field.isSystem,
          isHidden: field.isHidden,
          ordinal: field.ordinal,
          defaultValue: field.defaultValue,
          validationRules: field.validationRules,
          isSearchable: field.isSearchable,
          isSortable: field.isSortable,
          isFilterable: field.isFilterable,
          isAggregatable: field.isAggregatable,
          advancedSettings: field.advancedSettings,
        })),
        relations: [
          ...model.table.relations,
          ...model.table.targetRelations,
        ].map((relation) => ({
          name: relation.name,
          description: relation.description,
          sourceTable: relation.sourceTable.name,
          targetTable: relation.targetTable.name,
          sourceField: relation.sourceField.name,
          targetField: relation.targetField.name,
          type: relation.type,
          cascadeDelete: relation.cascadeDelete,
          cascadeUpdate: relation.cascadeUpdate,
          isRequired: relation.isRequired,
          customOptions: relation.customOptions,
        })),
      },
    };

    return exportData;
  }

  /**
   * 导入模型定义从JSON
   * @param definitionJson 模型定义JSON
   * @param targetTenant 目标租户
   * @param userId 用户ID
   */
  async importModelDefinition(
    definitionJson: any,
    targetTenant: string,
    userId: string,
  ) {
    // 验证导入的JSON结构
    if (!definitionJson.metadata || !definitionJson.model) {
      throw new Error('无效的模型定义格式');
    }

    const { table, fields, relations } = definitionJson.model;

    // 创建表
    const tableDto: CreateMetaTableDto = {
      name: table.name,
      displayName: table.displayName,
      description: table.description,
      isSystem: false, // 导入的表默认为非系统表
      isSoftDelete: table.isSoftDelete,
      isVersioned: table.isVersioned,
      status: TableStatus.DRAFT,
      tenant: targetTenant,
      application: table.application,
      auditFields: table.auditFields,
      apiEnabled: table.apiEnabled,
      customOptions: table.customOptions,
    };

    // 转换字段
    const fieldDtos = fields.map((field) => ({
      tableId: '', // 将在createCompleteModel中设置
      name: field.name,
      displayName: field.displayName,
      description: field.description,
      type: field.type,
      isPrimaryKey: field.isPrimaryKey,
      isRequired: field.isRequired,
      isUnique: field.isUnique,
      isSystem: field.isSystem,
      isHidden: field.isHidden,
      ordinal: field.ordinal,
      defaultValue: field.defaultValue,
      validationRules: field.validationRules,
      isSearchable: field.isSearchable,
      isSortable: field.isSortable,
      isFilterable: field.isFilterable,
      isAggregatable: field.isAggregatable,
      advancedSettings: field.advancedSettings,
    }));

    // 创建模型
    const createdModel = await this.createCompleteModel(
      tableDto,
      fieldDtos,
      userId,
    );

    // TODO: 处理关系导入（需要解决表名和字段名到ID的映射）

    return createdModel;
  }
}
