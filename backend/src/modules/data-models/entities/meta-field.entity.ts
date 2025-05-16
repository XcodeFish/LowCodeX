import { MetaTable } from './meta-table.entity';
import { MetaRelation } from './meta-relation.entity';
import { MetaIndexField } from './meta-index-field.entity';

/**
 * 字段类型枚举
 */
export enum FieldType {
  STRING = 'string', // 字符串
  TEXT = 'text', // 文本
  RICH_TEXT = 'richText', // 富文本
  INTEGER = 'integer', // 整数
  FLOAT = 'float', // 浮点数
  DECIMAL = 'decimal', // 精确小数
  BOOLEAN = 'boolean', // 布尔值
  DATE = 'date', // 日期
  DATETIME = 'datetime', // 日期时间
  TIME = 'time', // 时间
  ENUM = 'enum', // 枚举
  JSON = 'json', // JSON
  ARRAY = 'array', // 数组
  REFERENCE = 'reference', // 引用(关系)
  FILE = 'file', // 文件
  IMAGE = 'image', // 图片
  EMAIL = 'email', // 电子邮件
  URL = 'url', // 网址
  PHONE = 'phone', // 电话号码
  COLOR = 'color', // 颜色
  GEO = 'geo', // 地理位置
}

/**
 * 验证规则类型枚举
 */
export enum ValidationRuleType {
  REQUIRED = 'required', // 必填
  LENGTH = 'length', // 长度
  RANGE = 'range', // 范围
  REGEX = 'regex', // 正则表达式
  CUSTOM = 'custom', // 自定义规则
}

/**
 * 验证规则接口
 */
export interface ValidationRule {
  type: ValidationRuleType | string; // 规则类型
  message: string; // 错误消息
  expression?: string; // 表达式(用于自定义规则)
  parameters?: Record<string, any>; // 规则参数
}

/**
 * 枚举选项接口
 */
export interface EnumOption {
  value: string; // 枚举值
  label: string; // 显示标签
  color?: string; // 颜色(用于UI展示)
  order?: number; // 排序
  disabled?: boolean; // 是否禁用
}

/**
 * 关系类型枚举
 */
export enum RelationType {
  ONE_TO_ONE = 'oneToOne', // 一对一
  ONE_TO_MANY = 'oneToMany', // 一对多
  MANY_TO_ONE = 'manyToOne', // 多对一
  MANY_TO_MANY = 'manyToMany', // 多对多
}

/**
 * 字段高级设置接口
 */
export interface FieldAdvancedSettings {
  // 字符串类型设置
  minLength?: number; // 最小长度
  maxLength?: number; // 最大长度

  // 数字类型设置
  min?: number; // 最小值
  max?: number; // 最大值
  precision?: number; // 精度(总位数)
  scale?: number; // 小数位数

  // 枚举类型设置
  enumOptions?: EnumOption[]; // 枚举选项

  // 引用类型设置
  referenceTableId?: string; // 引用的表ID
  referenceFieldId?: string; // 引用的字段ID
  relationType?: RelationType; // 关系类型

  // UI渲染设置
  renderType?: string; // 渲染类型
  renderOptions?: Record<string, any>; // 渲染选项

  // 业务规则设置
  businessRules?: BusinessRule[]; // 业务规则
}

/**
 * 业务规则类型枚举
 */
export enum BusinessRuleType {
  VALIDATION = 'validation', // 验证
  CALCULATION = 'calculation', // 计算
  AUTOMATION = 'automation', // 自动化
  NOTIFICATION = 'notification', // 通知
}

/**
 * 业务规则接口
 */
export interface BusinessRule {
  id: string; // 规则ID
  name: string; // 规则名称
  type: BusinessRuleType | string; // 规则类型
  condition?: string; // 触发条件
  action: string; // 执行操作
  priority: number; // 优先级
  isActive: boolean; // 是否激活
}

/**
 * 元字段实体
 */
export class MetaField {
  /**
   * 唯一标识符
   */
  id: string;

  /**
   * 所属表ID
   */
  tableId: string;

  /**
   * 技术名称（英文）
   */
  name: string;

  /**
   * 显示名称（中文）
   */
  displayName: string;

  /**
   * 字段描述
   */
  description?: string;

  /**
   * 字段类型
   */
  type: FieldType | string;

  /**
   * 是否主键
   */
  isPrimaryKey: boolean;

  /**
   * 是否必填
   */
  isRequired: boolean;

  /**
   * 是否唯一
   */
  isUnique: boolean;

  /**
   * 是否系统字段
   */
  isSystem: boolean;

  /**
   * 是否在UI中隐藏
   */
  isHidden: boolean;

  /**
   * 字段顺序
   */
  ordinal: number;

  /**
   * 默认值
   */
  defaultValue?: string;

  /**
   * 验证规则
   */
  validationRules?: ValidationRule[];

  /**
   * 是否可搜索
   */
  isSearchable: boolean;

  /**
   * 是否可排序
   */
  isSortable: boolean;

  /**
   * 是否可筛选
   */
  isFilterable: boolean;

  /**
   * 是否可聚合
   */
  isAggregatable: boolean;

  /**
   * 高级设置
   */
  advancedSettings?: FieldAdvancedSettings;

  /**
   * 所属表
   */
  table?: MetaTable;

  /**
   * 作为源字段的关系列表
   */
  sourceRelations?: MetaRelation[];

  /**
   * 作为目标字段的关系列表
   */
  targetRelations?: MetaRelation[];

  /**
   * 关联的索引字段列表
   */
  indexFields?: MetaIndexField[];
}
