import { MetaField } from './meta-field.entity';
import { MetaRelation } from './meta-relation.entity';
import { MetaVersion } from './meta-version.entity';
import { MetaIndex } from './meta-index.entity';
import { MetaConstraint } from './meta-constraint.entity';

/**
 * 表状态枚举
 */
export enum TableStatus {
  DRAFT = 'draft', // 草稿
  PUBLISHED = 'published', // 已发布
  DEPRECATED = 'deprecated', // 已废弃
  DELETED = 'deleted', // 已删除
}

/**
 * 元表实体
 */
export class MetaTable {
  /**
   * 唯一标识符
   */
  id: string;

  /**
   * 技术名称（英文，用于数据库表名）
   */
  name: string;

  /**
   * 显示名称（中文，用于UI展示）
   */
  displayName: string;

  /**
   * 表描述
   */
  description?: string;

  /**
   * 是否系统表
   */
  isSystem: boolean;

  /**
   * 是否支持软删除
   */
  isSoftDelete: boolean;

  /**
   * 是否支持版本控制
   */
  isVersioned: boolean;

  /**
   * 表状态
   */
  status: TableStatus | string;

  /**
   * 所属租户
   */
  tenant: string;

  /**
   * 所属应用
   */
  application?: string;

  /**
   * 创建人
   */
  createdBy: string;

  /**
   * 创建时间
   */
  createdAt: Date;

  /**
   * 更新人
   */
  updatedBy?: string;

  /**
   * 更新时间
   */
  updatedAt?: Date;

  /**
   * 是否包含审计字段（创建时间等）
   */
  auditFields: boolean;

  /**
   * 是否启用API
   */
  apiEnabled: boolean;

  /**
   * 自定义选项
   */
  customOptions?: Record<string, any>;

  /**
   * 关联的字段列表
   */
  fields?: MetaField[];

  /**
   * 作为源表的关系列表
   */
  relations?: MetaRelation[];

  /**
   * 作为目标表的关系列表
   */
  targetRelations?: MetaRelation[];

  /**
   * 版本列表
   */
  versions?: MetaVersion[];

  /**
   * 索引列表
   */
  indexes?: MetaIndex[];

  /**
   * 约束列表
   */
  constraints?: MetaConstraint[];
}
