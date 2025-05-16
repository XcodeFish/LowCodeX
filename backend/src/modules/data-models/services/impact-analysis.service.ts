import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../services/prisma.service';
import {
  ImpactAnalysisRequestDto,
  ImpactType,
  ImpactSeverity,
  ImpactResult,
  ImpactAnalysisResponseDto,
} from '../dto/impact-analysis.dto';
import { MetaTablesService } from './meta-tables.service';
import { MetaVersionsService } from './meta-versions.service';

@Injectable()
export class ImpactAnalysisService {
  constructor(
    private prisma: PrismaService,
    private tablesService: MetaTablesService,
    private versionsService: MetaVersionsService,
  ) {}

  async analyzeImpact(
    dto: ImpactAnalysisRequestDto,
  ): Promise<ImpactAnalysisResponseDto> {
    // 获取元表信息
    const table = await this.tablesService.findOne(dto.tableId);

    // 确定要分析的版本
    let currentVersion;
    if (dto.versionId) {
      currentVersion = await this.versionsService.findOne(dto.versionId);
    } else {
      // 使用最新版本
      const versions = await this.versionsService.findAll(dto.tableId);
      if (versions.length === 0) {
        throw new NotFoundException('未找到可用的版本进行分析');
      }
      currentVersion = versions[0]; // 最新版本
    }

    // 确定比较基准版本
    let comparisonVersion;
    if (dto.comparisonVersionId) {
      comparisonVersion = await this.versionsService.findOne(
        dto.comparisonVersionId,
      );
    } else {
      // 使用最近发布的版本
      const publishedVersions = await this.prisma.metaVersion.findMany({
        where: {
          tableId: dto.tableId,
          isPublished: true,
        },
        orderBy: {
          version: 'desc',
        },
        take: 1,
      });

      if (publishedVersions.length === 0) {
        // 如果没有发布版本，则使用最早的版本
        const earliestVersions = await this.prisma.metaVersion.findMany({
          where: {
            tableId: dto.tableId,
          },
          orderBy: {
            version: 'asc',
          },
          take: 1,
        });

        if (earliestVersions.length === 0) {
          throw new NotFoundException('未找到可比较的版本');
        }
        comparisonVersion = earliestVersions[0];
      } else {
        comparisonVersion = publishedVersions[0];
      }
    }

    // 确保当前版本不是比较版本
    if (currentVersion.id === comparisonVersion.id) {
      throw new NotFoundException('当前版本与比较版本相同，无法进行影响分析');
    }

    // 解析快照
    const currentSnapshot = currentVersion.snapshot;
    const comparisonSnapshot = comparisonVersion.snapshot;

    // 分析影响
    const impacts: ImpactResult[] = [];

    // 1. 分析表级别变更
    const tableImpacts = this.analyzeTableChanges(
      currentSnapshot,
      comparisonSnapshot,
    );
    impacts.push(...tableImpacts);

    // 2. 分析字段级别变更
    const fieldImpacts = this.analyzeFieldChanges(
      currentSnapshot.fields || [],
      comparisonSnapshot.fields || [],
    );
    impacts.push(...fieldImpacts);

    // 3. 分析关系级别变更
    const relationImpacts = this.analyzeRelationChanges(
      currentSnapshot.relations || [],
      comparisonSnapshot.relations || [],
    );
    impacts.push(...relationImpacts);

    // 4. 分析依赖表的影响
    const dependencyImpacts = await this.analyzeDependencies(dto.tableId);
    impacts.push(...dependencyImpacts);

    // 总结分析结果
    const result = {
      table: {
        id: table.id,
        name: table.name,
        displayName: table.displayName,
      },
      currentVersion: {
        id: currentVersion.id,
        name: currentVersion.name,
        version: currentVersion.version,
      },
      comparisonVersion: {
        id: comparisonVersion.id,
        name: comparisonVersion.name,
        version: comparisonVersion.version,
      },
      impactSummary: {
        totalImpacts: impacts.length,
        criticalImpacts: impacts.filter(
          (i) => i.severity === ImpactSeverity.CRITICAL,
        ).length,
        highImpacts: impacts.filter((i) => i.severity === ImpactSeverity.HIGH)
          .length,
        mediumImpacts: impacts.filter(
          (i) => i.severity === ImpactSeverity.MEDIUM,
        ).length,
        lowImpacts: impacts.filter((i) => i.severity === ImpactSeverity.LOW)
          .length,
      },
      impacts: impacts,
    };

    return result;
  }

  // 分析表级别变更
  private analyzeTableChanges(
    currentTable: any,
    comparisonTable: any,
  ): ImpactResult[] {
    const impacts: ImpactResult[] = [];

    // 检查基本属性变更
    const tableProperties = [
      {
        key: 'isSoftDelete',
        label: '软删除支持',
        severity: ImpactSeverity.MEDIUM,
      },
      {
        key: 'isVersioned',
        label: '版本控制支持',
        severity: ImpactSeverity.MEDIUM,
      },
      { key: 'apiEnabled', label: 'API支持', severity: ImpactSeverity.HIGH },
    ];

    for (const prop of tableProperties) {
      if (currentTable[prop.key] !== comparisonTable[prop.key]) {
        impacts.push({
          type: ImpactType.TABLE,
          severity: prop.severity,
          description: `表${prop.label}设置从 ${comparisonTable[prop.key]} 变更为 ${currentTable[prop.key]}`,
          detail: {
            property: prop.key,
            oldValue: comparisonTable[prop.key],
            newValue: currentTable[prop.key],
          },
        });
      }
    }

    return impacts;
  }

  // 分析字段级别变更
  private analyzeFieldChanges(
    currentFields: any[],
    comparisonFields: any[],
  ): ImpactResult[] {
    const impacts: ImpactResult[] = [];

    // 创建字段映射
    const currentFieldMap = new Map(currentFields.map((f) => [f.name, f]));
    const comparisonFieldMap = new Map(
      comparisonFields.map((f) => [f.name, f]),
    );

    // 检查删除的字段
    for (const field of comparisonFields) {
      if (!currentFieldMap.has(field.name)) {
        impacts.push({
          type: ImpactType.FIELD,
          severity: ImpactSeverity.CRITICAL,
          description: `删除字段 ${field.name}`,
          detail: {
            field: field.name,
            displayName: field.displayName,
            type: field.type,
          },
        });
      }
    }

    // 检查新增的字段
    for (const field of currentFields) {
      if (!comparisonFieldMap.has(field.name)) {
        // 判断新增字段的影响程度
        let severity = ImpactSeverity.LOW;

        if (field.isRequired && !field.defaultValue) {
          severity = ImpactSeverity.HIGH; // 必填字段没有默认值，影响高
        }

        impacts.push({
          type: ImpactType.FIELD,
          severity: severity,
          description: `新增字段 ${field.name}`,
          detail: {
            field: field.name,
            displayName: field.displayName,
            type: field.type,
            isRequired: field.isRequired,
            defaultValue: field.defaultValue,
          },
        });
      }
    }

    // 检查修改的字段
    for (const currentField of currentFields) {
      const comparisonField = comparisonFieldMap.get(currentField.name);
      if (comparisonField) {
        // 检查字段类型变更
        if (currentField.type !== comparisonField.type) {
          impacts.push({
            type: ImpactType.FIELD,
            severity: ImpactSeverity.CRITICAL,
            description: `字段 ${currentField.name} 类型从 ${comparisonField.type} 变更为 ${currentField.type}`,
            detail: {
              field: currentField.name,
              oldType: comparisonField.type,
              newType: currentField.type,
            },
          });
        }

        // 检查必填约束变更
        if (currentField.isRequired !== comparisonField.isRequired) {
          const severity = currentField.isRequired
            ? ImpactSeverity.HIGH
            : ImpactSeverity.LOW;
          impacts.push({
            type: ImpactType.FIELD,
            severity: severity,
            description: `字段 ${currentField.name} 必填约束从 ${comparisonField.isRequired} 变更为 ${currentField.isRequired}`,
            detail: {
              field: currentField.name,
              oldRequired: comparisonField.isRequired,
              newRequired: currentField.isRequired,
            },
          });
        }

        // 检查唯一约束变更
        if (currentField.isUnique !== comparisonField.isUnique) {
          const severity = currentField.isUnique
            ? ImpactSeverity.MEDIUM
            : ImpactSeverity.LOW;
          impacts.push({
            type: ImpactType.FIELD,
            severity: severity,
            description: `字段 ${currentField.name} 唯一约束从 ${comparisonField.isUnique} 变更为 ${currentField.isUnique}`,
            detail: {
              field: currentField.name,
              oldUnique: comparisonField.isUnique,
              newUnique: currentField.isUnique,
            },
          });
        }

        // 检查验证规则变更
        if (
          JSON.stringify(currentField.validationRules) !==
          JSON.stringify(comparisonField.validationRules)
        ) {
          impacts.push({
            type: ImpactType.FIELD,
            severity: ImpactSeverity.MEDIUM,
            description: `字段 ${currentField.name} 验证规则已变更`,
            detail: {
              field: currentField.name,
              oldRules: comparisonField.validationRules,
              newRules: currentField.validationRules,
            },
          });
        }
      }
    }

    return impacts;
  }

  // 分析关系级别变更
  private analyzeRelationChanges(
    currentRelations: any[],
    comparisonRelations: any[],
  ): ImpactResult[] {
    const impacts: ImpactResult[] = [];

    // 创建关系映射
    const currentRelationMap = new Map(
      currentRelations.map((r) => [r.name, r]),
    );
    const comparisonRelationMap = new Map(
      comparisonRelations.map((r) => [r.name, r]),
    );

    // 检查删除的关系
    for (const relation of comparisonRelations) {
      if (!currentRelationMap.has(relation.name)) {
        impacts.push({
          type: ImpactType.RELATION,
          severity: ImpactSeverity.CRITICAL,
          description: `删除关系 ${relation.name}`,
          detail: {
            relation: relation.name,
            type: relation.type,
            sourceTable: relation.sourceTable,
            targetTable: relation.targetTable,
          },
        });
      }
    }

    // 检查新增的关系
    for (const relation of currentRelations) {
      if (!comparisonRelationMap.has(relation.name)) {
        impacts.push({
          type: ImpactType.RELATION,
          severity: ImpactSeverity.MEDIUM,
          description: `新增关系 ${relation.name}`,
          detail: {
            relation: relation.name,
            type: relation.type,
            sourceTable: relation.sourceTable,
            targetTable: relation.targetTable,
          },
        });
      }
    }

    // 检查修改的关系
    for (const currentRelation of currentRelations) {
      const comparisonRelation = comparisonRelationMap.get(
        currentRelation.name,
      );
      if (comparisonRelation) {
        // 检查关系类型变更
        if (currentRelation.type !== comparisonRelation.type) {
          impacts.push({
            type: ImpactType.RELATION,
            severity: ImpactSeverity.CRITICAL,
            description: `关系 ${currentRelation.name} 类型从 ${comparisonRelation.type} 变更为 ${currentRelation.type}`,
            detail: {
              relation: currentRelation.name,
              oldType: comparisonRelation.type,
              newType: currentRelation.type,
            },
          });
        }

        // 检查级联删除变更
        if (
          currentRelation.cascadeDelete !== comparisonRelation.cascadeDelete
        ) {
          impacts.push({
            type: ImpactType.RELATION,
            severity: ImpactSeverity.HIGH,
            description: `关系 ${currentRelation.name} 级联删除从 ${comparisonRelation.cascadeDelete} 变更为 ${currentRelation.cascadeDelete}`,
            detail: {
              relation: currentRelation.name,
              oldCascadeDelete: comparisonRelation.cascadeDelete,
              newCascadeDelete: currentRelation.cascadeDelete,
            },
          });
        }

        // 检查必需关系变更
        if (currentRelation.isRequired !== comparisonRelation.isRequired) {
          impacts.push({
            type: ImpactType.RELATION,
            severity: ImpactSeverity.MEDIUM,
            description: `关系 ${currentRelation.name} 必需性从 ${comparisonRelation.isRequired} 变更为 ${currentRelation.isRequired}`,
            detail: {
              relation: currentRelation.name,
              oldRequired: comparisonRelation.isRequired,
              newRequired: currentRelation.isRequired,
            },
          });
        }
      }
    }

    return impacts;
  }

  // 分析依赖表的影响
  private async analyzeDependencies(tableId: string): Promise<ImpactResult[]> {
    const impacts: ImpactResult[] = [];

    // 查找引用此表的关系
    const dependentRelations = await this.prisma.metaRelation.findMany({
      where: {
        targetTableId: tableId,
      },
      include: {
        sourceTable: true,
        targetTable: true,
        sourceField: true,
        targetField: true,
      },
    });

    // 分析依赖影响
    for (const relation of dependentRelations) {
      impacts.push({
        type: ImpactType.RELATION,
        severity: ImpactSeverity.MEDIUM,
        description: `表 ${relation.sourceTable.displayName} 通过关系 ${relation.name} 依赖此表`,
        detail: {
          sourceTable: {
            id: relation.sourceTable.id,
            name: relation.sourceTable.name,
            displayName: relation.sourceTable.displayName,
          },
          relation: relation.name,
          type: relation.type,
        },
      });
    }

    return impacts;
  }
}
