import { Form } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from '@/utils';
import { auth } from '@/hooks';
import type { ChangePasswordParams } from '@/types/user';

export const useChangePassword = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  // 在实际实现中可以使用auth.useAuth()提供修改密码的方法

  // 提交修改密码
  const handleSubmit = async (values: ChangePasswordParams) => {
    setLoading(true);
    try {
      // 在这里实现修改密码的逻辑，可以使用auth.useAuth()中的相关方法
      // 例如: await authHook.changePassword(values.oldPassword, values.newPassword);
      message.success('密码修改成功，请重新登录');
      // navigate('/login');
    } catch (error: any) {
      message.error(error || '修改密码失败');
    } finally {
      setLoading(false);
    }
  };

  // 密码验证规则
  const validateConfirmPassword = (_: any, value: string) => {
    const password = form.getFieldValue('newPassword');
    if (value && value !== password) {
      return Promise.reject(new Error('两次输入的密码不一致'));
    }
    return Promise.resolve();
  };

  const validatePasswordStrength = (_: any, value: string) => {
    if (!value) return Promise.resolve();

    if (value.length < 8) {
      return Promise.reject(new Error('密码长度至少为8个字符'));
    }

    if (!/\d/.test(value)) {
      return Promise.reject(new Error('密码必须包含数字'));
    }

    if (!/[a-zA-Z]/.test(value)) {
      return Promise.reject(new Error('密码必须包含字母'));
    }

    if (!/[^a-zA-Z0-9]/.test(value)) {
      return Promise.reject(new Error('密码必须包含特殊字符'));
    }

    return Promise.resolve();
  };

  return {
    form,
    loading,
    handleSubmit,
    validateConfirmPassword,
    validatePasswordStrength,
    onBack: () => navigate('/profile')
  };
};
