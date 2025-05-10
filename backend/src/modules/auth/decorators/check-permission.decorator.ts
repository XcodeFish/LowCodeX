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
