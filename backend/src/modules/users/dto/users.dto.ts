import {
  IsString,
  IsEmail,
  IsOptional,
  IsArray,
  IsEnum,
  IsNumber,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

// 用户创建请求DTO
export class CreateUserDto {
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
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsEnum(['active', 'inactive', 'suspended'])
  status?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  roleIds?: string[];

  @IsOptional()
  @IsUUID('4')
  tenantId?: string;
}

// 用户更新请求DTO
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsEnum(['active', 'inactive', 'suspended'])
  status?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  roleIds?: string[];
}

// 用户查询参数
export class UserQueryParamsDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsUUID('4')
  roleId?: string;

  @IsOptional()
  @IsUUID('4')
  tenantId?: string;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}

// 角色创建DTO
export class CreateRoleDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  permissionIds?: string[];

  @IsOptional()
  @IsUUID('4')
  tenantId?: string;
}

// 角色更新DTO
export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  permissionIds?: string[];
}

// 权限创建DTO
export class CreatePermissionDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  resourceType: string;

  @IsString()
  actionType: string;

  @IsString()
  resourcePattern: string;

  @IsOptional()
  @IsString()
  conditionExpression?: string;
}

// 权限更新DTO
export class UpdatePermissionDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  resourceType?: string;

  @IsOptional()
  @IsString()
  actionType?: string;

  @IsOptional()
  @IsString()
  resourcePattern?: string;

  @IsOptional()
  @IsString()
  conditionExpression?: string;
}
