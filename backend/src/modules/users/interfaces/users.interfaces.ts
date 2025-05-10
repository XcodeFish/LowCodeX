/**
 * 用户模块接口定义
 *
 * 注意：为了提高安全性和系统设计的健壮性，我们正在将所有ID字段从数字类型(number)
 * 迁移到UUID字符串类型(string)。完成此迁移需要以下步骤：
 *
 * 1. 更新Prisma模型，将ID字段类型从Int改为String，并设置@default(uuid())
 * 2. 运行prisma migrate生成迁移脚本
 * 3. 更新所有服务实现中的ID处理逻辑
 * 4. 更新API端点以适应UUID
 *
 * 此文件中的接口已经更新为使用string类型的ID，但实际实现可能仍在使用number类型。
 * 在完成完整迁移之前，某些操作可能会遇到类型不匹配的问题。
 */

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

// 用户认证信息
export interface UserAuth {
  id: string;
  username: string;
  password: string;
  status: string;
  tenantId?: string;
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
