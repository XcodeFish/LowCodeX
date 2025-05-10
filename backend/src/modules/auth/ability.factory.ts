import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';
import { createMongoAbility } from '@casl/ability';
import { User, Role } from '../users/entities/user.entity';

// 定义动作常量
export const Action = {
  CREATE: 'create' as const,
  READ: 'read' as const,
  UPDATE: 'update' as const,
  DELETE: 'delete' as const,
  MANAGE: 'manage' as const,
};

// 动作类型
export type Action = (typeof Action)[keyof typeof Action];
export type Subject = string;

export interface Rule {
  action: Action | Action[];
  subject: Subject;
  conditions?: Record<string, any>;
}

export type AppAbility = ReturnType<typeof createAppAbility>;

// 创建应用能力函数
function createAppAbility(rules: Rule[]) {
  return createMongoAbility<[Action, Subject]>(rules);
}

@Injectable()
export class AbilityFactory {
  constructor(private prisma: PrismaService) {}

  async createForUser(user: User): Promise<AppAbility> {
    const rules: Rule[] = [];

    // 系统管理员拥有所有权限
    if (user.roles?.some((role) => role.role?.code === 'SYSTEM_ADMIN')) {
      rules.push({ action: 'manage', subject: 'all' });
      return createAppAbility(rules);
    }

    try {
      // 获取用户所有角色
      const userRoles = await this.prisma.$queryRaw`
        SELECT r.* FROM \`roles\` r
        JOIN \`_userroles\` ur ON r.id = ur.B
        WHERE ur.A = ${user.id}
      `;

      // 获取角色关联的所有权限
      if (userRoles && Array.isArray(userRoles) && userRoles.length > 0) {
        const roleIds = userRoles.map((ur) => ur.id);

        const rolePermissions = await this.prisma.$queryRaw`
          SELECT p.* FROM \`permissions\` p
          JOIN \`_rolepermissions\` rp ON p.id = rp.B
          WHERE rp.A IN (${roleIds.join(',')})
        `;

        // 应用权限
        if (rolePermissions && Array.isArray(rolePermissions)) {
          for (const permission of rolePermissions) {
            const action = permission.actionType.toLowerCase() as Action;
            const subject = permission.resourcePattern;

            // 解析条件表达式
            let conditions = {};
            if (permission.conditionExpression) {
              try {
                conditions = JSON.parse(permission.conditionExpression);
              } catch (e) {
                console.error(
                  'Invalid condition expression',
                  permission.conditionExpression,
                );
              }
            }

            // 添加多租户条件
            if (permission.resourceType !== 'SYSTEM' && user.tenantId) {
              conditions['tenantId'] = user.tenantId;
            }

            rules.push({ action, subject, conditions });
          }
        }
      }

      // 获取用户直接分配的权限
      // 注释掉这段代码，因为目前似乎没有用户权限表
      /*
      const userPermissions = await this.prisma.$queryRaw`
        SELECT p.*, up.allow FROM \`permissions\` p
        JOIN \`_userpermissions\` up ON p.id = up.B
        WHERE up.A = ${user.id}
      `;

      // 应用用户特殊权限
      if (userPermissions && Array.isArray(userPermissions)) {
        for (const up of userPermissions) {
          const action = up.actionType.toLowerCase() as Action;
          const subject = up.resourcePattern;

          let conditions = {};
          if (up.conditionExpression) {
            try {
              conditions = JSON.parse(up.conditionExpression);
            } catch (e) {
              console.error(
                'Invalid condition expression',
                up.conditionExpression,
              );
            }
          }

          if (up.resourceType !== 'SYSTEM' && user.tenantId) {
            conditions['tenantId'] = user.tenantId;
          }

          if (up.allow) {
            rules.push({ action, subject, conditions });
          } else {
            // 对于不允许的操作，在CASL中需要特殊处理
            // 目前简化处理，不添加不允许的规则
          }
        }
      }
      */
    } catch (error) {
      console.error('Error creating abilities:', error);
    }

    return createAppAbility(rules);
  }
}
