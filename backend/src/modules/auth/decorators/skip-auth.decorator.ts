import { SetMetadata } from '@nestjs/common';

/**
 * 跳过认证装饰器
 * 用于标记不需要进行身份验证的路由
 * 使用方法: @SkipAuth()
 */
export const SKIP_AUTH_KEY = 'skipAuth';
export const SkipAuth = () => SetMetadata(SKIP_AUTH_KEY, true);
