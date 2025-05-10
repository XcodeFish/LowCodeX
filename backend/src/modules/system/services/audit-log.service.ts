import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../services/prisma.service';

export enum AuditLogAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  EXPORT = 'export',
  IMPORT = 'import',
  PUBLISH = 'publish',
  CUSTOM = 'custom',
}

export interface AuditLogUser {
  id: string;
  tenantId?: string;
  username?: string;
  email?: string;
}

export interface AuditLogParams {
  userId: string;
  tenantId: string;
  action: AuditLogAction | string;
  resource: string;
  resourceId?: string;
  description: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 记录审计日志
   */
  async log(params: AuditLogParams): Promise<void> {
    try {
      await this.prisma.$executeRaw`
        INSERT INTO "AuditLog" (
          "userId", "tenantId", "action", "resource", "resourceId",
          "description", "oldValue", "newValue", "ipAddress", "userAgent", "timestamp"
        ) VALUES (
          ${params.userId},
          ${params.tenantId},
          ${params.action},
          ${params.resource},
          ${params.resourceId || null},
          ${params.description},
          ${params.oldValue ? JSON.stringify(params.oldValue) : null},
          ${params.newValue ? JSON.stringify(params.newValue) : null},
          ${params.ipAddress || null},
          ${params.userAgent || null},
          ${new Date()}
        )
      `;
    } catch (error) {
      this.logger.error(`记录审计日志失败: ${error.message}`, error.stack);
    }
  }

  /**
   * 根据用户记录审计日志
   */
  async logWithUser(
    user: AuditLogUser,
    action: AuditLogAction | string,
    resource: string,
    resourceId: string | undefined,
    description: string,
    oldValue?: any,
    newValue?: any,
    request?: any,
  ): Promise<void> {
    // 确保用户ID非空
    if (!user || !user.id) {
      this.logger.warn('尝试记录审计日志时提供的用户ID为空');
      return;
    }

    const params: AuditLogParams = {
      userId: user.id,
      tenantId: user.tenantId || '', // 提供默认值确保非空
      action,
      resource,
      resourceId,
      description,
      oldValue,
      newValue,
    };

    if (request) {
      params.ipAddress = request.ip || request.connection?.remoteAddress;
      params.userAgent = request.headers['user-agent'];
    }

    await this.log(params);
  }

  /**
   * 获取审计日志列表
   */
  async findAll(query: {
    userId?: string;
    tenantId?: string;
    action?: string;
    resource?: string;
    resourceId?: string;
    startDate?: Date;
    endDate?: Date;
    skip?: number;
    take?: number;
  }) {
    const { skip = 0, take = 20 } = query;

    try {
      // 构建查询条件
      let whereClause = '';
      const params: any[] = [];

      if (query.userId) {
        whereClause += `"userId" = $${params.length + 1} AND `;
        params.push(query.userId);
      }

      if (query.tenantId) {
        whereClause += `"tenantId" = $${params.length + 1} AND `;
        params.push(query.tenantId);
      }

      if (query.action) {
        whereClause += `"action" = $${params.length + 1} AND `;
        params.push(query.action);
      }

      if (query.resource) {
        whereClause += `"resource" = $${params.length + 1} AND `;
        params.push(query.resource);
      }

      if (query.resourceId) {
        whereClause += `"resourceId" = $${params.length + 1} AND `;
        params.push(query.resourceId);
      }

      if (query.startDate) {
        whereClause += `"timestamp" >= $${params.length + 1} AND `;
        params.push(query.startDate);
      }

      if (query.endDate) {
        whereClause += `"timestamp" <= $${params.length + 1} AND `;
        params.push(query.endDate);
      }

      if (whereClause) {
        whereClause = 'WHERE ' + whereClause.slice(0, -5); // 移除最后的 " AND "
      }

      // 获取总数
      const countQuery = `SELECT COUNT(*) FROM "AuditLog" ${whereClause}`;
      const countResult: Array<{ count: string }> =
        await this.prisma.$queryRawUnsafe(countQuery, ...params);
      const total = parseInt(countResult[0]?.count || '0', 10);

      // 获取数据
      const dataQuery = `
        SELECT al.*, u.username, u.email
        FROM "AuditLog" al
        LEFT JOIN "User" u ON al."userId" = u.id
        ${whereClause}
        ORDER BY al."timestamp" DESC
        LIMIT ${take} OFFSET ${skip}
      `;
      const items = await this.prisma.$queryRawUnsafe(dataQuery, ...params);

      return { items, total, skip, take };
    } catch (error) {
      this.logger.error(`获取审计日志失败: ${error.message}`, error.stack);
      return { items: [], total: 0, skip, take };
    }
  }
}
