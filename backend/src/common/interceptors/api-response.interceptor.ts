import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../response';

/**
 * API响应拦截器
 * 用于将控制器方法的返回值包装为统一的ApiResponse格式
 */
@Injectable()
export class ApiResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  /**
   * 拦截方法
   * @param context 执行上下文
   * @param next 后续处理程序
   * @returns Observable<ApiResponse<T>>
   */
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // 如果返回值已经是ApiResponse类型，则直接返回
        if (data instanceof ApiResponse) {
          return data;
        }

        // 否则包装为成功响应
        return ApiResponse.success(data);
      }),
    );
  }
}
