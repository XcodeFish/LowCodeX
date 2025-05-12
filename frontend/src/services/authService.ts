import { type authTypes } from '../types';
import request, { markErrorAsHandled } from './request';

// 认证服务
export const authService = {

  // 登录
  async login(params: authTypes.LoginRequest) {
    try {
      const response = await request.post<authTypes.LoginResponse>('/v1/auth/login', params);
      return response;
    } catch (error) {
      // 确保错误被标记为已处理
      markErrorAsHandled(error);
      throw error;
    }
  },

  // 注册
  async register(params: authTypes.RegisterUserRequest) {
    try {
      const response = await request.post<authTypes.RegisterUserResponse>('/v1/auth/register', params);
      return response;
    } catch (error) {
      // 确保错误被标记为已处理
      markErrorAsHandled(error);
      throw error;
    }
  },

  // 刷新token
  async refreshToken() {
    try {
      const response = await request.post<authTypes.RefreshTokenResponse>('/v1/auth/refresh-token', {
        refreshToken: localStorage.getItem('refreshToken'),
      });
      return response;
    } catch (error) {
      // 确保错误被标记为已处理
      markErrorAsHandled(error);
      throw error;
    }
  },

  // 登出
  async logout() {
    try {
      const response = await request.post<authTypes.LogoutResponse>('/v1/auth/logout');
      return response;
    } catch (error) {
      // 确保错误被标记为已处理
      markErrorAsHandled(error);
      throw error;
    }
  },

  // 获取当前用户信息
  async getUserInfo() {
    try {
      const response = await request.get<authTypes.GetUserInfoResponse>('/v1/auth/me');
      return response;
    } catch (error) {
      // 确保错误被标记为已处理
      markErrorAsHandled(error);
      throw error;
    }
  }
}
