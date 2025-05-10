import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export interface UserInfo {
  id: number;
  username: string;
  email: string;
  roles: string[];
  tenantId?: number;
  [key: string]: any;
}

/**
 * 获取当前登录用户信息的装饰器
 * 使用方式: @CurrentUser() user: UserInfo
 */
export const CurrentUser = createParamDecorator(
  (data: keyof UserInfo | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user as UserInfo;

    if (!user) {
      return null;
    }

    return data ? user[data] : user;
  },
);
