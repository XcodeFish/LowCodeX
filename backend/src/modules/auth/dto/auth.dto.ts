import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsUUID,
} from 'class-validator';

// 登录请求DTO
export class LoginDto {
  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}

// 注册请求DTO
export class RegisterDto {
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsUUID('4')
  tenantId?: string;
}

// 刷新令牌请求DTO
export class RefreshTokenDto {
  @IsString()
  refreshToken: string;
}
