import { v4 as uuidv4 } from 'uuid';
import { FieldType } from '../types';
import type {
  ModelField,
  Model,
  ValidationRule,
  ModelRelation
} from '../types';

/**
 * 创建新的空字段
 */
export const createEmptyField = (order: number): ModelField => {
  return {
    id: uuidv4(),
    name: '',
    displayName: '',
    type: FieldType.STRING,
    isRequired: false,
    isPrimaryKey: false,
    isUnique: false,
    defaultValue: null,
    description: '',
    validationRules: [],
    order,
    isSystem: false,
    isSearchable: true,
    isSortable: true,
    isHidden: false
  };
};

/**
 * 创建主键字段
 */
export const createPrimaryKeyField = (): ModelField => {
  return {
    id: uuidv4(),
    name: 'id',
    displayName: 'ID',
    type: FieldType.STRING,
    isRequired: true,
    isPrimaryKey: true,
    isUnique: true,
    validationRules: [],
    order: 0,
    isSystem: true,
    isSearchable: true,
    isSortable: true,
    isHidden: false
  };
};

/**
 * 创建新的空模型
 */
export const createEmptyModel = (tenantId: string, applicationId?: string): Partial<Model> => {
  const primaryKeyField = createPrimaryKeyField();

  return {
    name: '',
    displayName: '',
    description: '',
    fields: [primaryKeyField],
    tenantId,
    applicationId,
    version: 1,
    isPublished: false
  };
};

/**
 * 生成技术名称
 * @param displayName 显示名称
 */
export const generateTechnicalName = (displayName: string): string => {
  if (!displayName) return '';

  // 将中文和其他字符转换为拼音或适当的替代
  return displayName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/^[0-9]/, 'f$&'); // 确保不以数字开头
};

/**
 * 验证字段名称是否合法
 */
export const isValidFieldName = (name: string): boolean => {
  if (!name) return false;
  // 只允许字母、数字和下划线，且不能以数字开头
  const pattern = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
  return pattern.test(name);
};

/**
 * 验证模型名称是否合法
 */
export const isValidModelName = (name: string): boolean => {
  if (!name) return false;
  // 只允许字母、数字和下划线，且不能以数字开头
  const pattern = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
  return pattern.test(name);
};

/**
 * 基于字段类型获取默认验证规则
 */
export const getDefaultValidationRules = (type: FieldType, isRequired: boolean): ValidationRule[] => {
  const rules: ValidationRule[] = [];

  if (isRequired) {
    rules.push({
      type: 'required',
      message: '此字段必填'
    });
  }

  switch (type) {
    case FieldType.EMAIL:
      rules.push({
        type: 'format',
        message: '请输入有效的邮箱地址',
        pattern: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$'
      });
      break;
    case FieldType.URL:
      rules.push({
        type: 'format',
        message: '请输入有效的URL',
        pattern: '^(https?:\\/\\/)?([\\da-z.-]+)\\.([a-z.]{2,6})([\\/\\w .-]*)*\\/?$'
      });
      break;
    case FieldType.PHONE:
      rules.push({
        type: 'format',
        message: '请输入有效的电话号码',
        pattern: '^[+]?[(]?[0-9]{3}[)]?[-\\s.]?[0-9]{3}[-\\s.]?[0-9]{4,6}$'
      });
      break;
    case FieldType.NUMBER:
    case FieldType.INTEGER:
    case FieldType.FLOAT:
      rules.push({
        type: 'format',
        message: '请输入有效的数字',
        pattern: type === FieldType.INTEGER ? '^\\d+$' : '^[+-]?\\d+(\\.\\d+)?$'
      });
      break;
  }

  return rules;
};

/**
 * 获取字段类型的显示名称
 */
export const getFieldTypeDisplayName = (type: FieldType): string => {
  const typeMap: Record<FieldType, string> = {
    [FieldType.STRING]: '文本',
    [FieldType.NUMBER]: '数字',
    [FieldType.INTEGER]: '整数',
    [FieldType.FLOAT]: '浮点数',
    [FieldType.BOOLEAN]: '布尔值',
    [FieldType.DATE]: '日期',
    [FieldType.DATETIME]: '日期时间',
    [FieldType.TIME]: '时间',
    [FieldType.ENUM]: '枚举',
    [FieldType.REFERENCE]: '引用',
    [FieldType.FILE]: '文件',
    [FieldType.IMAGE]: '图片',
    [FieldType.JSON]: 'JSON',
    [FieldType.ARRAY]: '数组',
    [FieldType.RICH_TEXT]: '富文本',
    [FieldType.URL]: 'URL',
    [FieldType.EMAIL]: '邮箱',
    [FieldType.PHONE]: '电话',
    [FieldType.COLOR]: '颜色',
    [FieldType.GEO]: '地理位置'
  };

  return typeMap[type] || '未知类型';
};

/**
 * 获取关系类型的显示名称
 */
export const getRelationTypeDisplayName = (type: string): string => {
  const typeMap: Record<string, string> = {
    'oneToOne': '一对一',
    'oneToMany': '一对多',
    'manyToMany': '多对多'
  };

  return typeMap[type] || '未知关系';
};

/**
 * 获取字段默认值
 */
export const getDefaultValueForType = (type: FieldType): any => {
  switch (type) {
    case FieldType.STRING:
    case FieldType.EMAIL:
    case FieldType.URL:
    case FieldType.PHONE:
    case FieldType.RICH_TEXT:
      return '';
    case FieldType.NUMBER:
    case FieldType.INTEGER:
    case FieldType.FLOAT:
      return 0;
    case FieldType.BOOLEAN:
      return false;
    case FieldType.DATE:
    case FieldType.DATETIME:
    case FieldType.TIME:
      return null;
    case FieldType.ENUM:
      return null;
    case FieldType.REFERENCE:
      return null;
    case FieldType.FILE:
    case FieldType.IMAGE:
      return null;
    case FieldType.JSON:
      return {};
    case FieldType.ARRAY:
      return [];
    case FieldType.COLOR:
      return '#000000';
    case FieldType.GEO:
      return { lat: 0, lng: 0 };
    default:
      return null;
  }
};

/**
 * 检查字段名称是否唯一
 */
export const isFieldNameUnique = (fields: ModelField[], name: string, currentFieldId?: string): boolean => {
  return !fields.some(field => field.name === name && field.id !== currentFieldId);
};

/**
 * 获取关系类型基于源和目标字段
 */
export const inferRelationType = (sourceField: ModelField, targetField: ModelField): 'oneToOne' | 'oneToMany' | 'manyToMany' => {
  if (sourceField.isUnique && targetField.isUnique) {
    return 'oneToOne';
  } else if (sourceField.isUnique) {
    return 'oneToMany';
  } else if (targetField.isUnique) {
    return 'oneToMany'; // 反向关系
  } else {
    return 'manyToMany';
  }
};

/**
 * 对模型字段排序
 */
export const sortModelFields = (fields: ModelField[]): ModelField[] => {
  return [...fields].sort((a, b) => {
    // 主键字段始终在最前面
    if (a.isPrimaryKey) return -1;
    if (b.isPrimaryKey) return 1;

    // 按照order排序
    return a.order - b.order;
  });
};
