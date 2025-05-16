import { MetaIndex } from './meta-index.entity';
import { MetaField } from './meta-field.entity';

/**
 * 元索引字段实体
 */
export class MetaIndexField {
  /**
   * 索引字段ID
   */
  id: string;

  /**
   * 索引ID
   */
  indexId: string;

  /**
   * 字段ID
   */
  fieldId: string;

  /**
   * 字段顺序
   */
  ordinal: number;

  /**
   * 所属索引
   */
  index?: MetaIndex;

  /**
   * 关联字段
   */
  field?: MetaField;
}
