import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { ApiCode } from '../types';

// 扩展 Axios 配置类型
declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    onRequestComplete?: () => void;
  }
}

// 标记错误为已处理，避免React错误边界捕获并重新渲染
export const markErrorAsHandled = (error: any) => {
  if (error) {
    // 添加标记，表示错误已被处理
    error.isHandled = true;
    error.isSilent = true;
    // 防止显示在控制台
    if (typeof error.preventDefault === 'function') {
      error.preventDefault();
    }
  }
  return error;
};

// 创建静默错误，不会触发UI更新
export const createSilentError = (message: string) => {
  const error = new Error(message);
  return markErrorAsHandled(error);
};

// API基础URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000/api';

// 调试日志
console.info(`[API] 使用API基础URL: ${API_BASE_URL}`);

// 创建API客户端实例
const createApiClient = () => {
  // 存储活跃请求的取消令牌
  const pendingRequests = new Map();

  // 生成请求的唯一标识符
  const getRequestKey = (config: InternalAxiosRequestConfig) => {
    const { method, url, params, data } = config;
    return `${method}:${url}:${JSON.stringify(params)}:${JSON.stringify(data)}`;
  };

  // 预防频繁重试的URL黑名单
  const retryLimitedPaths = ['/v1/auth/me', '/v1/auth/refresh-token'];

  const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    // 添加超时设置
    timeout: 15000,
  });

  // 添加请求拦截器
  apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // 创建取消令牌
      const source = axios.CancelToken.source();
      config.cancelToken = source.token;

      // 获取请求的唯一标识符
      const requestKey = getRequestKey(config);

      // 如果有相同的请求正在进行中，取消它
      if (pendingRequests.has(requestKey)) {
        const { source: prevSource } = pendingRequests.get(requestKey);
        prevSource.cancel(`重复请求已取消: ${requestKey}`);
        pendingRequests.delete(requestKey);
      }

      // 检查URL是否在受限列表中
      const isLimitedPath = retryLimitedPaths.some(path => config.url?.includes(path));
      if (isLimitedPath) {
        const storageKey = `networkErrorCount:${config.url}`;
        const errorCount = parseInt(localStorage.getItem(storageKey) || '0', 10);

        // 如果错误计数超过限制，取消请求
        if (errorCount >= 3) {
          console.warn(`[API] ${config.url} 请求失败次数过多，暂停请求`);
          source.cancel(`请求失败次数过多: ${config.url}`);
          return config;
        }
      }

      // 存储请求和取消函数
      pendingRequests.set(requestKey, {
        source,
        timestamp: Date.now()
      });

      // 添加请求完成的回调，以便从pendingRequests中删除
      const onRequestComplete = () => {
        pendingRequests.delete(requestKey);
      };

      // 在请求完成后执行清理
      config.onRequestComplete = onRequestComplete;

      // 调试日志
      console.debug(`[API] 请求: ${config.method?.toUpperCase()} ${config.url}`, {
        headers: config.headers,
        data: config.data,
        params: config.params
      });

      return config;
    },
    (error) => {
      console.error('[API] 请求拦截器错误:', error);
      return Promise.reject(markErrorAsHandled(error));
    }
  );

  // 添加响应拦截器
  apiClient.interceptors.response.use(
    (response) => {
      // 请求完成，执行清理
      if (response.config.onRequestComplete) {
        response.config.onRequestComplete();
      }

      // 调试日志
      console.debug(`[API] 响应: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data
      });

      if (response.data.code === ApiCode.SUCCESS) {
        return response.data;
      } else {
        console.warn(`[API] 业务错误: ${response.data.message || '未知错误'}`, response.data);
        // return Promise.reject(createSilentError(response.data.message || '请求失败'));
        return response.data;
      }
    },
    (error) => {
      console.error('[API] 响应错误:', error);
      return Promise.reject(markErrorAsHandled(error));
    }
    // async (error) => {
    //   // 请求完成，执行清理
    //   if (error.config && error.config.onRequestComplete) {
    //     error.config.onRequestComplete();
    //   }

    //   // 如果是取消请求，直接返回
    //   if (axios.isCancel(error)) {
    //     console.warn(`[API] 请求已取消: ${error.message}`);
    //     return Promise.reject(markErrorAsHandled(error));
    //   }

    //   // 检查是否为网络连接错误
    //   const isNetworkError = error.message === 'Network Error';

    //   // 详细记录错误信息
    //   console.error('[API] 响应错误:', {
    //     message: error.message,
    //     isNetworkError,
    //     config: error.config ? {
    //       url: error.config.url,
    //       method: error.config.method,
    //       baseURL: error.config.baseURL
    //     } : '无配置信息',
    //     response: error.response ? {
    //       status: error.response.status,
    //       data: error.response.data
    //     } : '无响应数据',
    //     isTimeout: error.code === 'ECONNABORTED'
    //   });

    //   // 检查特定URL的网络错误重试次数限制
    //   if (isNetworkError && error.config && error.config.url) {
    //     const url = error.config.url;
    //     const storageKey = `networkErrorCount:${url}`;
    //     const errorCount = parseInt(localStorage.getItem(storageKey) || '0', 10);

    //     // 增加错误计数
    //     localStorage.setItem(storageKey, (errorCount + 1).toString());

    //     // 如果错误次数过多，避免无限循环
    //     if (errorCount >= 3) {
    //       console.warn(`[API] ${url} 接口连接失败次数过多 (${errorCount + 1}), 停止重试`);

    //       // 10分钟后重置计数器（允许将来再次尝试）
    //       setTimeout(() => {
    //         localStorage.removeItem(storageKey);
    //       }, 10 * 60 * 1000);

    //       return Promise.reject(markErrorAsHandled(error));
    //     }
    //   }

    //   const originalRequest = error.config;

    //   // 标记错误为已处理
    //   markErrorAsHandled(error);

    //   // 处理token过期问题
    //   if (error.response && error.response.status === 401 && !originalRequest._retry) {
    //     originalRequest._retry = true;
    //     try {
    //       console.log('[API] Token过期，尝试刷新');
    //       const refreshToken = localStorage.getItem('refreshToken');
    //       if (!refreshToken) {
    //         console.warn('[API] 刷新Token失败: 无refreshToken');
    //         return Promise.reject(markErrorAsHandled(error));
    //       }
    //       const response = await apiClient.post('/v1/auth/refresh-token', {
    //         refreshToken,
    //       });
    //       const { accessToken } = response.data.data;
    //       localStorage.setItem('token', accessToken);
    //       localStorage.setItem('refreshToken', response.data.data.refreshToken);
    //       console.log('[API] Token刷新成功，重试原始请求');
    //       // 更新请求头并重试
    //       originalRequest.headers.Authorization = `Bearer ${accessToken}`;
    //       return apiClient(originalRequest);
    //     } catch (refreshError) {
    //       console.error('[API] 刷新Token失败', refreshError);
    //       // 标记刷新错误为已处理
    //       markErrorAsHandled(refreshError);

    //       // 刷新token失败，清除登录状态
    //       localStorage.removeItem('token');
    //       localStorage.removeItem('refreshToken');

    //       // 使用setTimeout避免立即重定向触发页面重渲染
    //       setTimeout(() => {
    //         window.location.href = '/login';
    //       }, 100);

    //       return Promise.reject(markErrorAsHandled(refreshError));
    //     }
    //   }
    //   return Promise.reject(markErrorAsHandled(error));
    // }
  );

  return apiClient;
};

// 导出单例实例
export const apiClient = createApiClient();

// 导出请求方法
export default {
  get: <T = any>(url: string, config?: AxiosRequestConfig) => {
    return apiClient.get<T, any>(url, config);
  },
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
    return apiClient.post<T, any>(url, data, config);
  },
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
    return apiClient.put<T, any>(url, data, config);
  },
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
    return apiClient.patch<T, any>(url, data, config);
  },
  delete: <T = any>(url: string, config?: AxiosRequestConfig) => {
    return apiClient.delete<T, any>(url, config);
  },
  // 直接访问原始axios实例
  client: apiClient,
};
