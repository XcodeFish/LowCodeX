import { message } from '../utils';
import { API_BASE_URL, HTTP_STATUS, STORAGE_KEYS, ApiCode } from '../constants';
import type { ApiResponse } from '../constants';
import request from './request';

export * from './authService';
export * from './userService';
export { request };

/**
 * 封装的请求方法
 * @param url 请求地址
 * @param options 请求选项
 * @returns Promise
 */
export async function request<T = any>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options?.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, mergedOptions);

    // 处理HTTP状态码
    if (!response.ok) {
      let errorMessage = '';

      switch (response.status) {
        case HTTP_STATUS.UNAUTHORIZED:
          // 未授权，清除token并跳转登录页
          localStorage.removeItem(STORAGE_KEYS.TOKEN);
          window.location.href = '/login';
          errorMessage = '未授权，请重新登录';
          break;

        case HTTP_STATUS.FORBIDDEN:
          errorMessage = '无权访问该资源';
          break;

        case HTTP_STATUS.NOT_FOUND:
          errorMessage = '请求的资源不存在';
          break;

        case HTTP_STATUS.SERVER_ERROR:
          errorMessage = '服务器错误，请稍后再试';
          break;

        default:
          errorMessage = `请求失败: ${response.statusText}`;
          break;
      }

      message.error(errorMessage);

      // 创建一个被控制的错误对象，避免显示在控制台或右侧
      const error = new Error(errorMessage);
      // @ts-ignore
      error.isHandled = true;
      throw error;
    }

    const data = await response.json();

    // 处理业务状态码
    if (data.code !== ApiCode.SUCCESS) {
      message.error(data.message || '请求失败');

      // 创建一个被控制的错误对象，避免显示在控制台或右侧
      const error = new Error(data.message || '请求失败');
      // @ts-ignore
      error.isHandled = true;
      throw error;
    }

    return data;
  } catch (error) {
    // 检查错误是否已处理
    // @ts-ignore
    if (!error.isHandled) {
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error('请求过程中发生错误');
      }
    }

    // 返回一个空的成功响应，而不是抛出错误
    // 这样可以防止错误向上传播到React组件
    return {
      code: ApiCode.SUCCESS,
      message: 'Error handled',
      data: null as unknown as T,
      timestamp: Date.now()
    };
  }
}

/**
 * GET请求方法
 * @param url 请求地址
 * @param params 请求参数
 * @returns Promise
 */
export function get<T = any>(
  url: string,
  params?: Record<string, any>
): Promise<ApiResponse<T>> {
  // 构建查询字符串
  const queryString = params
    ? `?${Object.entries(params)
        .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
        .join('&')}`
    : '';

  return request<T>(`${url}${queryString}`, {
    method: 'GET',
  });
}

/**
 * POST请求方法
 * @param url 请求地址
 * @param data 请求数据
 * @returns Promise
 */
export function post<T = any>(
  url: string,
  data?: any
): Promise<ApiResponse<T>> {
  return request<T>(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * PUT请求方法
 * @param url 请求地址
 * @param data 请求数据
 * @returns Promise
 */
export function put<T = any>(
  url: string,
  data?: any
): Promise<ApiResponse<T>> {
  return request<T>(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * DELETE请求方法
 * @param url 请求地址
 * @param data 请求数据
 * @returns Promise
 */
export function del<T = any>(
  url: string,
  data?: any
): Promise<ApiResponse<T>> {
  return request<T>(url, {
    method: 'DELETE',
    body: data ? JSON.stringify(data) : undefined,
  });
}
