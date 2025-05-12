import React, { useEffect, lazy, Suspense, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Spin } from 'antd';
import { auth } from '../hooks';
import { AuthGuard } from '../components/common/AuthGuard';
import type { AppDispatch, RootState } from '../store';
import { protectedRoutes } from './protectedRoutes';

// 布局
const MainLayout = lazy(() => import('../layouts/MainLayout'));

// 认证页面
const Login = lazy(() => import('../pages/login'));
const Register = lazy(() => import('../pages/register'));
const ForgetPassword = lazy(() => import('../pages/profile/ForgetPassword'));

// 用户资料页面
const Profile = lazy(() => import('../pages/profile/index'));
const ChangePassword = lazy(() => import('../pages/profile/ChangePassword'));

// 基本页面
const Dashboard = lazy(() => import('../pages/dashboard'));
const NotFound = lazy(() => import('../pages/NotFound'));
const Forbidden = lazy(() => import('../pages/Forbidden'));

// 懒加载组件包装器
const LazyComponent = ({ children }: { children: React.ReactNode }) => (
  <Suspense
    fallback={
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <Spin size="large" tip="加载中..." fullscreen />
      </div>
    }
  >
    {children}
  </Suspense>
);

// 路由初始化加载组件
const RouterInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { getUserInfo } = auth.useAuth();
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const [initializing, setInitializing] = useState(true);

  // 应用启动时获取当前用户信息
  useEffect(() => {
    const token = localStorage.getItem('token');

    // 如果有token但未认证，尝试获取用户信息
    const initAuth = async () => {
      try {
        if (token && !isAuthenticated && !loading) {
          await getUserInfo();
        }
      } finally {
        // 无论认证成功与否，都完成初始化
        setInitializing(false);
      }
    };

    initAuth();
  }, [getUserInfo, isAuthenticated, loading]);

  // 在初始化阶段显示加载中
  if (initializing) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <Spin size="large" tip="应用初始化中..." fullscreen />
      </div>
    );
  }

  return <>{children}</>;
};

// 主路由组件
export const AppRouter: React.FC = () => {
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

  return (
    <BrowserRouter>
      <RouterInitializer>
        <Routes>
          {/* 公开路由 */}
          <Route path="/login" element={
            <LazyComponent>
              {isAuthenticated ? <Navigate to="/" /> : <Login />}
            </LazyComponent>
          } />

          <Route path="/auth/register" element={
            <LazyComponent>
              {isAuthenticated ? <Navigate to="/" /> : <Register />}
            </LazyComponent>
          } />

          <Route path="/profile/forget-password" element={
            <LazyComponent>
              {isAuthenticated ? <Navigate to="/" /> : <ForgetPassword />}
            </LazyComponent>
          } />

          <Route path="/403" element={
            <LazyComponent>
              <Forbidden />
            </LazyComponent>
          } />

          {/* 主应用路由 */}
          <Route path="/" element={
            <LazyComponent>
              <AuthGuard>
                <MainLayout />
              </AuthGuard>
            </LazyComponent>
          }>
            <Route index element={<Dashboard />} />

            {/* 个人资料相关路由 */}
            <Route path="profile" element={<Profile />} />
            <Route path="profile/change-password" element={<ChangePassword />} />

            {/* 添加受保护路由 */}
            {protectedRoutes.map((route) => (
              <Route
                key={route.path}
                path={route.path.replace(/^\//, '')} // 移除开头的斜杠，因为已经在父路由中定义了
                element={
                  <AuthGuard
                    requiredPermissions={route.requiredPermissions}
                    requiredRoles={route.requiredRoles}
                  >
                    <route.component />
                  </AuthGuard>
                }
              />
            ))}

            {/* 404路由 */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </RouterInitializer>
    </BrowserRouter>
  );
};

export default AppRouter;
