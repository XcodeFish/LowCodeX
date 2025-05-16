import { SetMetadata } from '@nestjs/common';
import { PolicyHandler } from '../interfaces/policy-handler.interface';
import { Action } from '../ability.factory';

/**
 * 用于标记需要特定权限的路由的元数据键
 */
export const CHECK_ABILITY_KEY = 'check_ability';

/**
 * 检查能力装饰器
 * 用于标记需要特定权限的路由
 * @param handlers 策略处理程序列表
 */
export const CheckAbility = (...handlers: PolicyHandler[]) =>
  SetMetadata(CHECK_ABILITY_KEY, handlers);

/**
 * 资源权限参数接口
 */
export interface ResourcePermission {
  action: Action;
  subject: string;
  conditions?: any;
}

/**
 * 权限检查装饰器
 * 用于快速标记需要特定操作和资源权限的路由
 * @param permission 权限参数对象
 */
export const RequirePermission = (permission: ResourcePermission) =>
  CheckAbility((ability) =>
    ability.can(permission.action, permission.subject, permission.conditions),
  );

/**
 * 多权限检查装饰器
 * 用于检查多个权限，所有权限都必须满足才能通过校验
 * @param permissions 权限参数对象数组
 */
export const CheckPermissions = (permissions: ResourcePermission[]) =>
  CheckAbility((ability) =>
    permissions.every((permission) =>
      ability.can(permission.action, permission.subject, permission.conditions),
    ),
  );

/**
 * 单一权限检查装饰器(字符串形式)
 * 用于支持字符串格式的权限声明，向后兼容
 * @param permissionString 权限字符串，格式为"action:subject"
 */
export const CheckPermission = (permissionString: string) =>
  CheckAbility((ability) => {
    const [action, subject] = permissionString.split(':');
    return ability.can(action as Action, subject);
  });
