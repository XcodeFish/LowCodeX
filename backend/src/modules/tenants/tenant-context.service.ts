import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

/**
 * 租户上下文接口
 */
export interface TenantContext {
  tenantId: string;
  [key: string]: any;
}

/**
 * 租户上下文服务
 * 管理当前请求的租户信息
 */
@Injectable()
export class TenantContextService {
  private readonly tenantContext: AsyncLocalStorage<TenantContext>;

  constructor() {
    this.tenantContext = new AsyncLocalStorage<TenantContext>();
  }

  /**
   * 设置当前租户上下文
   * @param tenantId 租户ID
   * @param callback 在租户上下文中执行的回调函数
   */
  run<T>(tenantId: string, callback: () => T): T {
    const context: TenantContext = { tenantId };
    return this.tenantContext.run(context, callback);
  }

  /**
   * 获取当前租户ID
   * @returns 当前租户ID或undefined
   */
  getCurrentTenantId(): string | undefined {
    const context = this.tenantContext.getStore();
    return context?.tenantId;
  }

  /**
   * 获取当前租户上下文
   * @returns 当前租户上下文或undefined
   */
  getCurrentContext(): TenantContext | undefined {
    return this.tenantContext.getStore();
  }

  /**
   * 在当前租户上下文中存储值
   * @param key 键
   * @param value 值
   */
  set(key: string, value: any): void {
    const context = this.tenantContext.getStore();
    if (context) {
      context[key] = value;
    }
  }

  /**
   * 从当前租户上下文中获取值
   * @param key 键
   * @returns 值或undefined
   */
  get<T>(key: string): T | undefined {
    const context = this.tenantContext.getStore();
    return context ? (context[key] as T) : undefined;
  }
}
