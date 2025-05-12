import type { ProfileUpdateParams } from '../types/user';
import request, { markErrorAsHandled } from './request';

// 用户服务
export const userService = {
  // 更新用户资料
  async updateProfile(id: string, params: ProfileUpdateParams) {
    try {
      const response = await request.put(`/v1/users/update/${id}`, params);
      return response.data;
    } catch (error) {
      // 确保错误被标记为已处理
      markErrorAsHandled(error);
      throw error;
    }
  },

  // 更新头像
  async updateAvatar(file: File) {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await request.post('/v1/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      return response.data;
    } catch (error) {
      // 确保错误被标记为已处理
      markErrorAsHandled(error);
      throw error;
    }
  },

  // 修改密码
  async changePassword(oldPassword: string, newPassword: string) {
    try {
      const response = await request.put('/v1/users/password', {
        oldPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      // 确保错误被标记为已处理
      markErrorAsHandled(error);
      throw error;
    }
  }
};
