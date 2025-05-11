/**
 * API接口通用类型定义
 */

// API状态码枚举
export enum ApiCode {
  SUCCESS = 200,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_ERROR = 500,
  SERVICE_UNAVAILABLE = 503
}

// API响应通用结构
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T | null;
  timestamp: number;
}

// 分页数据结构
export interface PaginationData<T = any> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// 分页查询参数
export interface PaginationParams {
  page: number;
  pageSize: number;
  [key: string]: any;
}

// 基础实体接口，包含通用字段
export interface BaseEntity {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

/**
 * 响应数据类型助手工具类型
 */

// 提取API响应中的数据类型
export type ApiData<T> = T extends ApiResponse<infer U> ? U : never;

// 列表数据响应类型
export type ApiListResponse<T> = ApiResponse<PaginationData<T>>;

// 单项数据响应类型
export type ApiItemResponse<T> = ApiResponse<T>;

/**
 * 常用HTTP方法返回类型定义
 */
export interface ApiClient {
  get<T = any>(url: string, params?: any): Promise<ApiResponse<T>>;
  post<T = any>(url: string, data?: any): Promise<ApiResponse<T>>;
  put<T = any>(url: string, data?: any): Promise<ApiResponse<T>>;
  delete<T = any>(url: string, params?: any): Promise<ApiResponse<T>>;
  patch<T = any>(url: string, data?: any): Promise<ApiResponse<T>>;
}

/**
 * 错误处理类型
 */
export interface ApiError {
  code: number;
  message: string;
  data: null;
  timestamp: number;
}
