import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form } from 'antd';
import { auth } from '../../../hooks';
import type { LoginRequest } from '../../../types/auth';

/**
 * 登录逻辑钩子，处理用户登录和相关状态
 */
export const useLogin = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, getRememberedUsername } = auth.useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 使用ref来跟踪组件是否已卸载
  const isMounted = useRef(true);

  // 组件卸载时设置标志
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // 从localstorage获取记住的用户名
  const rememberedUsername = getRememberedUsername();

  // 处理登录请求
  const handleLogin = async (values: LoginRequest) => {
    try {
      setLoading(true);
      setErrorMessage('');

      // 清除之前的重定向计数和请求状态
      sessionStorage.removeItem('redirectCount');
      localStorage.removeItem('fetchingUserInfo');

      const result = await login({
        username: values.username,
        password: values.password,
        rememberMe: values.rememberMe
      });

      // 检查组件是否已卸载
      if (!isMounted.current) return;

      if (result.success) {
        // 登录成功，重定向到受保护路由或首页
        const from = (location.state as any)?.from?.pathname || '/';
        navigate(from);
      } else {
        // 显示错误消息
        setErrorMessage(result.error || '登录失败，请检查用户名和密码');
      }
    } catch (error: any) {
      // 检查组件是否已卸载
      if (!isMounted.current) return;
      setErrorMessage(error.message || '登录过程中发生错误');
    } finally {
      // 检查组件是否已卸载
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  return {
    form,
    rememberedUsername,
    loading,
    errorMessage,
    handleLogin
  };
};

export default useLogin;
