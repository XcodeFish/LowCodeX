import { MetaTable } from './meta-table.entity';
import { MetaIndexField } from './meta-index-field.entity';

/**
 * 索引类型枚举
 */
export enum IndexType {
  BTREE = 'btree', // B树索引
  HASH = 'hash', // 哈希索引
  FULLTEXT = 'fulltext', // 全文索引
}

/**
 * 元索引实体
 */
export class MetaIndex {
  /**
   * 索引ID
   */
  id: string;

  /**
   * 表ID
   */
  tableId: string;

  /**
   * 索引名称
   */
  name: string;

  /**
   * 索引类型
   */
  type: IndexType | string;

  /**
   * 是否唯一索引
   */
  isUnique: boolean;

  /**
   * 所属表
   */
  table?: MetaTable;

  /**
   * 索引字段列表
   */
  fields?: MetaIndexField[];

  /**
   * 获取索引字段名称列表
   */
  getFieldNames(): string[] {
    if (!this.fields) return [];

    // 按照ordinal排序
    const sortedFields = [...this.fields].sort((a, b) => a.ordinal - b.ordinal);

    return sortedFields.map((field) => field.field?.name || '');
  }
}
