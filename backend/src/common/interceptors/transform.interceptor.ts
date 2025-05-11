import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../response';
import { ApiCode } from '../response/api-code.enum';

/**
 * 规范化响应接口定义
 */
export interface Response<T> {
  code: number; // 业务状态码，使用数字类型
  message: string; // 状态描述信息
  data: T | null; // 业务数据
  timestamp: number; // 响应时间戳（毫秒）
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        // 如果数据已经是ApiResponse格式，不应被这个拦截器处理
        if (data instanceof ApiResponse) {
          return data;
        }

        // 如果数据已经符合规范格式（有code字段且为数字类型），则直接返回
        if (
          data &&
          typeof data === 'object' &&
          'code' in data &&
          typeof data.code === 'number' &&
          'message' in data &&
          'data' in data
        ) {
          // 确保包含timestamp字段
          if (!('timestamp' in data) || typeof data.timestamp !== 'number') {
            data.timestamp = Date.now();
          }
          return data;
        }

        // 如果是旧的格式（包含success字段，code为字符串），进行转换
        if (
          data &&
          typeof data === 'object' &&
          'success' in data &&
          'code' in data &&
          typeof data.code === 'string' &&
          'message' in data
        ) {
          // 旧格式转换为新规范格式
          return {
            code: data.success ? ApiCode.SUCCESS : ApiCode.BAD_REQUEST, // 根据success转换为对应的数字状态码
            message: data.message,
            data: data.data,
            timestamp: Date.now(),
          };
        }

        // 处理空响应
        if (data === undefined || data === null) {
          data = null as any;
        }

        // 统一响应格式
        return {
          code: ApiCode.SUCCESS, // 使用枚举的数字值
          message: '请求成功',
          data,
          timestamp: Date.now(),
        };
      }),
    );
  }
}
