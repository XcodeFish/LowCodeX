// 创建新用户请求类型
export interface CreateUserRequest {
  username: string;
  password: string;
  email: string;
  name: string;
  avatar?: string;
  roleIds?: string[];
  status?: string;
  tenantId?: string;
}

export interface User {
  username: string;
  email: string;
  userId?: string;
  tenantId?: string;
}

export interface UserInfo {
  username: string;
  email: string;
  id: string;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
  roles: string[];
  tenantId?: string;
  avatar?: string;
}

// 用户状态枚举
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  LOCKED = 'locked'
}

// 角色类型定义
export interface Role {
  id: string;
  code: string;
  name: string;
  type: 'system' | 'tenant' | 'application';
  applicationId?: string;
}

// 注册参数定义
export interface RegisterParams {
  username: string;
  password: string;
  email: string;
  tenantId?: string;
}

// 修改密码参数
export interface ChangePasswordParams {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// 重置密码参数
export interface ResetPasswordParams {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// 用户资料更新参数
export interface ProfileUpdateParams {
  username?: string;
  email?: string;
  avatar?: string;
  password?: string;
  name?: string;
  status?: string;
  roles?: string[];

}
