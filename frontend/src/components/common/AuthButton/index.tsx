import React from 'react';
import { Button, type ButtonProps } from 'antd';
import { usePermission } from '@/hooks/usePermission';

interface AuthButtonProps extends ButtonProps {
  requiredPermissions?: string[];
  requiredRoles?: string[];
  permissionType?: 'every' | 'some';
  roleType?: 'every' | 'some';
  fallback?: React.ReactNode;
}

/**
 * 带权限控制的按钮组件
 */
export const AuthButton: React.FC<AuthButtonProps> = ({
  requiredPermissions = [],
  requiredRoles = [],
  permissionType = 'every',
  roleType = 'some',
  fallback = null,
  ...buttonProps
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

  // 通过所有检查，渲染按钮
  return <Button {...buttonProps} />;
};
