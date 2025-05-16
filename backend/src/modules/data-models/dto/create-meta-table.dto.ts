import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsOptional,
  IsEnum,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TableStatus } from '../interfaces/table-status.enum';

export class CreateMetaIndexDto {
  @ApiProperty({ description: '索引名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '索引字段ID数组', type: [String] })
  @IsUUID('4', { each: true })
  fields: string[];

  @ApiProperty({ description: '索引类型', enum: ['btree', 'hash', 'fulltext'] })
  @IsEnum(['btree', 'hash', 'fulltext'])
  type: string;

  @ApiProperty({ description: '是否唯一索引' })
  @IsBoolean()
  isUnique: boolean;
}

export class CreateMetaConstraintDto {
  @ApiProperty({ description: '约束名称' })
  @IsString()
  name: string;

  @ApiProperty({
    description: '约束类型',
    enum: ['primary_key', 'foreign_key', 'unique', 'check', 'not_null'],
  })
  @IsEnum(['primary_key', 'foreign_key', 'unique', 'check', 'not_null'])
  type: string;

  @ApiProperty({ description: '约束字段ID数组', type: [String] })
  @IsUUID('4', { each: true })
  fields: string[];

  @ApiPropertyOptional({ description: '约束表达式' })
  @IsOptional()
  @IsString()
  expression?: string;

  @ApiPropertyOptional({ description: '违反约束时的错误消息' })
  @IsOptional()
  @IsString()
  message?: string;
}

export class CreateMetaTableDto {
  @ApiProperty({ description: '技术名称（英文，用于数据库表名）' })
  @IsString()
  name: string;

  @ApiProperty({ description: '显示名称（中文，用于UI展示）' })
  @IsString()
  displayName: string;

  @ApiPropertyOptional({ description: '表描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '是否系统表' })
  @IsBoolean()
  isSystem: boolean;

  @ApiProperty({ description: '是否支持软删除' })
  @IsBoolean()
  isSoftDelete: boolean;

  @ApiProperty({ description: '是否支持版本控制' })
  @IsBoolean()
  isVersioned: boolean;

  @ApiProperty({ description: '表状态', enum: TableStatus })
  @IsEnum(TableStatus)
  status: TableStatus;

  @ApiProperty({ description: '所属租户' })
  @IsString()
  tenant: string;

  @ApiPropertyOptional({ description: '所属应用' })
  @IsOptional()
  @IsString()
  application?: string;

  @ApiProperty({ description: '是否包含审计字段' })
  @IsBoolean()
  auditFields: boolean;

  @ApiProperty({ description: '是否启用API' })
  @IsBoolean()
  apiEnabled: boolean;

  @ApiPropertyOptional({ description: '索引配置', type: [CreateMetaIndexDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateMetaIndexDto)
  indexes?: CreateMetaIndexDto[];

  @ApiPropertyOptional({
    description: '约束配置',
    type: [CreateMetaConstraintDto],
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateMetaConstraintDto)
  constraints?: CreateMetaConstraintDto[];

  @ApiPropertyOptional({ description: '自定义选项' })
  @IsOptional()
  customOptions?: Record<string, any>;
}
