import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AbilityFactory } from '../ability.factory';
import { CHECK_ABILITY_KEY } from '../decorators/check-permission.decorator';
import { PolicyHandler } from '../interfaces/policy-handler.interface';
import { SKIP_AUTH_KEY } from '../decorators/skip-auth.decorator';
import {
  AuditLogService,
  AuditLogAction,
} from '../../system/services/audit-log.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  private readonly logger = new Logger(PermissionGuard.name);

  constructor(
    private reflector: Reflector,
    private abilityFactory: AbilityFactory,
    private auditLogService: AuditLogService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 检查是否标记了跳过身份验证
    const skipAuth = this.reflector.getAllAndOverride<boolean>(SKIP_AUTH_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skipAuth) {
      return true; // 跳过权限检查
    }

    // 获取权限策略处理程序
    const policyHandlers =
      this.reflector.get<PolicyHandler[]>(
        CHECK_ABILITY_KEY,
        context.getHandler(),
      ) || [];

    if (policyHandlers.length === 0) {
      return true; // 没有定义策略，直接通过
    }

    // 获取请求中的用户信息
    const request = context.switchToHttp().getRequest();
    const { user } = request;

    if (!user || !user.userId) {
      this.logger.warn('权限检查失败：用户未认证');
      throw new ForbiddenException('用户未认证，无法执行该操作');
    }

    try {
      // 获取当前操作的路由信息
      const handler = context.getHandler();
      const controller = context.getClass();
      const resource = `${controller.name}.${handler.name}`;

      // 创建用户能力实例
      const ability = await this.abilityFactory.createForUser(user);

      // 检查所有策略
      const results = await Promise.all(
        policyHandlers.map((handler) =>
          typeof handler === 'function'
            ? handler(ability)
            : handler.handle(ability),
        ),
      );

      // 如果任何策略失败，则拒绝访问
      if (results.some((result) => !result)) {
        // 记录权限不足的审计日志
        this.auditLogService.log({
          userId: user.userId,
          tenantId: user.tenantId || '',
          action: AuditLogAction.CUSTOM,
          resource,
          description: '权限不足，访问被拒绝',
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
        });

        this.logger.warn(
          `用户 ${user.userId} 访问 ${resource} 被拒绝：权限不足`,
        );
        throw new ForbiddenException('权限不足，无法执行该操作');
      }

      // 记录权限检查通过的审计日志
      this.auditLogService.log({
        userId: user.userId,
        tenantId: user.tenantId || '',
        action: AuditLogAction.CUSTOM,
        resource,
        description: '权限检查通过',
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      });

      return true;
    } catch (error) {
      this.logger.error(`权限检查错误: ${error.message}`, error.stack);

      if (error instanceof ForbiddenException) {
        throw error;
      }

      throw new ForbiddenException('权限检查过程中发生错误');
    }
  }
}
