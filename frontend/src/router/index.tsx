import React, { useEffect, lazy, Suspense, useState, useRef } from 'react';
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
  const [authError, setAuthError] = useState<string | null>(null);
  const initAttemptedRef = useRef(false);

  // 应用启动时获取当前用户信息 - 只在首次加载时执行一次
  useEffect(() => {
    // 防止重复初始化
    if (initAttemptedRef.current) {
      return;
    }

    initAttemptedRef.current = true;

    const token = localStorage.getItem('token');

    // 如果没有token，直接完成初始化
    if (!token) {
      setInitializing(false);
      return;
    }

    // 如果有token但未认证，尝试获取用户信息
    const initAuth = async () => {
      try {
        // 清除可能遗留的错误计数（确保使用一致的key）
        const storageKey = 'networkErrorCount:/v1/auth/me';
        const connectionErrorCount = parseInt(localStorage.getItem(storageKey) || '0', 10);

        // 如果连接错误超过阈值，清除token并停止尝试
        if (connectionErrorCount >= 3) {
          console.error('后端服务连接失败次数过多，清除认证状态');
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem(storageKey);
          setAuthError('服务器连接失败，请稍后再试');
          setInitializing(false);
          return;
        }

        if (!isAuthenticated) {
          try {
            await getUserInfo();
            // 成功获取用户信息后重置错误计数
            localStorage.removeItem(storageKey);
          } catch (error: any) {
            console.error('获取用户信息失败:', error);
            // 如果已经处于加载状态，不要继续尝试（防止重复请求）
            if (loading) {
              console.warn('已有请求正在进行中，跳过重复请求');
              return;
            }

            // 只有在连接错误时增加计数（ERR_CONNECTION_REFUSED）
            if (error.message === 'Network Error') {
              const newCount = connectionErrorCount + 1;
              localStorage.setItem(storageKey, newCount.toString());
              console.warn(`服务器连接失败 (${newCount}/3)`);

              if (newCount >= 3) {
                setAuthError('服务器连接失败，请稍后再试');
                localStorage.removeItem('token');
              }
            }
          }
        }
      } catch (error) {
        console.error('认证初始化错误:', error);
      } finally {
        // 无论认证成功与否，都完成初始化
        setInitializing(false);
      }
    };

    initAuth();
  }, []); // 空依赖数组，只在组件挂载时执行一次

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

  // 如果有认证错误，显示错误信息
  if (authError) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column'
      }}>
        <h2>连接错误</h2>
        <p>{authError}</p>
        <a href="/login" style={{ marginTop: '16px' }}>返回登录页</a>
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
