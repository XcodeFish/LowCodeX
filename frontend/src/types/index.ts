// Re-export all types from individual type definition files
export * from './auth';
export * from './user';
export * from './data-models';


// 数据模型类型导出
export {
  FieldType,
  RelationType,
  ValidationRuleType,
  TableStatus,
  BusinessRuleType,
  type ValidationRule,
  type EnumOption,
  type BusinessRule,
  type FieldAdvancedSettings,
  type MetaField,
  type MetaRelation,
  type MetaTable,
  type MetaVersion,
  type CompleteModel,
  type CreateMetaTableDto,
  type CreateMetaFieldDto,
  type CreateMetaRelationDto,
  type CreateMetaVersionDto,
  type ModelExportData,
  type BackendApiResponse,
  type PagedResponse,
  type CreateCompleteModelRequest,
  type CreateCompleteModelResponse,
  type PublishModelResponse,
  type CloneModelRequest,
  type CloneModelResponse,
  type ImportModelRequest,
  type ImportModelResponse,
} from './data-models';

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

// DataModelApiResponse是后端API通用响应类型
export type DataModelApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
