/**
 * 表单数据类型定义（Prisma版，无TypeORM装饰器）
 * 存储用户提交的表单数据及其版本、归档状态等
 */
export interface FormDataEntity {
  /** 主键ID */
  id: string;
  /** 所属表单模板ID */
  formId: string;
  /** 表单数据内容（JSON字符串） */
  data: string;
  /** 数据版本号 */
  version: number;
  /** 是否归档 */
  archived: boolean;
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;
}
