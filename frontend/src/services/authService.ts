
import type {
  LoginRequest,
  LoginResponse,
  RegisterUserRequest,
  RegisterUserResponse,
  RefreshTokenResponse,
  LogoutResponse,
  GetUserInfoResponse,
} from '../types';
import request, { markErrorAsHandled } from './request';

// 认证服务
export const authService = {
  // 登录
  async login(params: LoginRequest) {
    try {
      const response = await request.post<LoginResponse>('/v1/auth/login', params);
      return response;
    } catch (error) {
      // 确保错误被标记为已处理
      markErrorAsHandled(error);
      throw error;
    }
  },

  // 注册
  async register(params: RegisterUserRequest) {
    try {
      const response = await request.post<RegisterUserResponse>('/v1/auth/register', params);
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
      const response = await request.post<RefreshTokenResponse>('/v1/auth/refresh-token', {
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
      const response = await request.post<LogoutResponse>('/v1/auth/logout');
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
      const response = await request.get<GetUserInfoResponse>('/v1/auth/me');
      return response;
    } catch (error) {
      // 确保错误被标记为已处理
      markErrorAsHandled(error);
      throw error;
    }
  }
}
