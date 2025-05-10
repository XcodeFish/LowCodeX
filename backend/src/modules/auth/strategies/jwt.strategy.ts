import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { JwtPayload } from '../../../types/auth.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET') || 'your-secret-key',
    });
  }

  async validate(payload: JwtPayload) {
    // 从令牌载荷中获取用户ID
    const userId = payload.sub;

    try {
      // 从数据库查询用户
      const user = await this.usersService.findOneWithRoles(userId);

      if (!user) {
        throw new UnauthorizedException('令牌无效或用户不存在');
      }

      if (user.status !== 'active') {
        throw new UnauthorizedException('用户账号已禁用');
      }

      // 返回用户信息（将添加到请求对象中）
      return user;
    } catch (error) {
      throw new UnauthorizedException('认证失败');
    }
  }
}
