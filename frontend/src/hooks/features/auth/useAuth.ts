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
import { authTypes } from '../../../types';
import { useAppDispatch } from '../../useAppDispatch';

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

  /**
   * 执行登录操作
   * @param params 登录参数
   * @returns 登录结果
   */
  const login = async (params: authTypes.LoginRequest) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const response = await authService.login(params);

      if (response && response.data) {
        const { accessToken, refreshToken, user } = response.data;

        // 存储token
        if (accessToken && refreshToken) {
          localStorage.setItem('token', accessToken);
          localStorage.setItem('refreshToken', refreshToken);

          // 处理"记住我"功能
          if (params.rememberMe) {
            localStorage.setItem('rememberedUsername', params.username);
          } else {
            localStorage.removeItem('rememberedUsername');
          }
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
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const response = await authService.getUserInfo();

      if (response && response.data) {
        const user = response.data;
        const permissions = user.roles || [];

        dispatch(setUserInfo({ user, permissions }));
        return { success: true, user };
      }

      return { success: false, error: '获取用户信息失败，返回数据格式错误' };
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || '获取用户信息失败';
      dispatch(setError(errorMsg));
      return { success: false, error: errorMsg };
    } finally {
      dispatch(setLoading(false));
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
