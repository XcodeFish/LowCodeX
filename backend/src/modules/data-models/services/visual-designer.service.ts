// src/modules/data-models/services/visual-designer.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../services/prisma.service';
import {
  VisualDiagramSaveDto,
  VisualDiagramDto,
} from '../dto/visual-designer.dto';
import { MetaTablesService } from './meta-tables.service';
import { MetaTable } from '../entities/meta-table.entity';
import { MetaRelation } from '../entities/meta-relation.entity';
import { MetaField } from '../entities/meta-field.entity';

@Injectable()
export class VisualDesignerService {
  constructor(
    private prisma: PrismaService,
    private tablesService: MetaTablesService,
  ) {}

  async saveDiagram(
    dto: VisualDiagramSaveDto,
    userId: string,
  ): Promise<VisualDiagramDto> {
    // 验证关联的表是否存在
    for (const tableId of dto.tableIds) {
      await this.tablesService.findOne(tableId);
    }

    // 创建或更新图表
    const diagram = await this.prisma.visualDiagram.create({
      data: {
        name: dto.name,
        description: dto.description || null,
        tableIds: dto.tableIds,
        elements: dto.elements,
        connections: dto.connections,
        settings: dto.settings || {},
        createdBy: userId,
      },
    });

    return {
      id: diagram.id,
      name: diagram.name,
      description: diagram.description,
      tableIds: diagram.tableIds as string[],
      elements: diagram.elements as any[],
      connections: diagram.connections as any[],
      settings: diagram.settings as Record<string, any>,
    };
  }

  async updateDiagram(
    id: string,
    dto: VisualDiagramSaveDto,
    userId: string,
  ): Promise<VisualDiagramDto> {
    // 检查图表是否存在
    const existingDiagram = await this.prisma.visualDiagram.findUnique({
      where: { id },
    });

    if (!existingDiagram) {
      throw new NotFoundException(`ID为${id}的图表不存在`);
    }

    // 验证关联的表是否存在
    for (const tableId of dto.tableIds) {
      await this.tablesService.findOne(tableId);
    }

    // 更新图表
    const diagram = await this.prisma.visualDiagram.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description || null,
        tableIds: dto.tableIds,
        elements: dto.elements,
        connections: dto.connections,
        settings: dto.settings || {},
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });

    return {
      id: diagram.id,
      name: diagram.name,
      description: diagram.description,
      tableIds: diagram.tableIds as string[],
      elements: diagram.elements as any[],
      connections: diagram.connections as any[],
      settings: diagram.settings as Record<string, any>,
    };
  }

  async getDiagrams(): Promise<VisualDiagramDto[]> {
    const diagrams = await this.prisma.visualDiagram.findMany({
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return diagrams.map((diagram) => ({
      id: diagram.id,
      name: diagram.name,
      description: diagram.description,
      tableIds: diagram.tableIds as string[],
      elements: diagram.elements as any[],
      connections: diagram.connections as any[],
      settings: diagram.settings as Record<string, any>,
    }));
  }

  async getDiagram(id: string): Promise<VisualDiagramDto> {
    const diagram = await this.prisma.visualDiagram.findUnique({
      where: { id },
    });

    if (!diagram) {
      throw new NotFoundException(`ID为${id}的图表不存在`);
    }

    return {
      id: diagram.id,
      name: diagram.name,
      description: diagram.description,
      tableIds: diagram.tableIds as string[],
      elements: diagram.elements as any[],
      connections: diagram.connections as any[],
      settings: diagram.settings as Record<string, any>,
    };
  }

  async deleteDiagram(id: string): Promise<void> {
    // 检查图表是否存在
    const existingDiagram = await this.prisma.visualDiagram.findUnique({
      where: { id },
    });

    if (!existingDiagram) {
      throw new NotFoundException(`ID为${id}的图表不存在`);
    }

    // 删除图表
    await this.prisma.visualDiagram.delete({
      where: { id },
    });
  }

  async generateERDiagram(tableIds: string[]): Promise<VisualDiagramDto> {
    // 验证表是否存在
    const tables: MetaTable[] = [];
    for (const tableId of tableIds) {
      const table = await this.tablesService.findOne(tableId);
      tables.push(table as MetaTable);
    }

    // 生成ER图表元素
    const elements: any[] = [];
    const connections: any[] = [];
    const positions = this.calculateOptimalLayout(tables);

    // 创建表元素
    for (const table of tables) {
      const position = positions[table.id];

      // 创建表元素
      const tableElement = {
        id: `table-${table.id}`,
        type: 'table',
        position,
        size: { width: 200, height: 300 },
        style: {
          backgroundColor: '#f5f5f5',
          borderColor: '#d9d9d9',
          borderWidth: 1,
          textColor: '#000000',
        },
        metadataId: table.id,
        content: {
          name: table.name,
          displayName: table.displayName,
          fields:
            table.fields && Array.isArray(table.fields)
              ? table.fields.map((field: MetaField) => ({
                  id: field.id,
                  name: field.name,
                  displayName: field.displayName,
                  type: field.type,
                  isPrimaryKey: field.isPrimaryKey,
                }))
              : [],
        },
        isExpanded: true,
        isLocked: false,
      };

      elements.push(tableElement);
    }

    // 创建关系连接
    for (const table of tables) {
      const relationMap = new Map<string, MetaRelation>();

      // 收集关系
      if (table.relations && Array.isArray(table.relations)) {
        for (const relation of table.relations) {
          // 只处理在当前图表中的表关系
          if (tableIds.includes(relation.targetTableId)) {
            relationMap.set(relation.id, relation);
          }
        }
      }

      // 添加连接
      for (const relation of Array.from(relationMap.values())) {
        const connection = {
          id: `relation-${relation.id}`,
          sourceId: `table-${relation.sourceTableId}`,
          targetId: `table-${relation.targetTableId}`,
          type: relation.type,
          label: relation.name,
          style: {
            borderColor: '#1890ff',
            borderWidth: 2,
          },
          metadataId: relation.id,
        };

        connections.push(connection);
      }
    }

    // 创建图表对象
    return {
      id: '', // 这里返回临时ID，保存时会生成真实ID
      name: '自动生成的ER图',
      description: '基于选定表自动生成的ER图',
      tableIds,
      elements,
      connections,
      settings: {
        gridSize: 20,
        snapToGrid: true,
        showFieldTypes: true,
      },
    };
  }

  // 计算最优布局
  private calculateOptimalLayout(
    tables: MetaTable[],
  ): Record<string, { x: number; y: number }> {
    const positions: Record<string, { x: number; y: number }> = {};
    const tableCount = tables.length;

    // 简单实现：将表排列成网格
    const gridSize = Math.ceil(Math.sqrt(tableCount));
    const spacing = 300; // 表之间的间距

    tables.forEach((table, index) => {
      const row = Math.floor(index / gridSize);
      const col = index % gridSize;

      positions[table.id] = {
        x: col * spacing,
        y: row * spacing,
      };
    });

    return positions;
  }
}
