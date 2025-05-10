import {
  Injectable,
  Logger,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { UsersService } from '../users/users.service';
import { RedisService } from '../../services/redis.service';
import { PrismaService } from '../../services/prisma.service';
import {
  LoginResponse,
  TokenResponse,
  JwtPayload,
  RegisterDto,
} from '../../types/auth.types';
import { UserWithRelations } from '../../types/users.types';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly jwtExpiresIn: number;
  private readonly refreshExpiresIn: number;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private redisService: RedisService,
    private prisma: PrismaService,
  ) {
    this.jwtExpiresIn = this.configService.get('JWT_EXPIRES_IN') || 3600; // 默认1小时
    this.refreshExpiresIn =
      this.configService.get('REFRESH_TOKEN_EXPIRES_IN') || 2592000; // 默认30天
  }

  // 验证用户名和密码
  async validateUser(
    username: string,
    password: string,
  ): Promise<UserWithRelations | null> {
    this.logger.log(`正在验证用户: ${username}`);

    // 查找用户
    const user = await this.usersService.findByUsername(username);

    if (!user) {
      this.logger.warn(`用户不存在: ${username}`);
      return null;
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      this.logger.warn(`密码验证失败: ${username}`);
      return null;
    }

    // 返回用户（排除密码）
    const { password: _, ...result } = user;
    return result as UserWithRelations;
  }

  // 用户登录
  async login(
    user: UserWithRelations,
    rememberMe: boolean = false,
  ): Promise<LoginResponse> {
    this.logger.log(`用户登录: ${user.username}, ID: ${user.id}`);

    // 计算令牌过期时间
    const expiresIn = rememberMe ? this.jwtExpiresIn * 2 : this.jwtExpiresIn;

    // 创建JWT载荷
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      tenantId: user.tenantId,
    };

    // 如果用户有角色，将角色代码添加到载荷中
    if (user.roles && user.roles.length > 0) {
      payload.roles = user.roles.map((role) => role.name);

      // 收集所有权限
      const permissions = new Set<string>();
      user.roles.forEach((role) => {
        if (role.permissions) {
          role.permissions.forEach((perm) => permissions.add(perm.code));
        }
      });

      if (permissions.size > 0) {
        payload.permissions = Array.from(permissions);
      }
    }

    // 生成访问令牌
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: expiresIn,
    });

    // 生成刷新令牌（如果需要）
    let refreshToken: string | undefined;
    if (rememberMe) {
      const refreshTokenId = uuidv4();
      refreshToken = this.jwtService.sign(
        { ...payload, id: refreshTokenId },
        { expiresIn: this.refreshExpiresIn },
      );

      // 存储刷新令牌到Redis
      await this.redisService.set(
        `refresh_token:${user.id}:${refreshTokenId}`,
        { valid: true },
        this.refreshExpiresIn,
      );
    }

    // 更新最后登录时间
    // 此操作不需要等待完成，可以在后台异步执行
    this.updateLastLoginTime(user.id).catch((err) => {
      this.logger.error(`更新最后登录时间失败: ${err.message}`, err.stack);
    });

    // 从返回的用户对象中移除密码
    const { password, ...userWithoutPassword } = user;

    // 返回登录响应
    return {
      accessToken,
      refreshToken,
      user: userWithoutPassword as UserWithRelations,
      expiresIn,
    };
  }

  // 刷新令牌
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    try {
      // 验证刷新令牌
      const payload = this.jwtService.verify(refreshToken);

      // 检查令牌类型
      if (!payload.id) {
        throw new UnauthorizedException('无效的刷新令牌');
      }

      // 从Redis检查令牌有效性
      const tokenKey = `refresh_token:${payload.sub}:${payload.id}`;
      const tokenData = await this.redisService.get<{ valid: boolean }>(
        tokenKey,
      );

      if (!tokenData || !tokenData.valid) {
        throw new UnauthorizedException('刷新令牌已失效');
      }

      // 删除旧的刷新令牌
      await this.redisService.del(tokenKey);

      // 查询用户
      const user = await this.usersService.findOneWithRoles(payload.sub);

      if (!user || user.status !== 'active') {
        throw new UnauthorizedException('用户不存在或已禁用');
      }

      // 创建新的访问令牌和刷新令牌
      const newRefreshTokenId = uuidv4();
      const newPayload: JwtPayload = {
        sub: user.id,
        username: user.username,
        tenantId: user.tenantId,
      };

      // 如果用户有角色，将角色代码添加到载荷中
      if (user.roles && user.roles.length > 0) {
        newPayload.roles = user.roles.map((role) => role.name);

        // 收集所有权限
        const permissions = new Set<string>();
        user.roles.forEach((role) => {
          if (role.permissions) {
            role.permissions.forEach((perm) => permissions.add(perm.code));
          }
        });

        if (permissions.size > 0) {
          newPayload.permissions = Array.from(permissions);
        }
      }

      // 生成新的访问令牌
      const accessToken = this.jwtService.sign(newPayload, {
        expiresIn: this.jwtExpiresIn,
      });

      // 生成新的刷新令牌
      const newRefreshToken = this.jwtService.sign(
        { ...newPayload, id: newRefreshTokenId },
        { expiresIn: this.refreshExpiresIn },
      );

      // 存储新的刷新令牌到Redis
      await this.redisService.set(
        `refresh_token:${user.id}:${newRefreshTokenId}`,
        { valid: true },
        this.refreshExpiresIn,
      );

      return {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn: this.jwtExpiresIn,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(`刷新令牌失败: ${error.message}`, error.stack);
      throw new UnauthorizedException('刷新令牌失败');
    }
  }

  // 用户注册
  async register(registerDto: RegisterDto): Promise<UserWithRelations> {
    this.logger.log(`用户注册: ${registerDto.username}`);

    // 创建用户
    return this.usersService.create({
      username: registerDto.username,
      email: registerDto.email,
      password: registerDto.password,
      name: registerDto.name,
      tenantId: registerDto.tenantId,
      status: 'active',
    });
  }

  // 退出登录
  async logout(userId: number): Promise<void> {
    this.logger.log(`用户退出登录: ID=${userId}`);
    try {
      // 删除该用户的所有刷新令牌
      const tokenPattern = `refresh_token:${userId}:*`;
      const tokenKeys = await this.redisService.keys(tokenPattern);

      if (tokenKeys.length > 0) {
        await this.redisService.del(tokenKeys);
        this.logger.log(`已删除 ${tokenKeys.length} 个刷新令牌`);
      }
    } catch (error) {
      this.logger.error(`注销失败: ${error.message}`, error.stack);
      throw new BadRequestException('退出登录失败，请稍后再试');
    }
  }

  // 获取用户个人资料
  async getProfile(userId: number): Promise<UserWithRelations> {
    this.logger.log(`获取用户个人资料: ID=${userId}`);
    return this.usersService.findOneWithRoles(userId);
  }

  // 更新最后登录时间
  private async updateLastLoginTime(userId: number): Promise<void> {
    try {
      // 由于schema中没有lastLoginAt字段，我们使用updatedAt代替
      await this.prisma.user.update({
        where: { id: userId },
        data: { updatedAt: new Date() },
      });
    } catch (error) {
      this.logger.error(`更新登录时间失败: ${error.message}`, error.stack);
    }
  }
}
