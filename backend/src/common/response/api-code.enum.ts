/**
 * API状态码枚举
 */
export enum ApiCode {
  SUCCESS = 200,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

/**
 * API状态码消息
 */
export const ApiCodeMessage: Record<ApiCode, string> = {
  [ApiCode.SUCCESS]: '请求成功',
  [ApiCode.BAD_REQUEST]: '请求参数有误',
  [ApiCode.UNAUTHORIZED]: '用户未登录或登录已过期',
  [ApiCode.FORBIDDEN]: '权限不足，无法执行该操作',
  [ApiCode.NOT_FOUND]: '请求的资源不存在',
  [ApiCode.CONFLICT]: '业务逻辑冲突',
  [ApiCode.TOO_MANY_REQUESTS]: '请求过于频繁，请稍后再试',
  [ApiCode.INTERNAL_ERROR]: '系统异常，请稍后再试',
  [ApiCode.SERVICE_UNAVAILABLE]: '服务暂时不可用，请稍后再试',
};
