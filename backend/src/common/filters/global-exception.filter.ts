import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Request } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();

    // 记录异常信息
    const { url, method, body, params, query } = request;
    this.logger.error(
      `异常捕获 - ${method} ${url}\n请求信息: ${JSON.stringify({
        body,
        params,
        query,
      })}\n异常详情:`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '服务器内部错误';
    let code = 'INTERNAL_SERVER_ERROR';
    let data = null;

    // 处理不同类型的异常
    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const response = exception.getResponse();
      message =
        typeof response === 'object' && 'message' in response
          ? Array.isArray(response['message'])
            ? response['message'][0]
            : (response['message'] as string)
          : exception.message;
      code =
        typeof response === 'object' && 'error' in response
          ? (response['error'] as string)
          : `HTTP_${statusCode}`;
    } else if (exception instanceof PrismaClientKnownRequestError) {
      // 处理Prisma错误
      switch (exception.code) {
        case 'P2002': // 唯一约束失败
          statusCode = HttpStatus.CONFLICT;
          message = '数据已存在，无法创建重复记录';
          code = 'RESOURCE_CONFLICT';
          break;
        case 'P2025': // 记录不存在
          statusCode = HttpStatus.NOT_FOUND;
          message = '请求的资源不存在';
          code = 'RESOURCE_NOT_FOUND';
          break;
        default:
          statusCode = HttpStatus.BAD_REQUEST;
          message = '数据库操作错误';
          code = 'DATABASE_ERROR';
      }

      // 添加更多Prisma错误代码的处理...
    }

    const responseBody = {
      success: false,
      code,
      message,
      data,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, statusCode);
  }
}
