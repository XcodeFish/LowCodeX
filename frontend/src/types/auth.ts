import type { UserInfo } from './user';
// 通用响应类型
export interface CommonResponse<T> {
  message: string;
  code: string | number;
  data: T;
  timestamp?: string;
}

// 注册用户请求类型
export interface RegisterUserRequest {
  username: string;
  password: string;
  email: string;
  name: string;
  tenantId?: string;
}

// 注册用户响应类型
export interface RegisterUserResponse {
  message: string;
  code: string | number;
  data: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
  timestamp?: string;
}

// 登录请求类型
export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

// 登录响应类型
export interface LoginResponse {
  message: string;
  code: string | number;
  data: {
    accessToken: string;
    expiresIn: number;
    refreshToken: string;
    user: UserInfo;
  };
  timestamp?: string;
}

// 刷新令牌请求类型
export interface RefreshTokenRequest {
  refreshToken: string;
}

// 刷新令牌响应类型
export interface RefreshTokenResponse {
  message: string;
  code: string | number;
  data: {
    accessToken: string;
    expiresIn: number;
    refreshToken: string;
  };
  timestamp?: string;
}

// 退出登录响应类型
export interface LogoutResponse {
  message: string;
  code: string | number;
  data: {
    success: boolean;
    message: string;
  };
  timestamp?: string;
}

// 获取用户信息响应类型
export interface GetUserInfoResponse {
  message: string;
  code: string | number;
  data: UserInfo;
  timestamp?: string;
}

