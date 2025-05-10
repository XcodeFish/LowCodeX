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
      // 检查表是否存在，如果不存在则尝试创建
      try {
        await this.prisma.$executeRaw`
          CREATE TABLE IF NOT EXISTS \`audit_logs\` (
            \`id\` VARCHAR(36) NOT NULL DEFAULT (UUID()),
            \`userId\` VARCHAR(255) NOT NULL,
            \`tenantId\` VARCHAR(255) NOT NULL,
            \`action\` VARCHAR(50) NOT NULL,
            \`resource\` VARCHAR(100) NOT NULL,
            \`resourceId\` VARCHAR(255),
            \`description\` TEXT NOT NULL,
            \`oldValue\` TEXT,
            \`newValue\` TEXT,
            \`ipAddress\` VARCHAR(50),
            \`userAgent\` VARCHAR(255),
            \`timestamp\` DATETIME NOT NULL,
            PRIMARY KEY (\`id\`)
          )
        `;
      } catch (error) {
        this.logger.warn(`创建审计日志表失败: ${error.message}`);
      }

      await this.prisma.$executeRaw`
        INSERT INTO \`audit_logs\` (
          \`userId\`, \`tenantId\`, \`action\`, \`resource\`, \`resourceId\`,
          \`description\`, \`oldValue\`, \`newValue\`, \`ipAddress\`, \`userAgent\`, \`timestamp\`
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
      // 检查表是否存在
      try {
        await this.prisma.$executeRaw`
          SELECT 1 FROM \`audit_logs\` LIMIT 1
        `;
      } catch (error) {
        // 表不存在，返回空结果
        this.logger.warn(`审计日志表不存在: ${error.message}`);
        return { items: [], total: 0, skip, take };
      }

      // 构建查询条件
      let whereClause = '';
      const params: any[] = [];

      if (query.userId) {
        whereClause += `\`userId\` = $${params.length + 1} AND `;
        params.push(query.userId);
      }

      if (query.tenantId) {
        whereClause += `\`tenantId\` = $${params.length + 1} AND `;
        params.push(query.tenantId);
      }

      if (query.action) {
        whereClause += `\`action\` = $${params.length + 1} AND `;
        params.push(query.action);
      }

      if (query.resource) {
        whereClause += `\`resource\` = $${params.length + 1} AND `;
        params.push(query.resource);
      }

      if (query.resourceId) {
        whereClause += `\`resourceId\` = $${params.length + 1} AND `;
        params.push(query.resourceId);
      }

      if (query.startDate) {
        whereClause += `\`timestamp\` >= $${params.length + 1} AND `;
        params.push(query.startDate);
      }

      if (query.endDate) {
        whereClause += `\`timestamp\` <= $${params.length + 1} AND `;
        params.push(query.endDate);
      }

      if (whereClause) {
        whereClause = 'WHERE ' + whereClause.slice(0, -5); // 移除最后的 " AND "
      }

      // 获取总数
      const countQuery = `SELECT COUNT(*) FROM \`audit_logs\` ${whereClause}`;
      const countResult: Array<{ count: string }> =
        await this.prisma.$queryRawUnsafe(countQuery, ...params);
      const total = parseInt(countResult[0]?.count || '0', 10);

      // 获取数据
      const dataQuery = `
        SELECT al.*, u.username, u.email
        FROM \`audit_logs\` al
        LEFT JOIN \`users\` u ON al.\`userId\` = u.id
        ${whereClause}
        ORDER BY al.\`timestamp\` DESC
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
