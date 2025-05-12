export enum FieldType {
  STRING = 'string',
  NUMBER = 'number',
  INTEGER = 'integer',
  FLOAT = 'float',
  BOOLEAN = 'boolean',
  DATE = 'date',
  DATETIME = 'datetime',
  TIME = 'time',
  ENUM = 'enum',
  REFERENCE = 'reference',
  FILE = 'file',
  IMAGE = 'image',
  JSON = 'json',
  ARRAY = 'array',
  RICH_TEXT = 'richText',
  URL = 'url',
  EMAIL = 'email',
  PHONE = 'phone',
  COLOR = 'color',
  GEO = 'geo'
}

export type ValidationRuleType = 'required' | 'format' | 'range' | 'length' | 'custom' | 'regex' | 'unique';

export type ValidationRule = {
  type: ValidationRuleType;
  message: string;
  pattern?: string;
  min?: number;
  max?: number;
  expression?: string;
};

export interface ModelField {
  id: string;
  name: string;
  displayName: string;
  type: FieldType;
  isRequired: boolean;
  isPrimaryKey: boolean;
  isUnique: boolean;
  defaultValue?: any;
  description?: string;
  validationRules: ValidationRule[];
  enumValues?: string[];
  referenceModel?: string;
  referenceField?: string;
  order: number;
  isSystem?: boolean;
  isSearchable?: boolean;
  isSortable?: boolean;
  isHidden?: boolean;
}

export interface Model {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  fields: ModelField[];
  tenantId: string;
  applicationId?: string;
  version: number;
  isPublished: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type ModelRelationType = 'oneToOne' | 'oneToMany' | 'manyToMany';

export interface ModelRelation {
  id: string;
  name: string;
  sourceModelId: string;
  targetModelId: string;
  type: ModelRelationType;
  sourceField: string;
  targetField: string;
  junctionTable?: string;
  isRequired?: boolean;
  displayName?: string;
  description?: string;
}

export interface ModelVersion {
  id: string;
  modelId: string;
  version: number;
  snapshot: Model;
  createdBy: string;
  createdAt: string;
  comment?: string;
  isPublished: boolean;
}

export interface ModelDiff {
  addedFields: ModelField[];
  removedFields: ModelField[];
  changedFields: {
    oldField: ModelField;
    newField: ModelField;
  }[];
  addedRelations: ModelRelation[];
  removedRelations: ModelRelation[];
  changedRelations: {
    oldRelation: ModelRelation;
    newRelation: ModelRelation;
  }[];
  changedProperties: {
    property: string;
    oldValue: any;
    newValue: any;
  }[];
}

export interface CreateModelRequest {
  name: string;
  displayName: string;
  description?: string;
  applicationId?: string;
  fields?: Partial<ModelField>[];
}

export interface UpdateModelRequest {
  id: string;
  name?: string;
  displayName?: string;
  description?: string;
  fields?: ModelField[];
  version?: number;
}

export interface ModelResponse {
  success: boolean;
  data?: Model;
  error?: string;
}

export interface ModelsResponse {
  success: boolean;
  data?: Model[];
  total?: number;
  error?: string;
}

export interface ModelRelationsResponse {
  success: boolean;
  data?: ModelRelation[];
  error?: string;
}

export interface ModelVersionsResponse {
  success: boolean;
  data?: ModelVersion[];
  error?: string;
}

export interface PublishModelRequest {
  id: string;
  comment?: string;
}

export interface ModelVersionRequest {
  modelId: string;
  version?: number;
  comment?: string;
}

export interface ModelVersionDiffRequest {
  modelId: string;
  sourceVersion: number;
  targetVersion: number;
}

export interface ModelVersionDiffResponse {
  success: boolean;
  data?: ModelDiff;
  error?: string;
}
