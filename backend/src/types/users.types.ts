// 由于无法直接从@prisma/client导入类型，我们自定义基础类型
export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  name?: string;
  avatar?: string;
  status: string;
  tenantId?: number;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  tenantId?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  id: number;
  name: string;
  code: string;
  description?: string;
  tenantId?: number;
  createdAt: Date;
  updatedAt: Date;
}

// 用户相关类型定义
export interface UserWithRelations extends User {
  roles?: RoleWithRelations[];
}

export interface RoleWithRelations extends Role {
  permissions?: Permission[];
}

// 用户创建请求DTO
export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  name?: string;
  avatar?: string;
  status?: string;
  roleIds?: number[];
  tenantId?: number;
}

// 用户更新请求DTO
export interface UpdateUserDto {
  username?: string;
  email?: string;
  password?: string;
  name?: string;
  avatar?: string;
  status?: string;
  roleIds?: number[];
}

// 用户查询参数
export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  roleId?: number;
  tenantId?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 分页响应结构
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 用户分页查询响应
export type PaginatedUsersResponse = PaginatedResponse<UserWithRelations>;

// 用户认证信息
export interface UserAuth {
  id: number;
  username: string;
  password: string;
  status: string;
  tenantId?: number;
}

// 角色创建DTO
export interface CreateRoleDto {
  name: string;
  description?: string;
  permissionIds?: number[];
  tenantId?: number;
}

// 角色更新DTO
export interface UpdateRoleDto {
  name?: string;
  description?: string;
  permissionIds?: number[];
}

// 权限创建DTO
export interface CreatePermissionDto {
  name: string;
  code: string;
  description?: string;
  resourceType: string;
  actionType: string;
  resourcePattern: string;
  conditionExpression?: string;
}

// 权限更新DTO
export interface UpdatePermissionDto {
  name?: string;
  description?: string;
  resourceType?: string;
  actionType?: string;
  resourcePattern?: string;
  conditionExpression?: string;
}
