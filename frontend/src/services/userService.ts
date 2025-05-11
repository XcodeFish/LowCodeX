import axios from 'axios';
import type { ProfileUpdateParams } from '../types/user';

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
);

// 用户服务
export const userService = {
  // 更新用户资料
  async updateProfile(id: string, params: ProfileUpdateParams) {
    const response = await apiClient.put(`/v1/users/update/${id}`, params);
    return response.data;
  },

  // 更新头像
  async updateAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await apiClient.post('/v1/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    return response.data;
  },

  // 修改密码
  async changePassword(oldPassword: string, newPassword: string) {
    const response = await apiClient.put('/v1/users/password', {
      oldPassword,
      newPassword
    });
    return response.data;
  }
};
