/**
 * 分页数据结构
 */
export class PageData<T = any> {
  /**
   * 数据列表
   */
  items: T[];

  /**
   * 总记录数
   */
  total: number;

  /**
   * 当前页码（从1开始）
   */
  page: number;

  /**
   * 每页大小
   */
  pageSize: number;

  /**
   * 构造方法
   * @param items 数据列表
   * @param total 总记录数
   * @param page 当前页码
   * @param pageSize 每页大小
   */
  constructor(items: T[], total: number, page: number, pageSize: number) {
    this.items = items;
    this.total = total;
    this.page = page;
    this.pageSize = pageSize;
  }

  /**
   * 创建分页数据
   * @param items 数据列表
   * @param total 总记录数
   * @param page 当前页码
   * @param pageSize 每页大小
   * @returns PageData
   */
  static of<T>(
    items: T[],
    total: number,
    page: number,
    pageSize: number,
  ): PageData<T> {
    return new PageData<T>(items, total, page, pageSize);
  }

  /**
   * 获取总页数
   * @returns 总页数
   */
  getTotalPages(): number {
    if (this.pageSize <= 0) {
      return 0;
    }
    return Math.ceil(this.total / this.pageSize);
  }

  /**
   * 是否有上一页
   * @returns 是否有上一页
   */
  hasPrevious(): boolean {
    return this.page > 1;
  }

  /**
   * 是否有下一页
   * @returns 是否有下一页
   */
  hasNext(): boolean {
    return this.page < this.getTotalPages();
  }

  /**
   * 获取上一页页码
   * @returns 上一页页码
   */
  getPreviousPage(): number {
    return this.hasPrevious() ? this.page - 1 : this.page;
  }

  /**
   * 获取下一页页码
   * @returns 下一页页码
   */
  getNextPage(): number {
    return this.hasNext() ? this.page + 1 : this.page;
  }
}
