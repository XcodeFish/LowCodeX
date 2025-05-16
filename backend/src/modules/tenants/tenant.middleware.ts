import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantContextService } from './tenant-context.service';
import { ConfigService } from '@nestjs/config';

/**
 * 租户中间件
 * 从请求中提取租户标识并设置租户上下文
 */
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    private readonly tenantContext: TenantContextService,
    private readonly configService: ConfigService,
  ) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const tenantId = this.extractTenantId(req);

    if (tenantId) {
      // 在租户上下文中执行后续处理
      this.tenantContext.run(tenantId, () => next());
    } else {
      // 无有效租户，继续处理（可能是公共API或系统API）
      next();
    }
  }

  /**
   * 从请求中提取租户ID
   * 支持从请求头、子域名、查询参数等多种方式获取
   */
  private extractTenantId(req: Request): string | null {
    // 1. 从请求头中获取
    const headerName = this.configService.get<string>(
      'TENANT_HEADER_NAME',
      'X-Tenant-ID',
    );
    const tenantIdFromHeader = req.headers[headerName.toLowerCase()] as string;
    if (tenantIdFromHeader) {
      return tenantIdFromHeader;
    }

    // 2. 从JWT令牌中获取（如果已解析）
    // @ts-ignore
    if (req.user && req.user.tenantId) {
      // @ts-ignore
      return req.user.tenantId;
    }

    // 3. 从子域名中获取
    const hostHeader = req.headers.host;
    if (hostHeader) {
      const baseHost = this.configService.get<string>('BASE_HOST', '');
      if (baseHost && hostHeader !== baseHost) {
        const subdomain = hostHeader.replace(`.${baseHost}`, '');
        if (subdomain !== hostHeader) {
          // TODO: 从子域名映射到租户ID
          // 这里可以从数据库中查询子域名对应的租户ID
          return subdomain;
        }
      }
    }

    // 4. 从查询参数中获取（通常仅用于测试）
    const tenantIdFromQuery = req.query.tenantId as string;
    if (tenantIdFromQuery) {
      return tenantIdFromQuery;
    }

    // 5. 从URL路径中获取
    // 例如: /api/tenants/{tenantId}/...
    const tenantIdInPath = this.extractTenantIdFromPath(req.path);
    if (tenantIdInPath) {
      return tenantIdInPath;
    }

    // 未找到租户ID
    return null;
  }

  /**
   * 从URL路径中提取租户ID
   * 例如: /api/tenants/{tenantId}/...
   */
  private extractTenantIdFromPath(path: string): string | null {
    // 简单实现，实际项目中可能需要更复杂的路径解析
    const tenantPathRegex = /\/api\/tenants\/([^\/]+)/;
    const match = path.match(tenantPathRegex);
    return match ? match[1] : null;
  }
}
