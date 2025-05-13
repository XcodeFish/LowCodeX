import { usePermission } from '../../../hooks';
import React, { ReactNode } from 'react';

interface PermissionWrapperProps {
  requiredPermissions?: string[];
  requiredRoles?: string[];
  permissionType?: 'every' | 'some';
  roleType?: 'every' | 'some';
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * 组件级权限控制包装器
 */
export const PermissionWrapper: React.FC<PermissionWrapperProps> = ({
  requiredPermissions = [],
  requiredRoles = [],
  permissionType = 'every',
  roleType = 'some',
  fallback = null,
  children
}) => {
  const { hasPermission, hasRole } = usePermission();

  // 检查权限
  const hasRequiredPermissions = requiredPermissions.length === 0
    || hasPermission(requiredPermissions, permissionType);

  // 检查角色
  const hasRequiredRoles = requiredRoles.length === 0
    || hasRole(requiredRoles, roleType);

  // 如果没有所需权限或角色，显示fallback或返回null
  if (!hasRequiredPermissions || !hasRequiredRoles) {
    return <>{fallback}</>;
  }

  // 通过所有检查，渲染子组件
  return <>{children}</>;
};
