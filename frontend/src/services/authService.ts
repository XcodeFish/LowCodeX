import axios from 'axios';

import { ApiCode, type authTypes } from '../types';

// 创建API客户端实例
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 添加请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
)

// 添加响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    if (response.data.code === ApiCode.SUCCESS) {
      return response.data.data;
    } else {
      return Promise.reject(response.data.message || '请求失败');
    }
  },
  async (error) => {
    const originalRequest = error.config;

    // 处理token过期问题
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
     try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        return Promise.reject(error);
      }
      const response = await apiClient.post('/v1/auth/refresh-token', {
        refreshToken,
      });
      const { accessToken } = response.data;
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
         // 更新请求头并重试
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
     } catch (refreshError) {
      // 刷新token失败，清除登录状态
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);

     }
    }
    return Promise.reject(error);
  }
);

// 认证服务
export const authService = {

  // 登录
  async login(params: authTypes.LoginRequest) {
    const response = await apiClient.post<authTypes.LoginResponse>('/v1/auth/login', params);
    return response.data;
  },

  // 注册
  async register(params: authTypes.RegisterUserRequest) {
    const response = await apiClient.post<authTypes.RegisterUserResponse>('/v1/auth/register', params);
    return response.data;
  },

  // 刷新token
  async refreshToken() {
    const response = await apiClient.post<authTypes.RefreshTokenResponse>('/v1/auth/refresh-token', {
      refreshToken: localStorage.getItem('refreshToken'),
    });
    return response.data;
  },

  // 登出
  async logout() {
    const response = await apiClient.post<authTypes.LogoutResponse>('/v1/auth/logout');
    return response.data;
  },

  // 获取当前用户信息
  async getUserInfo() {
    const response = await apiClient.get<authTypes.GetUserInfoResponse>('/v1/auth/me');
    return response.data;
  }

}
