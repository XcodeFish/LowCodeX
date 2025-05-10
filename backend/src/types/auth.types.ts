import { UserWithRelations } from './users.types';

/**
 * @deprecated 请使用模块内的类型定义
 * import { LoginDto, RegisterDto, RefreshTokenDto } from '../modules/auth/dto';
 * import { LoginResponse, TokenResponse, JwtPayload } from '../modules/auth/interfaces';
 */

export * from '../modules/auth/dto';
export * from '../modules/auth/interfaces';

// 登录请求DTO
export interface LoginDto {
  username: string;
  password: string;
  rememberMe?: boolean;
}

// 注册请求DTO
export interface RegisterDto {
  username: string;
  email: string;
  password: string;
  name?: string;
  tenantId?: string;
}

// 登录响应
export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: UserWithRelations;
  expiresIn: number;
}

// 刷新令牌请求DTO
export interface RefreshTokenDto {
  refreshToken: string;
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
