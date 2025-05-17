import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../services/prisma.service';
import { CreateMetaTableDto } from '../dto/create-meta-table.dto';
import { UpdateMetaTableDto } from '../dto/meta-table.dto';
import { TenantContextService } from '../../tenants/tenant-context.service';

@Injectable()
export class MetaTablesService {
  constructor(
    private prisma: PrismaService,
    private tenantContext: TenantContextService,
  ) {}

  async create(
    createMetaTableDto: CreateMetaTableDto,
    userId: string,
  ): Promise<any> {
    const tenant =
      createMetaTableDto.tenant ||
      this.tenantContext.getCurrentTenantId() ||
      'default';

    // 检查同一租户下是否存在同名的表
    const existingTable = await this.prisma.metaTable.findFirst({
      where: {
        name: createMetaTableDto.name,
        tenant,
        application: createMetaTableDto.application || null,
      },
    });

    if (existingTable) {
      throw new ConflictException(
        `表 ${createMetaTableDto.name} 已存在于当前租户中`,
      );
    }

    // 创建表
    const metaTable = await this.prisma.metaTable.create({
      data: {
        name: createMetaTableDto.name,
        displayName: createMetaTableDto.displayName,
        description: createMetaTableDto.description || null,
        isSystem: createMetaTableDto.isSystem,
        isSoftDelete: createMetaTableDto.isSoftDelete,
        isVersioned: createMetaTableDto.isVersioned,
        status: createMetaTableDto.status,
        tenant,
        application: createMetaTableDto.application,
        createdBy: userId,
        auditFields: createMetaTableDto.auditFields,
        apiEnabled: createMetaTableDto.apiEnabled,
        customOptions: createMetaTableDto.customOptions || {},
      },
    });

    // 创建索引
    if (createMetaTableDto.indexes && createMetaTableDto.indexes.length > 0) {
      for (const indexDto of createMetaTableDto.indexes) {
        await this.prisma.metaIndex.create({
          data: {
            tableId: metaTable.id,
            name: indexDto.name,
            type: indexDto.type,
            isUnique: indexDto.isUnique,
          },
        });
      }
    }

    // 创建约束
    if (
      createMetaTableDto.constraints &&
      createMetaTableDto.constraints.length > 0
    ) {
      for (const constraintDto of createMetaTableDto.constraints) {
        await this.prisma.metaConstraint.create({
          data: {
            tableId: metaTable.id,
            name: constraintDto.name,
            type: constraintDto.type,
            fields: constraintDto.fields,
            expression: constraintDto.expression,
            message: constraintDto.message,
          },
        });
      }
    }

    return metaTable;
  }

  async findAll(tenant?: string, application?: string): Promise<any[]> {
    const currentTenant = tenant || this.tenantContext.getCurrentTenantId();

    return this.prisma.metaTable.findMany({
      where: {
        tenant: currentTenant,
        OR: [{ application: application || null }, { application: '' }],
      },
      include: {
        fields: true,
        indexes: {
          include: {
            fields: {
              include: {
                field: true,
              },
            },
          },
        },
        constraints: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string): Promise<any> {
    const metaTable = await this.prisma.metaTable.findUnique({
      where: {
        id,
      },
      include: {
        fields: {
          orderBy: {
            ordinal: 'asc',
          },
        },
        indexes: {
          include: {
            fields: {
              include: {
                field: true,
              },
            },
          },
        },
        constraints: true,
        relations: {
          include: {
            sourceTable: true,
            targetTable: true,
            sourceField: true,
            targetField: true,
          },
        },
        targetRelations: {
          include: {
            sourceTable: true,
            targetTable: true,
            sourceField: true,
            targetField: true,
          },
        },
      },
    });

    if (!metaTable) {
      throw new NotFoundException(`表 ${id} 不存在`);
    }

    return metaTable;
  }

  async update(
    id: string,
    updateMetaTableDto: UpdateMetaTableDto,
    userId: string,
  ): Promise<any> {
    // 检查元表是否存在
    this.findOne(id);

    // 更新元表
    return this.prisma.metaTable.update({
      where: {
        id,
      },
      data: {
        displayName: updateMetaTableDto.displayName,
        description: updateMetaTableDto.description,
        isSoftDelete: updateMetaTableDto.isSoftDelete,
        isVersioned: updateMetaTableDto.isVersioned,
        status: updateMetaTableDto.status,
        updatedBy: userId,
        updatedAt: new Date(),
        auditFields: updateMetaTableDto.auditFields,
        apiEnabled: updateMetaTableDto.apiEnabled,
        customOptions: updateMetaTableDto.customOptions,
      },
    });
  }

  async remove(id: string): Promise<void> {
    // 检查元表是否存在
    await this.findOne(id);

    // 检查表是否已经发布
    const table = await this.prisma.metaTable.findUnique({
      where: {
        id,
      },
      select: {
        status: true,
      },
    });

    if (table && table.status === 'PUBLISHED') {
      throw new BadRequestException('已发布的表不能删除');
    }

    // 删除元表及关联信息
    await this.prisma.$transaction([
      // 删除字段
      this.prisma.metaField.deleteMany({ where: { tableId: id } }),
      // 删除索引
      this.prisma.metaIndex.deleteMany({ where: { tableId: id } }),
      // 删除约束
      this.prisma.metaConstraint.deleteMany({ where: { tableId: id } }),
      // 删除关联
      this.prisma.metaRelation.deleteMany({
        where: {
          OR: [{ sourceTableId: id }, { targetTableId: id }],
        },
      }),
      // 删除表本身
      this.prisma.metaTable.delete({ where: { id } }),
    ]);
  }
}
