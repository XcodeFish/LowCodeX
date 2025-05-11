// API基础URL
export const API_BASE_URL = '/api';

// 本地存储键
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER_INFO: 'userInfo',
  THEME: 'theme',
  LANGUAGE: 'language',
  REMEMBER_ME: 'rememberMe',
};

// 导入API状态码枚举
import { ApiCode } from './api';

// 兼容旧的HTTP_STATUS常量对象（使用ApiCode枚举的值）
export const HTTP_STATUS = {
  OK: ApiCode.SUCCESS, // 将OK映射到SUCCESS
  CREATED: 201, // 保留原有的CREATED
  BAD_REQUEST: ApiCode.BAD_REQUEST,
  UNAUTHORIZED: ApiCode.UNAUTHORIZED,
  FORBIDDEN: ApiCode.FORBIDDEN,
  NOT_FOUND: ApiCode.NOT_FOUND,
  SERVER_ERROR: ApiCode.INTERNAL_ERROR, // 将SERVER_ERROR映射到INTERNAL_ERROR
};

// 分页默认参数
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = ['10', '20', '50', '100'];

// 表单元素类型
export const FORM_ELEMENT_TYPES = {
  INPUT: 'input',
  TEXTAREA: 'textarea',
  SELECT: 'select',
  RADIO: 'radio',
  CHECKBOX: 'checkbox',
  DATE: 'date',
  DATETIME: 'datetime',
  NUMBER: 'number',
  SWITCH: 'switch',
  UPLOAD: 'upload',
  RICH_TEXT: 'richText',
};

// 工作流节点类型
export const WORKFLOW_NODE_TYPES = {
  START: 'start',
  END: 'end',
  TASK: 'task',
  GATEWAY: 'gateway',
  EVENT: 'event',
};

// 主题配置
export const THEME_COLORS = {
  PRIMARY: '#1890ff',
  SUCCESS: '#52c41a',
  WARNING: '#faad14',
  ERROR: '#f5222d',
};

// 导出API相关常量和类型
export * from './api';
