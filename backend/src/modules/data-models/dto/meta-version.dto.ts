import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  IsBoolean,
} from 'class-validator';

/**
 * 创建元版本DTO
 */
export class CreateMetaVersionDto {
  @ApiProperty({ description: '表ID' })
  @IsString()
  @IsNotEmpty()
  tableId: string;

  @ApiPropertyOptional({ description: '版本名称', example: 'v1.0.0' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: '版本描述', example: '初始版本' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: '版本说明', example: '新增客户信息表' })
  @IsString()
  @IsOptional()
  comment?: string;
}

/**
 * 发布版本DTO
 */
export class PublishVersionDto {
  @ApiProperty({ description: '版本ID' })
  @IsString()
  @IsNotEmpty()
  versionId: string;

  @ApiPropertyOptional({ description: '发布说明' })
  @IsString()
  @IsOptional()
  comment?: string;
}

/**
 * 比较版本DTO
 */
export class CompareVersionsDto {
  @ApiProperty({ description: '源版本ID' })
  @IsString()
  @IsNotEmpty()
  sourceVersionId: string;

  @ApiProperty({ description: '目标版本ID' })
  @IsString()
  @IsNotEmpty()
  targetVersionId: string;
}

/**
 * 获取版本历史DTO
 */
export class VersionHistoryDto {
  @ApiProperty({ description: '表ID' })
  @IsString()
  @IsNotEmpty()
  tableId: string;

  @ApiPropertyOptional({ description: '是否仅获取已发布版本' })
  @IsBoolean()
  @IsOptional()
  publishedOnly?: boolean;

  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: '每页记录数', default: 20 })
  @IsNumber()
  @IsOptional()
  pageSize?: number;
}

/**
 * 恢复版本DTO
 */
export class RestoreVersionDto {
  @ApiProperty({ description: '版本ID' })
  @IsString()
  @IsNotEmpty()
  versionId: string;

  @ApiPropertyOptional({ description: '是否创建新版本', default: true })
  @IsBoolean()
  @IsOptional()
  createNewVersion?: boolean;

  @ApiPropertyOptional({ description: '版本说明' })
  @IsString()
  @IsOptional()
  comment?: string;
}
