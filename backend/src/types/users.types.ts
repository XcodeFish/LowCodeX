/**
 * @deprecated 请使用模块内的类型定义
 * import { CreateUserDto, UpdateUserDto, ... } from '../modules/users/dto';
 * import { User, Role, Permission, ... } from '../modules/users/interfaces';
 */

export * from '../modules/users/dto';
export * from '../modules/users/interfaces';

// 由于无法直接从@prisma/client导入类型，我们自定义基础类型
export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  name?: string;
  avatar?: string;
  status: string;
  tenantId?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  tenantId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  id: string;
  name: string;
  code: string;
  description?: string;
  tenantId?: string;
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

// 用户查询参数
export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  roleId?: string;
  tenantId?: string;
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
  id: string;
  username: string;
  password: string;
  status: string;
  tenantId?: string;
}

// 角色创建DTO
export interface CreateRoleDto {
  name: string;
  description?: string;
  permissionIds?: string[];
  tenantId?: string;
}

// 角色更新DTO
export interface UpdateRoleDto {
  name?: string;
  description?: string;
  permissionIds?: string[];
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
