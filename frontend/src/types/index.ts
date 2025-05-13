// Re-export all types from individual type definition files
export * from './auth';
export * from './user';
export * from './model-types'; // Ensure this is present and correct

// Explicitly re-export Model, ModelField, and FieldType for robustness
export type { Model, ModelField } from './model-types';

// Re-export API related types from constants for backward compatibility
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

// It seems 'User' interface was defined here directly,
// if it's not in './user.ts' it should be moved there or kept here if it's a general project-wide User type
// For now, I'll assume it might be a general type and keep it, but ideally it should be in './user.ts'
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role: string[];
  tenantId: string;
}
