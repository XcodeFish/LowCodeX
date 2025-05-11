import { useEffect } from 'react';
import type { FormInstance } from 'antd';

export function useRememberUsername(form: FormInstance) {
  // 初始化表单，加载之前记住的用户名
  useEffect(() => {
    const rememberedUsername = localStorage.getItem('rememberedUsername');
    if (rememberedUsername) {
      form.setFieldsValue({ username: rememberedUsername, remember: true });
    }
  }, [form]);

  // 处理记住用户名
  const saveUsername = (username: string, remember: boolean) => {
    if (remember) {
      localStorage.setItem('rememberedUsername', username);
    } else {
      localStorage.removeItem('rememberedUsername');
    }
  };

  return { saveUsername };
}
