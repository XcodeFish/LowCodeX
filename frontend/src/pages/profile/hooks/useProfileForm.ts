import { useEffect, useState } from 'react';
import { message, Form } from 'antd';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import type { ProfileUpdateParams } from '../../../types';
import { userService } from '../../../services';
import { message as customMessage } from '../../../utils';

export function useProfileForm() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);

  // 初始化表单值
  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        username: user.username,
        email: user.email
      });
    }
  }, [user, form]);

  // 提交更新
  const handleSubmit = async (id: string, values: ProfileUpdateParams) => {
    setLoading(true);
    try {
      await userService.updateProfile(id, values);
      customMessage.success('个人资料更新成功');
    } catch (error: any) {
      customMessage.error(error?.message || '更新失败');
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    loading,
    user,
    handleSubmit
  };
}
