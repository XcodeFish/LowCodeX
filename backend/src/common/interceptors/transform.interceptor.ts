import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
  timestamp: string;
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
        // 如果数据已经是标准格式，则直接返回
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // 处理空响应
        if (data === undefined || data === null) {
          data = {} as T;
        }

        // 统一响应格式
        return {
          success: true,
          code: 'SUCCESS',
          message: '操作成功',
          data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
