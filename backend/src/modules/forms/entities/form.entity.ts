/**
 * 表单模板类型定义（Prisma版，无TypeORM装饰器）
 * 存储表单的结构、元数据、状态、版本等
 */
export interface FormEntity {
  /** 主键ID */
  id: string;
  /** 表单唯一编码 */
  code: string;
  /** 表单名称 */
  name: string;
  /** JSON Schema 格式的表单结构定义 */
  schema: string;
  /** 表单描述 */
  description?: string;
  /** 状态：草稿/已发布/已归档 */
  status: 'draft' | 'published' | 'archived';
  /** 版本号 */
  version: number;
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;
  /** 归档时间 */
  archivedAt?: Date;
}
