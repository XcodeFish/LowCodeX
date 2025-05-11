import { useSelector } from 'react-redux';
import type { RootState } from '../store';

type PermissionCheckType = 'every' | 'some';

/**
 * 权限检查钩子
 */
export const usePermission = () => {
  const { permissions, user } = useSelector((state: RootState) => state.auth);

  /**
   * 检查是否拥有指定权限
   * @param requiredPermissions 需要的权限列表
   * @param type 检查类型，默认为'every'，表示必须全部包含
   * @returns 是否拥有权限
   */
   const hasPermission = (requiredPermissions: string | string[], type: PermissionCheckType = 'every'): boolean => {
    if (!user) return false;

    if (typeof requiredPermissions === 'string') {
      return permissions.includes(requiredPermissions);
    }

    if (requiredPermissions.length === 0) {
      return true;
    }

    return type === 'every'
      ? requiredPermissions.every(permission => permissions.includes(permission))
      : requiredPermissions.some(permission => permissions.includes(permission));
  };

  /**
   * 检查是否拥有指定角色
   * @param requiredRoles 需要的角色列表
   * @returns 是否拥有角色
   */
  const hasRole = (requiredRoles: string | string[], type: PermissionCheckType = 'some'): boolean => {
    if (!user) return false;

    if (typeof requiredRoles === 'string') {
      return user.roles.some((role: any) => role.code === requiredRoles);
    }

    if (requiredRoles.length === 0) {
      return true;
    }

    const checkFunction = type === 'every' ? Array.prototype.every : Array.prototype.some;

    return checkFunction.call(
      requiredRoles,
      (roleCode: string) => user.roles.some((role: any) => role.code === roleCode)
    );
  };

  /**
   * 检查是否拥有访问资源的权限
   * @param resourceType 资源类型
   * @param resourceId 资源ID
   * @param action 操作类型
   * @returns 是否有权限
   */
  const hasResourcePermission = (resourceType: string, resourceId: string, action: string): boolean => {
    if (!user) return false;

    // 检查格式为 "resource:action:id" 的权限
    const specificPermission = `${resourceType}:${action}:${resourceId}`;
    if (permissions.includes(specificPermission)) return true;

    // 检查格式为 "resource:action:*" 的权限（通配符）
    const wildcardPermission = `${resourceType}:${action}:*`;
    if (permissions.includes(wildcardPermission)) return true;

    // 检查格式为 "resource:*:id" 的权限
    const resourceWildcardPermission = `${resourceType}:*:${resourceId}`;
    if (permissions.includes(resourceWildcardPermission)) return true;

    // 检查格式为 "resource:*:*" 的权限
    const fullWildcardPermission = `${resourceType}:*:*`;
    if (permissions.includes(fullWildcardPermission)) return true;

    return false;
  };

  return {
    hasPermission,
    hasRole,
    hasResourcePermission,
    isAuthenticated: !!user,
    permissions,
    userRoles: user?.roles || []
  };
}
