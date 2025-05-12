import { useState } from 'react';
import { Form } from 'antd';
import { message } from '@/utils';
import {authService} from '@/services/authService';

export const useForgetPassword = () => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [loading, setLoading] = useState(false);

  // 发送重置密码邮件
  const handleSendResetEmail = async (values: { email: string }) => {
    setLoading(true);
    try {
      // await authService.requestPasswordReset(values.email);
      // setEmail(values.email);
      message.success('重置密码邮件已发送，请检查邮箱');
      // setCurrentStep(1);
    } catch (error: any) {
      message.error(error.response?.data?.message || '发送重置密码邮件失败');
    } finally {
      setLoading(false);
    }
  };

  // 验证重置密码令牌
  const handleVerifyToken = async (values: { token: string }) => {
    setResetToken(values.token);
    setCurrentStep(2);
  };

  // 重置密码
  const handleResetPassword = async (values: { newPassword: string; confirmPassword: string }) => {
    setLoading(true);
    try {
      // await authService.resetPassword({
      //   token: resetToken,
      //   newPassword: values.newPassword,
      //   confirmPassword: values.confirmPassword
      // });
      message.success('密码重置成功');
      // setCurrentStep(3);
    } catch (error: any) {
      message.error(error.response?.data?.message || '重置密码失败');
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
    currentStep,
    email,
    loading,
    handleSendResetEmail,
    handleVerifyToken,
    handleResetPassword,
    validateConfirmPassword,
    validatePasswordStrength
  };
};
