import { ApiCode, ApiCodeMessage } from './api-code.enum';

/**
 * API统一响应结构
 */
export class ApiResponse<T = any> {
  /**
   * 业务状态码
   */
  code: number;

  /**
   * 状态描述信息
   */
  message: string;

  /**
   * 业务数据
   */
  data: T | null;

  /**
   * 响应时间戳（毫秒）
   */
  timestamp: number;

  constructor(code: number, message: string, data: T | null) {
    this.code = code;
    this.message = message;
    this.data = data;
    this.timestamp = Date.now();
  }

  /**
   * 成功响应
   * @param data 数据
   * @returns ApiResponse
   */
  static success<T>(data: T = null): ApiResponse<T> {
    return new ApiResponse<T>(
      ApiCode.SUCCESS,
      ApiCodeMessage[ApiCode.SUCCESS],
      data,
    );
  }

  /**
   * 成功响应（自定义消息）
   * @param message 消息
   * @param data 数据
   * @returns ApiResponse
   */
  static successWithMessage<T>(
    message: string,
    data: T = null,
  ): ApiResponse<T> {
    return new ApiResponse<T>(ApiCode.SUCCESS, message, data);
  }

  /**
   * 错误响应
   * @param code 错误码
   * @param message 错误消息
   * @returns ApiResponse
   */
  static error<T>(code: number, message: string): ApiResponse<T> {
    return new ApiResponse<T>(code, message, null);
  }

  /**
   * 错误响应
   * @param apiCode API状态码枚举
   * @returns ApiResponse
   */
  static errorWithCode<T>(apiCode: ApiCode): ApiResponse<T> {
    return new ApiResponse<T>(apiCode, ApiCodeMessage[apiCode], null);
  }

  /**
   * 错误响应（自定义消息）
   * @param apiCode API状态码枚举
   * @param message 错误消息
   * @returns ApiResponse
   */
  static errorWithCodeAndMessage<T>(
    apiCode: ApiCode,
    message: string,
  ): ApiResponse<T> {
    return new ApiResponse<T>(apiCode, message, null);
  }

  /**
   * 参数错误
   * @param message 错误消息
   * @returns ApiResponse
   */
  static badRequest<T>(message: string): ApiResponse<T> {
    return ApiResponse.errorWithCodeAndMessage(ApiCode.BAD_REQUEST, message);
  }

  /**
   * 未授权
   * @returns ApiResponse
   */
  static unauthorized<T>(): ApiResponse<T> {
    return ApiResponse.errorWithCode(ApiCode.UNAUTHORIZED);
  }

  /**
   * 权限不足
   * @returns ApiResponse
   */
  static forbidden<T>(): ApiResponse<T> {
    return ApiResponse.errorWithCode(ApiCode.FORBIDDEN);
  }

  /**
   * 资源不存在
   * @returns ApiResponse
   */
  static notFound<T>(): ApiResponse<T> {
    return ApiResponse.errorWithCode(ApiCode.NOT_FOUND);
  }

  /**
   * 资源不存在（自定义消息）
   * @param message 错误消息
   * @returns ApiResponse
   */
  static notFoundWithMessage<T>(message: string): ApiResponse<T> {
    return ApiResponse.errorWithCodeAndMessage(ApiCode.NOT_FOUND, message);
  }

  /**
   * 业务冲突
   * @param message 错误消息
   * @returns ApiResponse
   */
  static conflict<T>(message: string): ApiResponse<T> {
    return ApiResponse.errorWithCodeAndMessage(ApiCode.CONFLICT, message);
  }

  /**
   * 请求过于频繁
   * @returns ApiResponse
   */
  static tooManyRequests<T>(): ApiResponse<T> {
    return ApiResponse.errorWithCode(ApiCode.TOO_MANY_REQUESTS);
  }

  /**
   * 服务器内部错误
   * @returns ApiResponse
   */
  static internalError<T>(): ApiResponse<T> {
    return ApiResponse.errorWithCode(ApiCode.INTERNAL_ERROR);
  }

  /**
   * 服务不可用
   * @returns ApiResponse
   */
  static serviceUnavailable<T>(): ApiResponse<T> {
    return ApiResponse.errorWithCode(ApiCode.SERVICE_UNAVAILABLE);
  }
}
