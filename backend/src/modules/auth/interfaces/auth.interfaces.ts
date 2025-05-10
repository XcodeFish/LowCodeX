/**
 * 认证模块接口定义
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

import { Request } from 'express';
import { UserWithRelations } from '../../users/interfaces/users.interfaces';

// 登录响应
export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: UserWithRelations;
  expiresIn: number;
}

// 令牌更新响应
export interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

// JWT令牌负载
export interface JwtPayload {
  sub: string; // 用户ID
  username?: string; // 用户名，可选
  tenantId?: string; // 租户ID
  roles?: string[]; // 角色代码列表
  permissions?: string[]; // 权限代码列表
  iat?: number; // 签发时间
  exp?: number; // 过期时间
}

// 带用户的请求类型
export interface RequestWithUser extends Request {
  user: UserWithRelations;
}
