import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { PrismaService } from '../../../services/prisma.service';
import * as bcrypt from 'bcryptjs';
import {
  AuditLogService,
  AuditLogAction,
} from '../../system/services/audit-log.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private prismaService: PrismaService,
    private auditLogService: AuditLogService,
  ) {
    super({
      usernameField: 'username',
    });
  }

  /**
   * 本地策略验证方法
   * 验证用户名密码
   */
  async validate(username: string, password: string) {
    // 查询用户
    const users = await this.prismaService.$queryRaw<
      {
        id: string;
        tenantId: string;
        email: string;
        username: string;
        password: string;
        status: string;
      }[]
    >`
      SELECT u.id, u.\`tenantId\`, u.email, u.username, u.password, u.status
      FROM \`users\` u
      WHERE u.username = ${username}
    `;

    if (!users.length) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const user = users[0];

    // 验证用户状态
    if (user.status.toUpperCase() !== 'ACTIVE') {
      this.auditLogService.log({
        userId: user.id,
        tenantId: user.tenantId || '',
        action: AuditLogAction.LOGIN,
        resource: 'auth',
        description: '用户登录失败：账号已被禁用',
        ipAddress: '',
      });
      throw new UnauthorizedException('账号已被禁用');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      this.auditLogService.log({
        userId: user.id,
        tenantId: user.tenantId || '',
        action: AuditLogAction.LOGIN,
        resource: 'auth',
        description: '用户登录失败：密码错误',
        ipAddress: '',
      });
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 登录成功，记录审计日志
    this.auditLogService.logWithUser(
      user,
      AuditLogAction.LOGIN,
      'auth',
      undefined,
      '用户登录成功',
    );

    // 返回用户信息(不包含密码)
    return {
      userId: user.id,
      username: user.username,
      email: user.email,
      tenantId: user.tenantId,
    };
  }
}
