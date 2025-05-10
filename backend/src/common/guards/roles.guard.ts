import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserInfo } from '../decorators/current-user.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // 如果没有设置@Roles装饰器，则允许访问
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // 如果没有用户信息，则拒绝访问
    if (!user) {
      throw new ForbiddenException('未授权的访问');
    }

    const typedUser = user as UserInfo;

    // 检查用户是否拥有所需角色
    const hasRequiredRole = requiredRoles.some((role) =>
      typedUser.roles?.includes(role),
    );

    if (!hasRequiredRole) {
      throw new ForbiddenException('权限不足，无法访问该资源');
    }

    return true;
  }
}
