import { useState } from 'react';
import { message } from '@/utils';
import { authService } from '@/services/authService';

export function useCaptcha() {
  const [captchaImage, setCaptchaImage] = useState<string>('');
  const [captchaId, setCaptchaId] = useState<string>('');
  const [captchaLoading, setCaptchaLoading] = useState<boolean>(false);

  // 获取验证码
  const fetchCaptcha = async () => {
    setCaptchaLoading(true);
    try {
      // const response = await authService.getCaptcha();
      // setCaptchaId(response.captchaId);
      // setCaptchaImage(response.captchaImage);
    } catch (err) {
      message.error('获取验证码失败');
    } finally {
      setCaptchaLoading(false);
    }
  };

  return {
    captchaId,
    captchaImage,
    captchaLoading,
    fetchCaptcha
  };
}
