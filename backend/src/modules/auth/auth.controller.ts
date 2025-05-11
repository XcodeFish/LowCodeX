import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  HttpCode,
  HttpStatus,
  Res,
  UnauthorizedException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto, RegisterDto, RefreshTokenDto } from './dto';
import { Public } from './decorators/public.decorator';
import { LoginResponse } from './interfaces';

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '用户登录' })
  @ApiResponse({ status: 200, description: '登录成功' })
  @ApiResponse({ status: 401, description: '认证失败' })
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Omit<LoginResponse, 'refreshToken'>> {
    // LocalAuthGuard已经验证用户，user对象已附加到请求中
    const user = req.user;
    // 直接使用LoginDto对象传递
    const result = await this.authService.login(loginDto);

    // 设置刷新令牌为HttpOnly cookie
    if (result.refreshToken) {
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30天
        path: '/api/auth/refresh-token',
      };
      res.cookie('refreshToken', result.refreshToken, cookieOptions);
    }

    // 返回不包含refreshToken的结果
    // 注意：此处需要修改auth.service.ts的login方法返回值类型为LoginResponse
    return {
      accessToken: result.accessToken,
      expiresIn: result.expiresIn,
      user: result.user, // 使用result.user包含更完整的信息
    };
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: '用户注册' })
  @ApiResponse({ status: 201, description: '注册成功' })
  @ApiResponse({ status: 400, description: '请求参数无效' })
  @ApiResponse({ status: 409, description: '用户名或邮箱已存在' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '刷新令牌' })
  @ApiResponse({ status: 200, description: '令牌刷新成功' })
  @ApiResponse({ status: 401, description: '无效的刷新令牌' })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Req() req: any,
  ) {
    // 从cookie或请求体获取刷新令牌
    const token = req.cookies?.refreshToken || refreshTokenDto.refreshToken;

    if (!token) {
      throw new UnauthorizedException('刷新令牌不存在');
    }

    return this.authService.refreshToken({ refreshToken: token });
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: '退出登录' })
  @ApiResponse({ status: 200, description: '退出成功' })
  async logout(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    // 清除刷新令牌cookie
    res.clearCookie('refreshToken');

    // 检查用户是否已登录
    if (req.user && req.user.id) {
      try {
        // 使当前访问令牌失效
        await this.authService.logout(req.user.id);
      } catch (error) {
        // 记录错误但不抛出异常，确保总是能退出
        console.error('Logout error:', error);
      }
    }

    return { success: true, message: '退出成功' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getProfile(@Req() req: any) {
    this.logger.log(`获取用户资料，用户ID: ${req.user?.id || '未知'}`);

    // 检查用户ID是否存在
    if (!req.user || !req.user.id) {
      this.logger.error('无法获取用户资料：请求中缺少用户ID');
      throw new UnauthorizedException('认证信息无效，请重新登录');
    }

    try {
      return await this.authService.getProfile(req.user.id);
    } catch (error) {
      this.logger.error(`获取用户资料失败: ${error.message}`, error.stack);

      // 重新抛出业务相关异常，否则返回500错误
      if (
        error.name === 'NotFoundException' ||
        error.name === 'UnauthorizedException'
      ) {
        throw error;
      }

      throw new InternalServerErrorException('获取用户资料失败，请稍后再试');
    }
  }
}
