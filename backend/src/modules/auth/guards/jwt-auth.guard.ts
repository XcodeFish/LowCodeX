import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { SKIP_AUTH_KEY } from '../decorators/skip-auth.decorator';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    super();
  }

  /**
   * 判断是否需要跳过验证
   */
  canActivate(context: ExecutionContext) {
    // 检查是否标记了跳过身份验证
    const skipAuth = this.reflector.getAllAndOverride<boolean>(SKIP_AUTH_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 如果路由标记为跳过验证，允许访问
    if (skipAuth) {
      return true;
    }

    // 获取请求对象
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    // 如果没有Authorization头，则拒绝访问
    if (!authHeader) {
      throw new UnauthorizedException('缺少访问令牌');
    }

    // 从请求头中提取JWT
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      throw new UnauthorizedException('无效的访问令牌格式');
    }

    try {
      // 验证JWT令牌有效性
      const secret = this.configService.get<string>(
        'JWT_SECRET',
        'your-secret-key',
      );
      const payload = this.jwtService.verify(token, { secret });

      // 将JWT载荷添加到请求中
      request.user = payload;

      // 调用父类的canActivate方法，使用Passport验证
      return super.canActivate(context);
    } catch (error) {
      // JWT验证失败，拒绝访问
      throw new UnauthorizedException('访问令牌无效或已过期');
    }
  }

  /**
   * 处理认证异常
   */
  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new UnauthorizedException('身份验证失败');
    }
    return user;
  }
}
