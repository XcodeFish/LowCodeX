/**
 * 表状态枚举
 */
export enum TableStatus {
  DRAFT = 'draft',         // 草稿
  PUBLISHED = 'published', // 已发布
  DEPRECATED = 'deprecated', // 已废弃
  DELETED = 'deleted',     // 已删除
}

/**
 * 字段类型枚举
 */
export enum FieldType {
  STRING = 'string',       // 字符串
  TEXT = 'text',           // 文本
  RICH_TEXT = 'richText',  // 富文本
  INTEGER = 'integer',     // 整数
  FLOAT = 'float',         // 浮点数
  DECIMAL = 'decimal',     // 精确小数
  BOOLEAN = 'boolean',     // 布尔值
  DATE = 'date',           // 日期
  DATETIME = 'datetime',   // 日期时间
  TIME = 'time',           // 时间
  ENUM = 'enum',           // 枚举
  JSON = 'json',           // JSON
  ARRAY = 'array',         // 数组
  REFERENCE = 'reference', // 引用(关系)
  FILE = 'file',           // 文件
  IMAGE = 'image',         // 图片
  EMAIL = 'email',         // 电子邮件
  URL = 'url',             // 网址
  PHONE = 'phone',         // 电话号码
  COLOR = 'color',         // 颜色
  GEO = 'geo',             // 地理位置
}

/**
 * 验证规则类型枚举
 */
export enum ValidationRuleType {
  REQUIRED = 'required',   // 必填
  LENGTH = 'length',       // 长度
  RANGE = 'range',         // 范围
  REGEX = 'regex',         // 正则表达式
  CUSTOM = 'custom',       // 自定义规则
}

/**
 * 关系类型枚举
 */
export enum RelationType {
  ONE_TO_ONE = 'oneToOne',     // 一对一
  ONE_TO_MANY = 'oneToMany',   // 一对多
  MANY_TO_ONE = 'manyToOne',   // 多对一
  MANY_TO_MANY = 'manyToMany', // 多对多
}

/**
 * 业务规则类型枚举
 */
export enum BusinessRuleType {
  VALIDATION = 'validation',     // 验证
  CALCULATION = 'calculation',   // 计算
  AUTOMATION = 'automation',     // 自动化
  NOTIFICATION = 'notification', // 通知
}

/**
 * 验证规则接口
 */
export interface ValidationRule {
  type: ValidationRuleType | string; // 规则类型
  message: string;                   // 错误消息
  expression?: string;               // 表达式(用于自定义规则)
  parameters?: Record<string, any>;  // 规则参数
}

/**
 * 枚举选项接口
 */
export interface EnumOption {
  value: string;        // 枚举值
  label: string;        // 显示标签
  color?: string;       // 颜色(用于UI展示)
  order?: number;       // 排序
  disabled?: boolean;   // 是否禁用
}

/**
 * 业务规则接口
 */
export interface BusinessRule {
  id: string;                        // 规则ID
  name: string;                      // 规则名称
  type: BusinessRuleType | string;   // 规则类型
  condition?: string;                // 触发条件
  action: string;                    // 执行操作
  priority: number;                  // 优先级
  isActive: boolean;                 // 是否激活
}

/**
 * 字段高级设置接口
 */
export interface FieldAdvancedSettings {
  // 字符串类型设置
  minLength?: number;         // 最小长度
  maxLength?: number;         // 最大长度

  // 数字类型设置
  min?: number;               // 最小值
  max?: number;               // 最大值
  precision?: number;         // 精度(总位数)
  scale?: number;             // 小数位数

  // 枚举类型设置
  enumOptions?: EnumOption[]; // 枚举选项

  // 引用类型设置
  referenceTableId?: string;  // 引用的表ID
  referenceFieldId?: string;  // 引用的字段ID
  relationType?: RelationType; // 关系类型

  // UI渲染设置
  renderType?: string;                // 渲染类型
  renderOptions?: Record<string, any>; // 渲染选项

  // 业务规则设置
  businessRules?: BusinessRule[];     // 业务规则
}

/**
 * 元字段接口
 */
export interface MetaField {
  id: string;                           // 唯一标识符
  tableId: string;                      // 所属表ID
  name: string;                         // 技术名称（英文）
  displayName: string;                  // 显示名称（中文）
  description?: string;                 // 字段描述
  type: FieldType | string;             // 字段类型
  isPrimaryKey: boolean;                // 是否主键
  isRequired: boolean;                  // 是否必填
  isUnique: boolean;                    // 是否唯一
  isSystem: boolean;                    // 是否系统字段
  isHidden: boolean;                    // 是否在UI中隐藏
  ordinal: number;                      // 字段顺序
  defaultValue?: string;                // 默认值
  validationRules?: ValidationRule[];   // 验证规则
  isSearchable: boolean;                // 是否可搜索
  isSortable: boolean;                  // 是否可排序
  isFilterable: boolean;                // 是否可筛选
  isAggregatable: boolean;              // 是否可聚合
  advancedSettings?: FieldAdvancedSettings; // 高级设置
}

/**
 * 元关系接口
 */
export interface MetaRelation {
  id: string;                      // 关系ID
  name: string;                    // 关系名称
  description?: string;            // 关系描述
  sourceTableId: string;           // 源表ID
  targetTableId: string;           // 目标表ID
  sourceFieldId: string;           // 源字段ID
  targetFieldId: string;           // 目标字段ID
  type: RelationType | string;     // 关系类型
  cascadeDelete: boolean;          // 是否级联删除
  cascadeUpdate: boolean;          // 是否级联更新
  isRequired: boolean;             // 是否必需关系
  junctionTableId?: string;        // 中间表ID(用于多对多)
  customOptions?: Record<string, any>; // 自定义选项
}

/**
 * 元表接口
 */
export interface MetaTable {
  id: string;                      // 唯一标识符
  name: string;                    // 技术名称（英文，用于数据库表名）
  displayName: string;             // 显示名称（中文，用于UI展示）
  description?: string;            // 表描述
  isSystem: boolean;               // 是否系统表
  isSoftDelete: boolean;           // 是否支持软删除
  isVersioned: boolean;            // 是否支持版本控制
  status: TableStatus | string;    // 表状态
  tenant: string;                  // 所属租户
  application?: string;            // 所属应用
  createdBy: string;               // 创建人
  createdAt: Date;                 // 创建时间
  updatedBy?: string;              // 更新人
  updatedAt?: Date;                // 更新时间
  auditFields: boolean;            // 是否包含审计字段
  apiEnabled: boolean;             // 是否启用API
  customOptions?: Record<string, any>; // 自定义选项
  fields?: MetaField[];            // 关联的字段列表
  relations?: MetaRelation[];      // 作为源表的关系列表
  targetRelations?: MetaRelation[]; // 作为目标表的关系列表
}

/**
 * 元版本接口
 */
export interface MetaVersion {
  id: string;                    // 版本ID
  tableId: string;               // 表ID
  name: string;                  // 版本名称
  description?: string;          // 版本描述
  versionNumber: number;         // 版本号
  isPublished: boolean;          // 是否已发布
  comment?: string;              // 版本说明
  createdBy: string;             // 创建人
  createdAt: Date;               // 创建时间
}

/**
 * 完整数据模型接口
 */
export interface CompleteModel {
  table: MetaTable;              // 表信息
  versions: MetaVersion[];       // 版本信息
}

/**
 * 创建元表DTO
 */
export interface CreateMetaTableDto {
  name: string;                  // 技术名称
  displayName: string;           // 显示名称
  description?: string;          // 描述
  isSystem?: boolean;            // 是否系统表
  isSoftDelete?: boolean;        // 是否支持软删除
  isVersioned?: boolean;         // 是否支持版本控制
  status?: TableStatus | string; // 状态
  tenant: string;                // 所属租户
  application?: string;          // 所属应用
  auditFields?: boolean;         // 是否包含审计字段
  apiEnabled?: boolean;          // 是否启用API
  customOptions?: Record<string, any>; // 自定义选项
}

/**
 * 创建元字段DTO
 */
export interface CreateMetaFieldDto {
  tableId: string;                      // 所属表ID
  name: string;                         // 技术名称
  displayName: string;                  // 显示名称
  description?: string;                 // 描述
  type: FieldType | string;             // 字段类型
  isPrimaryKey?: boolean;               // 是否主键
  isRequired?: boolean;                 // 是否必填
  isUnique?: boolean;                   // 是否唯一
  isSystem?: boolean;                   // 是否系统字段
  isHidden?: boolean;                   // 是否隐藏
  ordinal?: number;                     // 排序
  defaultValue?: string;                // 默认值
  validationRules?: ValidationRule[];   // 验证规则
  isSearchable?: boolean;               // 是否可搜索
  isSortable?: boolean;                 // 是否可排序
  isFilterable?: boolean;               // 是否可筛选
  isAggregatable?: boolean;             // 是否可聚合
  advancedSettings?: FieldAdvancedSettings; // 高级设置
}

/**
 * 创建元关系DTO
 */
export interface CreateMetaRelationDto {
  name: string;                     // 关系名称
  description?: string;             // 关系描述
  sourceTableId: string;            // 源表ID
  targetTableId: string;            // 目标表ID
  sourceFieldId: string;            // 源字段ID
  targetFieldId: string;            // 目标字段ID
  type: RelationType | string;      // 关系类型
  cascadeDelete?: boolean;          // 是否级联删除
  cascadeUpdate?: boolean;          // 是否级联更新
  isRequired?: boolean;             // 是否必需关系
  junctionTableId?: string;         // 中间表ID
  customOptions?: Record<string, any>; // 自定义选项
}

/**
 * 创建元版本DTO
 */
export interface CreateMetaVersionDto {
  tableId: string;                  // 表ID
  name: string;                     // 版本名称
  description?: string;             // 版本描述
  isPublished?: boolean;            // 是否已发布
  comment?: string;                 // 版本说明
}

/**
 * 数据模型导出接口
 */
export interface ModelExportData {
  metadata: {
    exportedAt: string;             // 导出时间
    modelType: string;              // 模型类型
    version: string;                // 版本
  };
  model: {
    table: Partial<MetaTable>;      // 表信息
    fields: Partial<MetaField>[];   // 字段信息
    relations: any[];               // 关系信息
  };
}

/**
 * 通用API响应接口
 */
export interface ApiResponse<T> {
  success: boolean;                 // 是否成功
  data?: T;                         // 返回数据
  error?: string;                   // 错误信息
  total?: number;                   // 总数量
}

/**
 * 后端API响应格式
 */
export interface BackendApiResponse<T> {
  code: number;                    // 状态码
  message: string;                 // 消息
  data: T;                         // 数据
  timestamp: string;               // 时间戳
  path?: string;                   // 请求路径
}

/**
 * 分页响应格式
 */
export interface PagedResponse<T> {
  items: T[];                      // 数据项
  total: number;                   // 总数
  page: number;                    // 当前页码
  pageSize: number;                // 每页数量
  totalPages: number;              // 总页数
}

/**
 * 创建完整数据模型请求
 */
export interface CreateCompleteModelRequest {
  model: CreateMetaTableDto;       // 模型定义
  fields: CreateMetaFieldDto[];    // 字段定义
}

/**
 * 创建完整数据模型响应
 */
export interface CreateCompleteModelResponse {
  table: MetaTable;                // 表信息
  fields: MetaField[];             // 字段信息
}

/**
 * 发布数据模型响应
 */
export interface PublishModelResponse extends MetaTable {}

/**
 * 克隆数据模型请求
 */
export interface CloneModelRequest {
  newName: string;                 // 新名称
  newDisplayName: string;          // 新显示名称
}

/**
 * 克隆数据模型响应
 */
export interface CloneModelResponse extends MetaTable {}

/**
 * 导入数据模型请求
 */
export interface ImportModelRequest {
  definition: ModelExportData;     // 导入定义
  tenant: string;                  // 租户
}

/**
 * 导入数据模型响应
 */
export interface ImportModelResponse {
  table: MetaTable;                // 表信息
  fields: MetaField[];             // 字段信息
}

/**
 * 旧版Model接口类型
 */
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

/**
 * 旧版ModelField接口类型
 */
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

/**
 * 旧版ModelRelation接口类型
 */
export interface ModelRelation {
  id: string;
  name: string;
  sourceModelId: string;
  targetModelId: string;
  type: RelationType;
  sourceField: string;
  targetField: string;
  junctionTable?: string;
  isRequired?: boolean;
  displayName?: string;
  description?: string;
  cascadeDelete?: boolean;
}

/**
 * 旧版ModelResponse接口类型
 */
export interface ModelResponse {
  success: boolean;
  data?: Model;
  error?: string;
}

/**
 * 旧版ModelsResponse接口类型
 */
export interface ModelsResponse {
  success: boolean;
  data?: Model[];
  total?: number;
  error?: string;
}

/**
 * 旧版ModelVersion接口类型
 */
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

/**
 * 旧版ModelVersionsResponse接口类型
 */
export interface ModelVersionsResponse {
  success: boolean;
  data?: ModelVersion[];
  error?: string;
}

/**
 * 旧版ModelRelationsResponse接口类型
 */
export interface ModelRelationsResponse {
  success: boolean;
  data?: ModelRelation[];
  error?: string;
}

/**
 * 旧版CreateModelRequest接口类型
 */
export interface CreateModelRequest {
  name: string;
  displayName: string;
  description?: string;
  applicationId?: string;
  fields?: Partial<ModelField>[];
  tenantId?: string;
}

/**
 * 旧版UpdateModelRequest接口类型
 */
export interface UpdateModelRequest {
  id: string;
  name?: string;
  displayName?: string;
  description?: string;
  fields?: ModelField[];
  version?: number;
}

/**
 * 旧版PublishModelRequest接口类型
 */
export interface PublishModelRequest {
  id: string;
  comment?: string;
}

/**
 * 旧版ModelVersionRequest接口类型
 */
export interface ModelVersionRequest {
  modelId: string;
  version?: number;
  comment?: string;
}

/**
 * 旧版ModelVersionDiffRequest接口类型
 */
export interface ModelVersionDiffRequest {
  oldVersionId: string;
  newVersionId: string;
}

/**
 * 旧版ModelDiff接口类型
 */
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

/**
 * 旧版ModelVersionDiffResponse接口类型
 */
export interface ModelVersionDiffResponse {
  success: boolean;
  data?: ModelDiff;
  error?: string;
}

/**
 * 更新元表DTO
 */
export interface UpdateMetaTableDto {
  displayName?: string;           // 显示名称
  description?: string;          // 描述
  isSystem?: boolean;            // 是否系统表
  isSoftDelete?: boolean;        // 是否支持软删除
  isVersioned?: boolean;         // 是否支持版本控制
  status?: TableStatus | string; // 状态
  tenant?: string;               // 所属租户
  application?: string;          // 所属应用
  auditFields?: boolean;         // 是否包含审计字段
  apiEnabled?: boolean;          // 是否启用API
  customOptions?: Record<string, any>; // 自定义选项
}

/**
 * 更新元字段DTO
 */
export interface UpdateMetaFieldDto {
  displayName?: string;                  // 显示名称
  description?: string;                 // 描述
  type?: FieldType | string;             // 字段类型
  isPrimaryKey?: boolean;               // 是否主键
  isRequired?: boolean;                 // 是否必填
  isUnique?: boolean;                   // 是否唯一
  isSystem?: boolean;                   // 是否系统字段
  isHidden?: boolean;                   // 是否隐藏
  ordinal?: number;                     // 排序
  defaultValue?: string;                // 默认值
  validationRules?: ValidationRule[];   // 验证规则
  isSearchable?: boolean;               // 是否可搜索
  isSortable?: boolean;                 // 是否可排序
  isFilterable?: boolean;               // 是否可筛选
  isAggregatable?: boolean;             // 是否可聚合
  advancedSettings?: FieldAdvancedSettings; // 高级设置
}

/**
 * 更新元关系DTO
 */
export interface UpdateMetaRelationDto {
  name?: string;                     // 关系名称
  description?: string;             // 关系描述
  sourceFieldId?: string;            // 源字段ID
  targetFieldId?: string;            // 目标字段ID
  type?: RelationType | string;      // 关系类型
  cascadeDelete?: boolean;          // 是否级联删除
  cascadeUpdate?: boolean;          // 是否级联更新
  isRequired?: boolean;             // 是否必需关系
  junctionTableId?: string;         // 中间表ID
  customOptions?: Record<string, any>; // 自定义选项
}

/**
 * 更新元版本DTO
 */
export interface UpdateMetaVersionDto {
  name?: string;                     // 版本名称
  description?: string;             // 版本描述
  isPublished?: boolean;            // 是否已发布
  comment?: string;                 // 版本说明
}

/**
 * 模型变更影响分析请求接口
 */
export interface ImpactAnalysisRequest {
  tableId: string;
  changes: {
    type: 'add' | 'remove' | 'modify';
    entity: 'table' | 'field' | 'relation';
    entityId?: string;
    details?: any;
  }[];
}

/**
 * 模型变更影响分析响应接口
 */
export interface ImpactAnalysisResponse extends ApiResponse<{
  affectedTables: any[];
  affectedFields: any[];
  affectedRelations: any[];
  recommendations: string[];
}> {}

/**
 * 测试数据生成请求接口
 */
export interface TestDataGenerateRequest {
  tableId: string;
  count: number;
  options?: any;
}

/**
 * 测试数据预览响应接口
 */
export interface TestDataPreviewResponse extends ApiResponse<any[]> {}

/**
 * 保存测试数据模板请求接口
 */
export interface SaveTestDataTemplateRequest {
  tableId: string;
  name: string;
  description?: string;
  config: any;
}

/**
 * 测试数据模板接口
 */
export interface TestDataTemplate {
  id: string;
  tableId: string;
  name: string;
  description?: string;
  config: any;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * 测试数据模板响应接口
 */
export interface TestDataTemplateResponse extends ApiResponse<TestDataTemplate> {}

/**
 * 测试数据模板列表响应接口
 */
export interface TestDataTemplatesResponse extends ApiResponse<TestDataTemplate[]> {}

/**
 * 模型发布审批DTO
 */
export interface CreateModelApprovalDto {
  tableId: string;
  versionId?: string;
  comment?: string;
}

/**
 * 审批模型DTO
 */
export interface ApproveModelDto {
  approved: boolean;
  comment?: string;
}

/**
 * 模型审批接口
 */
export interface ModelApproval {
  id: string;
  tableId: string;
  versionId?: string;
  requestedBy: string;
  approvedBy?: string;
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
  approvalComment?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * 模型审批响应接口
 */
export interface ModelApprovalResponse extends ApiResponse<ModelApproval> {}

/**
 * 模型审批列表响应接口
 */
export interface ModelApprovalsResponse extends ApiResponse<ModelApproval[]> {}

/**
 * 模型审批历史响应接口
 */
export interface ModelApprovalHistoryResponse extends ApiResponse<ModelApproval[]> {}

/**
 * 可视化图表保存DTO
 */
export interface VisualDiagramSaveDto {
  name: string;
  description?: string;
  diagramType: 'er' | 'custom';
  content: any;
}

/**
 * 可视化图表接口
 */
export interface VisualDiagram {
  id: string;
  name: string;
  description?: string;
  diagramType: 'er' | 'custom';
  content: any;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * 可视化图表响应接口
 */
export interface VisualDiagramResponse extends ApiResponse<VisualDiagram> {}

/**
 * 可视化图表列表响应接口
 */
export interface VisualDiagramsResponse extends ApiResponse<VisualDiagram[]> {}
