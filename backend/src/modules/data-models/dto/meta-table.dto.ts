import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsOptional,
  IsEnum,
  MaxLength,
  IsNotEmpty,
  ValidateNested,
  IsArray,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TableStatus } from '../entities/meta-table.entity';

/**
 * 创建元表DTO
 */
export class CreateMetaTableDto {
  @ApiProperty({ description: '表技术名称（英文）', example: 'customer' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: '表显示名称（中文）', example: '客户信息' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  displayName: string;

  @ApiPropertyOptional({
    description: '表描述',
    example: '用于存储客户基本信息',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: '是否系统表', default: false })
  @IsBoolean()
  @IsOptional()
  isSystem?: boolean;

  @ApiPropertyOptional({ description: '是否支持软删除', default: true })
  @IsBoolean()
  @IsOptional()
  isSoftDelete?: boolean;

  @ApiPropertyOptional({ description: '是否支持版本控制', default: false })
  @IsBoolean()
  @IsOptional()
  isVersioned?: boolean;

  @ApiPropertyOptional({
    description: '表状态',
    enum: TableStatus,
    default: TableStatus.DRAFT,
  })
  @IsEnum(TableStatus)
  @IsOptional()
  status?: TableStatus | string;

  @ApiPropertyOptional({ description: '所属应用' })
  @IsString()
  @IsOptional()
  application?: string;

  @ApiPropertyOptional({ description: '是否包含审计字段', default: true })
  @IsBoolean()
  @IsOptional()
  auditFields?: boolean;

  @ApiPropertyOptional({ description: '是否启用API', default: true })
  @IsBoolean()
  @IsOptional()
  apiEnabled?: boolean;

  @ApiPropertyOptional({
    description: '自定义选项',
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  customOptions?: Record<string, any>;
}

/**
 * 更新元表DTO
 */
export class UpdateMetaTableDto {
  @ApiPropertyOptional({
    description: '表显示名称（中文）',
    example: '客户信息',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  displayName?: string;

  @ApiPropertyOptional({
    description: '表描述',
    example: '用于存储客户基本信息',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: '是否支持软删除' })
  @IsBoolean()
  @IsOptional()
  isSoftDelete?: boolean;

  @ApiPropertyOptional({ description: '是否支持版本控制' })
  @IsBoolean()
  @IsOptional()
  isVersioned?: boolean;

  @ApiPropertyOptional({ description: '表状态', enum: TableStatus })
  @IsEnum(TableStatus)
  @IsOptional()
  status?: TableStatus | string;

  @ApiPropertyOptional({ description: '所属应用' })
  @IsString()
  @IsOptional()
  application?: string;

  @ApiPropertyOptional({ description: '是否包含审计字段' })
  @IsBoolean()
  @IsOptional()
  auditFields?: boolean;

  @ApiPropertyOptional({ description: '是否启用API' })
  @IsBoolean()
  @IsOptional()
  apiEnabled?: boolean;

  @ApiPropertyOptional({
    description: '自定义选项',
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  customOptions?: Record<string, any>;
}

/**
 * 表查询参数DTO
 */
export class TableQueryDto {
  @ApiPropertyOptional({ description: '表名关键字搜索' })
  @IsString()
  @IsOptional()
  keyword?: string;

  @ApiPropertyOptional({ description: '表状态', enum: TableStatus })
  @IsEnum(TableStatus)
  @IsOptional()
  status?: TableStatus | string;

  @ApiPropertyOptional({ description: '是否系统表' })
  @IsBoolean()
  @IsOptional()
  isSystem?: boolean;

  @ApiPropertyOptional({ description: '所属应用' })
  @IsString()
  @IsOptional()
  application?: string;

  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: '每页记录数', default: 20 })
  @IsOptional()
  pageSize?: number;

  @ApiPropertyOptional({ description: '排序字段', default: 'createdAt' })
  @IsString()
  @IsOptional()
  orderBy?: string;

  @ApiPropertyOptional({
    description: '排序方向',
    default: 'desc',
    enum: ['asc', 'desc'],
  })
  @IsString()
  @IsOptional()
  order?: 'asc' | 'desc';
}
