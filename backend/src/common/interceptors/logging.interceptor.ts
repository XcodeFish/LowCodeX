import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, body, params, query, headers } = request;
    const userAgent = headers['user-agent'] || '';

    // 请求信息日志
    this.logger.log(
      `请求开始 - ${method} ${url}
      用户代理: ${userAgent}
      请求体: ${JSON.stringify(body)}
      路径参数: ${JSON.stringify(params)}
      查询参数: ${JSON.stringify(query)}`,
    );

    return next.handle().pipe(
      tap({
        next: (data: any) => {
          const response = context.switchToHttp().getResponse<Response>();
          const { statusCode } = response;
          const responseTime = Date.now() - now;

          // 响应信息日志（成功）
          this.logger.log(
            `请求结束 - ${method} ${url}
            状态码: ${statusCode}
            响应时间: ${responseTime}ms
            响应数据: ${this.sanitizeResponse(data)}`,
          );
        },
        error: (error: any) => {
          const responseTime = Date.now() - now;

          // 响应信息日志（错误）
          this.logger.error(
            `请求异常 - ${method} ${url}
            响应时间: ${responseTime}ms
            错误消息: ${error.message}`,
          );
        },
      }),
    );
  }

  // 简化响应数据，避免日志过大
  private sanitizeResponse(data: any): string {
    if (!data) return 'null';

    // 如果是标准响应格式，只保留code和message
    if (typeof data === 'object' && 'success' in data) {
      const { success, code, message } = data;
      return JSON.stringify({ success, code, message, data: '...' });
    }

    // 处理数组
    if (Array.isArray(data)) {
      return `Array[${data.length}]`;
    }

    // 处理对象
    if (typeof data === 'object') {
      return JSON.stringify(data, null, 2).substring(0, 200) + '...';
    }

    return String(data);
  }
}
