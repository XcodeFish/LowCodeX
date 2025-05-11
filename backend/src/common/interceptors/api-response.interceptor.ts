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
 * 注意：这个拦截器将在TransformInterceptor之前执行
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
        // 检查是否已经符合API规范格式（数字类型code），如果是，直接返回，不做处理
        if (
          data &&
          typeof data === 'object' &&
          'code' in data &&
          typeof data.code === 'number' &&
          'message' in data &&
          'data' in data &&
          'timestamp' in data
        ) {
          return data;
        }

        // 检查是否包含旧的外层格式（包含success字段），如果是，交给TransformInterceptor处理
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // 如果返回值已经是ApiResponse类型，则直接返回
        if (data instanceof ApiResponse) {
          return data;
        }

        // 检查是否是嵌套的API响应格式
        if (
          data &&
          typeof data === 'object' &&
          'code' in data &&
          typeof data.code === 'number' &&
          'message' in data &&
          'data' in data
        ) {
          // 这可能是一个符合ApiResponse格式的普通对象，但不是实例
          // 我们将其转换为ApiResponse实例
          return new ApiResponse(data.code, data.message, data.data);
        }

        // 否则包装为成功响应
        return ApiResponse.success(data);
      }),
    );
  }
}
