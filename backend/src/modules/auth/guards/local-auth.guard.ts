import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * 本地认证守卫
 * 用于登录接口验证用户名密码
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  /**
   * 处理认证异常
   */
  handleRequest(err, user, info, context: ExecutionContext) {
    if (err || !user) {
      throw err || new UnauthorizedException('用户名或密码错误');
    }

    // 将用户信息添加到请求对象中
    const request = context.switchToHttp().getRequest();
    request.user = user;

    return user;
  }
}
