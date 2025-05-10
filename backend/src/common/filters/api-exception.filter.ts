import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ApiCode } from '../response';
import { ApiResponse } from '../response/api-response.class';

/**
 * API异常过滤器
 * 用于将各种异常转换为统一的ApiResponse格式返回
 */
@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  /**
   * 异常处理方法
   * @param exception 异常对象
   * @param host 参数主机
   */
  catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();

    // 记录异常信息
    this.logger.error(
      `路径 ${request.url} 发生异常: ${exception instanceof Error ? exception.message : exception}`,
    );
    if (exception instanceof Error) {
      this.logger.error(exception.stack);
    }

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let responseBody: ApiResponse = ApiResponse.internalError();

    // 处理HttpException
    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const response = exception.getResponse();
      const message =
        typeof response === 'object' && 'message' in response
          ? (response as any).message
          : exception.message;

      // 根据状态码映射为ApiResponse
      switch (statusCode) {
        case HttpStatus.BAD_REQUEST:
          responseBody = ApiResponse.badRequest(
            Array.isArray(message) ? message.join(', ') : message,
          );
          break;
        case HttpStatus.UNAUTHORIZED:
          responseBody = ApiResponse.unauthorized();
          break;
        case HttpStatus.FORBIDDEN:
          responseBody = ApiResponse.forbidden();
          break;
        case HttpStatus.NOT_FOUND:
          responseBody = ApiResponse.notFound();
          break;
        case HttpStatus.CONFLICT:
          responseBody = ApiResponse.conflict(message);
          break;
        case HttpStatus.TOO_MANY_REQUESTS:
          responseBody = ApiResponse.tooManyRequests();
          break;
        case HttpStatus.SERVICE_UNAVAILABLE:
          responseBody = ApiResponse.serviceUnavailable();
          break;
        default:
          responseBody = ApiResponse.error(
            statusCode,
            Array.isArray(message) ? message.join(', ') : message,
          );
      }
    }

    // 发送响应
    httpAdapter.reply(ctx.getResponse(), responseBody, HttpStatus.OK);
  }
}
