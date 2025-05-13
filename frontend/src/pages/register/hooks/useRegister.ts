import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from '../../../utils';
import { authService } from '../../../services';
import { useAppDispatch } from '../../../hooks';
import { setLoading, setError } from '../../../store';
import type { RegisterUserRequest } from '../../../types';

/**
 * 注册功能的业务逻辑钩子
 * @returns 注册相关的状态和方法
 */
export const useRegister = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [loading, setLoadingState] = useState(false);
  const [error, setErrorState] = useState<string | null>(null);

  // 记录是否已经显示成功消息，避免重复显示
  const [successMessageShown, setSuccessMessageShown] = useState(false);

  /**
   * 处理注册表单提交
   * @param values 注册表单数据
   */
  const handleSubmit = async (values: RegisterUserRequest) => {
    try {
      // 如果已经显示过成功消息，直接返回
      if (successMessageShown) {
        return { success: true };
      }

      setLoadingState(true);
      setErrorState(null);
      dispatch(setLoading(true));
      dispatch(setError(null));

      // 调用注册API
      const response = await authService.register(values);

      if (response && response.data) {
        // 标记已显示成功消息
        setSuccessMessageShown(true);

        // 使用自定义message组件
        message.success('注册成功！请登录您的账号', 2);

        // 清理表单和状态
        setTimeout(() => {
          // 在跳转前重置所有状态
          setLoadingState(false);
          dispatch(setLoading(false));

          // 跳转到登录页面
          navigate('/login', { replace: true });
        }, 1500);

        return { success: true };
      }

      setErrorState('注册失败，请稍后再试');
      return { success: false, error: '注册失败，请稍后再试' };
    } catch (error: any) {
      console.error('注册错误:', error);
      const errorMsg = error.response?.data?.message || '注册失败，请稍后再试';
      setErrorState(errorMsg);
      dispatch(setError(errorMsg));
      // 使用自定义message组件显示错误
      message.error(errorMsg, 3);
      return { success: false, error: errorMsg };
    } finally {
      if (!successMessageShown) {
        setLoadingState(false);
        dispatch(setLoading(false));
      }
    }
  };

  /**
   * 清除注册错误信息
   */
  const clearRegisterMessages = () => {
    setErrorState(null);
    dispatch(setError(null));
    message.destroy();  // 确保清除所有可能的消息
  };

  return {
    loading,
    error,
    handleSubmit,
    clearRegisterMessages
  };
};

export default useRegister;
