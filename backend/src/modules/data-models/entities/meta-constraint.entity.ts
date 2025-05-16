import { MetaTable } from './meta-table.entity';

/**
 * 约束类型枚举
 */
export enum ConstraintType {
  PRIMARY_KEY = 'primary_key', // 主键
  FOREIGN_KEY = 'foreign_key', // 外键
  UNIQUE = 'unique', // 唯一性
  CHECK = 'check', // 检查约束
  NOT_NULL = 'not_null', // 非空约束
}

/**
 * 元约束实体
 */
export class MetaConstraint {
  /**
   * 约束ID
   */
  id: string;

  /**
   * 表ID
   */
  tableId: string;

  /**
   * 约束名称
   */
  name: string;

  /**
   * 约束类型
   */
  type: ConstraintType | string;

  /**
   * 相关字段IDs
   */
  fields: string[];

  /**
   * 约束表达式
   */
  expression?: string;

  /**
   * 违反约束时的错误消息
   */
  message?: string;

  /**
   * 所属表
   */
  table?: MetaTable;
}
