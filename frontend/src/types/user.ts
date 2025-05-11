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
