import { useCallback, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '@/hooks';
import { message as messageUtil } from '@/utils';
import type { LoginRequest } from '@/types/auth';
import type { RootState } from '@/store';

/**
 * 登录逻辑钩子，处理用户登录和相关状态
 */
export function useLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, clearAuthError } = auth.useAuth();
  const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // 使用ref保存登录过程中的状态，防止重渲染引起的UI闪烁
  const formValuesRef = useRef<LoginRequest | null>(null);
  const isProcessingRef = useRef<boolean>(false);
  const loginMessageRef = useRef<(() => void) | null>(null);

  // 在组件挂载时确保清除可能存在的消息
  useEffect(() => {
    // 初始化时清除所有消息
    messageUtil.destroy();

    // 组件卸载时也清除所有消息
    return () => {
      messageUtil.destroy();
      if (loginMessageRef.current) {
        loginMessageRef.current();
        loginMessageRef.current = null;
      }
    };
  }, []);

  // 处理已认证用户重定向
  useEffect(() => {
    if (isAuthenticated) {
      // 如果有消息提示，关闭它
      if (loginMessageRef.current) {
        loginMessageRef.current();
        loginMessageRef.current = null;
      }

      // 显示登录成功消息
      messageUtil.success('登录成功，正在跳转...', 1);

      // 短暂延迟后跳转，给用户视觉反馈
      setTimeout(() => {
        const from = (location.state as any)?.from?.pathname || '/';
        navigate(from, { replace: true });
      }, 300);
    }
  }, [isAuthenticated, navigate, location]);

  // 处理错误消息
  useEffect(() => {
    if (error) {
      // 先关闭所有消息
      messageUtil.destroy();

      // 关闭加载中消息
      if (loginMessageRef.current) {
        loginMessageRef.current();
        loginMessageRef.current = null;
      }

      // 延迟显示错误消息，避免与其他消息重叠
      setTimeout(() => {
        // 设置固定的错误消息文本，并设置4秒的显示时间
        const errorMsg = '登录失败，请检查用户名和密码';
        // 强制使用错误消息，设置4秒自动消失
        const hideError = messageUtil.error(errorMsg, 2);

        // 额外设置5秒后强制清除消息的保障
        setTimeout(() => {
          hideError();
          messageUtil.destroy();
        }, 2000);

        clearAuthError();
      }, 100);

      // 重置处理状态
      isProcessingRef.current = false;
    }
  }, [error, clearAuthError]);

  // 处理表单提交
  const handleSubmit = useCallback(async (values: LoginRequest) => {
    try {
      // 如果已经在处理中，则不重复提交
      if (isProcessingRef.current || loading) {
        return Promise.resolve();
      }

      // 标记正在处理
      isProcessingRef.current = true;

      // 保存表单值
      formValuesRef.current = { ...values };

      // 先清除所有可能存在的消息
      messageUtil.destroy();

      // 如果有上一个加载消息，关闭它
      if (loginMessageRef.current) {
        loginMessageRef.current();
        loginMessageRef.current = null;
      }

      // 显示新的登录中消息，使用顶部消息条
      loginMessageRef.current = messageUtil.loading('登录中，请稍候...', 0);

      // 提交登录请求
      const result = await login(values);

      if (!result.success) {
        // 登录失败，会由错误处理效果处理
        isProcessingRef.current = false;
      }
    } catch (e) {
      // 关闭加载中消息
      messageUtil.destroy();
      if (loginMessageRef.current) {
        loginMessageRef.current();
        loginMessageRef.current = null;
      }

      console.error('登录过程中出现错误:', e);
      // 设置3秒后自动消失
      messageUtil.error('登录失败，请稍后重试', 3);

      // 重置处理状态
      isProcessingRef.current = false;
    }
  }, [login, loading]);

  // 强制停止所有可见错误消息的函数
  const clearLoginMessages = useCallback(() => {
    messageUtil.destroy();
    if (loginMessageRef.current) {
      loginMessageRef.current();
      loginMessageRef.current = null;
    }
    clearAuthError();
  }, [clearAuthError]);

  return {
    loading,
    isAuthenticated,
    handleSubmit,
    clearLoginMessages,
    // 提供已保存的表单值，便于恢复
    savedFormValues: formValuesRef.current
  };
}
