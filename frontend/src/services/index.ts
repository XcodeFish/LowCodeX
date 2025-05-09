import { message } from 'antd';
import { API_BASE_URL, HTTP_STATUS, STORAGE_KEYS } from '../constants';
import type { ApiResponse } from '../types';

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
      switch (response.status) {
        case HTTP_STATUS.UNAUTHORIZED:
          // 未授权，清除token并跳转登录页
          localStorage.removeItem(STORAGE_KEYS.TOKEN);
          window.location.href = '/login';
          throw new Error('未授权，请重新登录');

        case HTTP_STATUS.FORBIDDEN:
          throw new Error('无权访问该资源');

        case HTTP_STATUS.NOT_FOUND:
          throw new Error('请求的资源不存在');

        case HTTP_STATUS.SERVER_ERROR:
          throw new Error('服务器错误，请稍后再试');

        default:
          throw new Error(`请求失败: ${response.statusText}`);
      }
    }

    const data = await response.json();

    // 处理业务状态码
    if (data.code !== HTTP_STATUS.OK) {
      message.error(data.message || '请求失败');
      throw new Error(data.message || '请求失败');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      message.error(error.message);
    } else {
      message.error('请求过程中发生错误');
    }
    throw error;
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
