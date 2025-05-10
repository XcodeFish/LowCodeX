import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * 角色权限装饰器，用于控制接口访问权限
 * 使用方式: @Roles('admin', 'manager')
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
