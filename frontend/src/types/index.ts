// 通用响应类型
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

// 分页请求参数
export interface PaginationParams {
  page: number;
  pageSize: number;
}

// 分页响应数据
export interface PaginationResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

// 用户信息类型
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role: string[];
  tenantId: string;
}

// 可以导出更多类型
