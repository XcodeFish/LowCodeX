import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(JwtStrategy.name);

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
    try {
      // 首先尝试使用Prisma客户端API查询用户，更安全更可靠
      const user = await this.prismaService.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          tenantId: true,
          username: true,
          email: true,
          status: true,
          avatar: true,
        },
      });

      // 如果没有找到用户
      if (!user) {
        this.logger.warn(`找不到用户ID: ${payload.sub}`);
        throw new UnauthorizedException('用户不存在');
      }

      // 检查用户状态 - 支持多种可能的活跃状态值
      const activeStatuses = ['ACTIVE', 'active', 'Active'];
      if (!activeStatuses.includes(user.status)) {
        this.logger.warn(
          `用户 ${payload.sub} 状态为 ${user.status}，非活跃状态`,
        );
        throw new UnauthorizedException('用户已被禁用');
      }

      // 仅在用户验证成功时记录日志，减少日志数量
      // this.auditLogService.logWithUser(
      //   user,
      //   AuditLogAction.READ,
      //   'auth',
      //   undefined,
      //   '用户JWT令牌验证成功',
      // );

      // 返回用户信息 - 使用id作为属性名（而不是userId）
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        tenantId: user.tenantId,
        avatar: user.avatar,
      };
    } catch (error) {
      // 如果已经是UnauthorizedException则直接抛出
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      // 记录详细错误但向用户返回通用消息
      this.logger.error(`JWT验证失败: ${error.message}`, error.stack);
      throw new UnauthorizedException('身份验证失败，请重新登录');
    }
  }
}
