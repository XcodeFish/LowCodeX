/**
 * 表单模板类型定义
 */
export interface IForm {
  id: string;
  code: string;
  name: string;
  schema: string;
  description?: string;
  status: 'draft' | 'published' | 'archived';
  version: number;
  createdAt: Date;
  updatedAt: Date;
  archivedAt?: Date;
}

/**
 * 表单数据类型定义
 */
export interface IFormData {
  id: string;
  formId: string;
  data: string;
  version: number;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
}
