import { useState } from 'react';
import { message } from '@/utils';
import type { UploadChangeParam } from 'antd/es/upload';
import { userService } from '@/services/userService';

export function useAvatarUpload() {
  const [uploadLoading, setUploadLoading] = useState(false);

  // 上传头像
  const handleAvatarUpload = async (info: UploadChangeParam) => {
    if (info.file.status === 'uploading') {
      setUploadLoading(true);
      return;
    }

    if (info.file.status === 'done') {
      try {
        await userService.updateAvatar(info.file.originFileObj as File);
        message.success('头像上传成功');
      } catch (error: any) {
        message.error(error?.message || '上传失败');
      } finally {
        setUploadLoading(false);
      }
    }
  };

  return {
    uploadLoading,
    handleAvatarUpload
  };
}
