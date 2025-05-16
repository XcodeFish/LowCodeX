import { MetaTable } from './meta-table.entity';
import { MetaField } from './meta-field.entity';
import { RelationType } from './meta-field.entity';

/**
 * 元关系实体
 */
export class MetaRelation {
  /**
   * 关系ID
   */
  id: string;

  /**
   * 关系名称
   */
  name: string;

  /**
   * 关系描述
   */
  description?: string;

  /**
   * 源表ID
   */
  sourceTableId: string;

  /**
   * 目标表ID
   */
  targetTableId: string;

  /**
   * 源字段ID
   */
  sourceFieldId: string;

  /**
   * 目标字段ID
   */
  targetFieldId: string;

  /**
   * 关系类型
   */
  type: RelationType | string;

  /**
   * 是否级联删除
   */
  cascadeDelete: boolean;

  /**
   * 是否级联更新
   */
  cascadeUpdate: boolean;

  /**
   * 是否必需关系
   */
  isRequired: boolean;

  /**
   * 中间表ID(用于多对多)
   */
  junctionTableId?: string;

  /**
   * 自定义选项
   */
  customOptions?: Record<string, any>;

  /**
   * 源表
   */
  sourceTable?: MetaTable;

  /**
   * 目标表
   */
  targetTable?: MetaTable;

  /**
   * 源字段
   */
  sourceField?: MetaField;

  /**
   * 目标字段
   */
  targetField?: MetaField;

  /**
   * 中间表(用于多对多)
   */
  junctionTable?: MetaTable;
}
