import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usePermission } from '@/hooks/usePermission';
import { Spin } from 'antd';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  requiredRoles?: string[];
  permissionType?: 'every' | 'some';
  roleType?: 'every' | 'some';
  redirectPath?: string;
}

/**
 * 路由级权限守卫组件
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requiredPermissions = [],
  requiredRoles = [],
  permissionType = 'every',
  roleType = 'some',
  redirectPath = '/login'
}) => {
  const { hasPermission, hasRole, isAuthenticated } = usePermission();
  const location = useLocation();
  const { loading } = useSelector((state: RootState) => state.auth);

  // 如果正在加载用户信息，显示加载状态
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  // 如果未登录，重定向到登录页面
  if (!isAuthenticated) {
    // 保存当前位置，登录后可以返回
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // 检查权限
  const hasRequiredPermissions = requiredPermissions.length === 0
    || hasPermission(requiredPermissions, permissionType);

  // 检查角色
  const hasRequiredRoles = requiredRoles.length === 0
    || hasRole(requiredRoles, roleType);

  // 如果没有所需权限或角色，重定向到403页面
  if (!hasRequiredPermissions || !hasRequiredRoles) {
    return <Navigate to="/403" replace />;
  }

  // 通过所有检查，渲染子组件
  return <>{children}</>;
};
