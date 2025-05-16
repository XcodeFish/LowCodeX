import { MetaTable } from './meta-table.entity';
import { MetaField } from './meta-field.entity';
import { MetaRelation } from './meta-relation.entity';

/**
 * 元版本实体
 */
export class MetaVersion {
  /**
   * 版本ID
   */
  id: string;

  /**
   * 表ID
   */
  tableId: string;

  /**
   * 版本号
   */
  version: number;

  /**
   * 版本名称
   */
  name: string;

  /**
   * 版本描述
   */
  description?: string;

  /**
   * 表快照
   */
  snapshot: Record<string, any>;

  /**
   * 是否已发布
   */
  isPublished: boolean;

  /**
   * 创建人
   */
  createdBy: string;

  /**
   * 创建时间
   */
  createdAt: Date;

  /**
   * 版本说明
   */
  comment?: string;

  /**
   * 所属表
   */
  table?: MetaTable;

  /**
   * 获取版本中的字段列表
   */
  getFields(): MetaField[] {
    if (this.snapshot && this.snapshot.fields) {
      return this.snapshot.fields as MetaField[];
    }
    return [];
  }

  /**
   * 获取版本中的关系列表
   */
  getRelations(): MetaRelation[] {
    if (this.snapshot && this.snapshot.relations) {
      return this.snapshot.relations as MetaRelation[];
    }
    return [];
  }

  /**
   * 获取表的元数据信息
   */
  getTableInfo(): Partial<MetaTable> {
    if (this.snapshot) {
      // 排除字段和关系等关联属性
      const { fields, relations, versions, ...tableInfo } = this.snapshot;
      return tableInfo as Partial<MetaTable>;
    }
    return {};
  }
}
