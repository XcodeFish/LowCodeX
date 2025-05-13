import { useSelector } from 'react-redux';
import { authService } from '../../../services/authService';
import {
  setLoginResult,
  setUserInfo,
  clearUserSession,
  setLoading,
  setError,
  selectIsAuthenticated,
  selectCurrentUser,
  selectLoading,
  selectError
} from '../../../store/slices/authSlice';
import type { LoginRequest } from '../../../types';
import { useAppDispatch } from '../../useAppDispatch';
import React from 'react';

/**
 * 认证相关的业务逻辑钩子
 * 处理登录、登出、获取用户信息等认证相关业务
 */
export const useAuth = () => {
  const dispatch = useAppDispatch();

  // 从Redux store获取状态
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectCurrentUser);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);

  // 最后一次请求状态
  const lastRequestRef = React.useRef({
    userInfoLastAttempt: 0,
    userInfoRequestInProgress: false
  });

  /**
   * 执行登录操作
   * @param params 登录参数
   * @returns 登录结果
   */
  const login = async (params: LoginRequest) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const response = await authService.login(params);

      if (response && response.data) {
        const { accessToken, refreshToken, user } = response.data;

        // 存储token
        if (accessToken) {
          localStorage.setItem('token', accessToken);

          // 确保refreshToken存在，即使后端没有返回也要处理
          if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
            // 静默处理，不输出日志
          }

          // 处理"记住我"功能
          if (params.rememberMe) {
            localStorage.setItem('rememberedUsername', params.username);
          } else {
            localStorage.removeItem('rememberedUsername');
          }

          // 重置错误计数
          localStorage.removeItem('networkErrorCount:/v1/auth/me');
        }

        // 更新Redux状态
        dispatch(setLoginResult({ user }));
        return { success: true };
      }

      return { success: false, error: '登录失败，返回数据格式错误' };
    } catch (error: any) {
      console.error('登录错误:', error);
      const errorMsg = error.response?.data?.message || '登录失败，请检查用户名和密码';
      dispatch(setError(errorMsg));
      return { success: false, error: errorMsg };
    } finally {
      dispatch(setLoading(false));
    }
  };

  /**
   * 获取当前用户信息
   * @returns 用户信息获取结果
   */
  const getUserInfo = async () => {
    // 防止重复请求：如果已有请求正在进行中，返回等待状态
    if (lastRequestRef.current.userInfoRequestInProgress) {
      console.warn('[Auth] getUserInfo: 已有请求正在进行中，跳过重复请求');
      return { success: false, error: '请求正在进行中', pending: true };
    }

    // 防止频繁请求：如果距离上次请求不到1秒，跳过
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestRef.current.userInfoLastAttempt;
    if (timeSinceLastRequest < 1000) { // 1秒内不重复请求
      console.warn('[Auth] getUserInfo: 请求过于频繁，跳过', { timeSinceLastRequest });
      return { success: false, error: '请求过于频繁', tooFrequent: true };
    }

    // 更新最后请求时间和状态
    lastRequestRef.current.userInfoLastAttempt = now;
    lastRequestRef.current.userInfoRequestInProgress = true;

    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      // 检查是否已达到网络错误重试上限
      const storageKey = 'networkErrorCount:/v1/auth/me';
      const errorCount = parseInt(localStorage.getItem(storageKey) || '0', 10);
      if (errorCount >= 3) {
        console.warn('[Auth] auth/me接口连接失败次数过多，暂停请求');
        return { success: false, error: '服务器连接失败，请稍后再试' };
      }

      const response = await authService.getUserInfo();

      if (response && response.data) {
        const user = response.data;
        const permissions = user.roles || [];

        dispatch(setUserInfo({ user, permissions }));

        // 成功获取用户信息，重置错误计数
        localStorage.removeItem(storageKey);

        return { success: true, user };
      }

      return { success: false, error: '获取用户信息失败，返回数据格式错误' };
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || '获取用户信息失败';

      // 如果是网络错误，记录详细信息
      if (error.message === 'Network Error') {
        console.warn('[Auth] 网络连接错误:', error);
      }

      dispatch(setError(errorMsg));
      return { success: false, error: errorMsg };
    } finally {
      dispatch(setLoading(false));
      // 重置请求状态
      lastRequestRef.current.userInfoRequestInProgress = false;
    }
  };

  /**
   * 退出登录
   * @returns 登出结果
   */
  const logout = async () => {
    try {
      dispatch(setLoading(true));

      // 调用登出API
      await authService.logout();

      // 清除本地存储
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('rememberedUsername');

      // 更新Redux状态
      dispatch(clearUserSession());
      return { success: true };
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || '登出失败';
      dispatch(setError(errorMsg));
      return { success: false, error: errorMsg };
    } finally {
      dispatch(setLoading(false));
    }
  };

  /**
   * 判断是否已认证
   * @returns 是否已认证
   */
  const checkAuth = () => {
    const token = localStorage.getItem('token');
    return Boolean(token && isAuthenticated);
  };

  /**
   * 清除认证错误
   */
  const clearAuthError = () => {
    dispatch(setError(null));
  };

  /**
   * 获取记住的用户名
   * @returns 记住的用户名
   */
  const getRememberedUsername = () => {
    return localStorage.getItem('rememberedUsername') || '';
  };

  return {
    login,
    logout,
    getUserInfo,
    checkAuth,
    clearAuthError,
    getRememberedUsername,
    isAuthenticated,
    currentUser,
    loading,
    error
  };
};

export default useAuth;
