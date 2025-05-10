import {
  Injectable,
  Logger,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { UsersService } from '../users/users.service';
import { RedisService } from '../../services/redis.service';
import { PrismaService } from '../../services/prisma.service';
import { LoginResponse, TokenResponse, JwtPayload } from './interfaces';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto';
import { UserWithRelations } from '../users/interfaces';
import { Prisma } from '../../../generated/prisma';

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
    return result as unknown as UserWithRelations;
  }

  /**
   * 用户注册
   */
  async register(registerDto: RegisterDto): Promise<TokenResponse> {
    this.logger.log(`尝试注册用户: ${registerDto.username}`);

    try {
      // 创建用户
      const user = await this.usersService.create({
        username: registerDto.username,
        email: registerDto.email,
        password: registerDto.password,
        name: registerDto.name,
        status: 'active',
        tenantId: registerDto.tenantId,
        roleIds: [],
      });

      // 生成令牌
      return this.generateTokens(user.id, user.username, user.tenantId);
    } catch (error) {
      if (error instanceof ConflictException) {
        // 将冲突异常直接传递
        throw error;
      }
      this.logger.error('注册失败:', error.stack);
      throw new BadRequestException('注册失败，请稍后再试');
    }
  }

  /**
   * 用户登录
   */
  async login(loginDto: LoginDto): Promise<LoginResponse> {
    this.logger.log(`尝试登录: ${loginDto.username}`);

    // 查找用户
    const user = await this.usersService.findByUsername(loginDto.username);
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 检查用户状态
    if (user.status !== 'active') {
      throw new UnauthorizedException('用户已被禁用，请联系管理员');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 更新最后登录时间
    await this.updateLastLoginTime(user.id);

    // 生成令牌
    const tokens = this.generateTokens(user.id, user.username, user.tenantId);

    // 排除密码字段
    const { password: _, ...userWithoutPassword } = user;

    // 返回登录响应
    return {
      ...tokens,
      user: userWithoutPassword as UserWithRelations,
    };
  }

  /**
   * 刷新令牌
   */
  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<TokenResponse> {
    try {
      // 验证刷新令牌
      const payload = this.jwtService.verify(refreshTokenDto.refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      }) as JwtPayload;

      // 查找用户
      const user = await this.usersService.findOneWithRoles(payload.sub);
      if (!user || user.status !== 'active') {
        throw new UnauthorizedException('无效的刷新令牌');
      }

      // 生成新令牌
      return this.generateTokens(user.id, user.username, user.tenantId);
    } catch (error) {
      this.logger.error('刷新令牌失败:', error.stack);
      throw new UnauthorizedException('无效的刷新令牌');
    }
  }

  // 退出登录
  async logout(userId: string): Promise<void> {
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
  async getProfile(userId: string): Promise<UserWithRelations> {
    this.logger.log(`获取用户个人资料: ID=${userId}`);
    return this.usersService.findOneWithRoles(userId);
  }

  /**
   * 更新用户最后登录时间
   * 由于lastLoginAt字段尚未通过迁移添加到数据库，暂时更新updatedAt字段
   */
  private async updateLastLoginTime(userId: string): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          updatedAt: new Date(), // 暂时使用updatedAt字段
        } as Prisma.UserUpdateInput,
      });
    } catch (error) {
      this.logger.error(`更新用户登录时间失败: ${error.message}`);
      // 不抛出异常，这是非关键操作
    }
  }

  /**
   * 生成访问令牌和刷新令牌
   */
  private generateTokens(
    userId: string,
    username: string,
    tenantId?: string,
  ): TokenResponse {
    // 构建JWT负载
    const payload: JwtPayload = {
      sub: userId,
      username: username,
      tenantId: tenantId || undefined,
    };

    // 设置令牌过期时间（秒）
    const accessExpiresIn = 900; // 15分钟
    const refreshExpiresIn = 604800; // 7天

    // 生成访问令牌（短期）
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: `${accessExpiresIn}s`,
    });

    // 生成刷新令牌（长期）
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: `${refreshExpiresIn}s`,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: accessExpiresIn,
    };
  }
}
