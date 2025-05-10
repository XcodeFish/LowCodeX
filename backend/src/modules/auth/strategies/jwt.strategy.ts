import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../services/prisma.service';
import {
  AuditLogService,
  AuditLogAction,
} from '../../system/services/audit-log.service';

interface JwtUser {
  id: string;
  tenantId: string;
  username: string;
  email: string;
  status: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService,
    private auditLogService: AuditLogService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'your-secret-key'),
    });
  }

  /**
   * JWT策略验证方法
   * 将JWT的信息转换为用户信息
   */
  async validate(payload: any) {
    // 验证令牌中的用户ID是否有效
    const users = await this.prismaService.$queryRaw<JwtUser[]>`
      SELECT u.id, u.\`tenantId\`, u.username, u.email, u.status
      FROM \`users\` u
      WHERE u.id = ${payload.sub}
    `;

    // 如果没有找到用户或用户状态不是活跃状态，则拒绝访问
    if (!users.length || users[0].status !== 'ACTIVE') {
      throw new UnauthorizedException('用户不存在或已被禁用');
    }

    const user = users[0];

    // 记录用户验证成功的日志
    this.auditLogService.logWithUser(
      user,
      AuditLogAction.READ,
      'auth',
      undefined,
      '用户JWT令牌验证成功',
    );

    // 返回用户信息
    return {
      userId: user.id,
      username: user.username,
      email: user.email,
      tenantId: user.tenantId,
    };
  }
}
