import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { login, clearError } from '@/store/slices/authSlice';
import { message } from 'antd';
import type { LoginRequest } from '@/types/auth';
import type { AppDispatch, RootState } from '@/store';

export function useLogin() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // 处理已认证用户重定向
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // 处理错误消息
  useEffect(() => {
    if (error) {
      message.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // 处理表单提交
  const handleSubmit = async (values: LoginRequest) => {
    await dispatch(login(values));
  };

  return {
    loading,
    isAuthenticated,
    handleSubmit
  };
}
