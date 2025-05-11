import * as authTypes from './auth';
import * as userTypes from './user';

// 从constants中重新导出API相关类型，保持向后兼容
export type {
  ApiResponse,
  PaginationData,
  PaginationParams,
  BaseEntity,
  ApiData,
  ApiListResponse,
  ApiItemResponse,
  ApiClient,
  ApiError
} from '../constants/api';
export { ApiCode } from '../constants/api';

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
export { authTypes, userTypes };
