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
  IsNumber,
  Min,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  FieldType,
  ValidationRule,
  FieldAdvancedSettings,
} from '../entities/meta-field.entity';

/**
 * 创建元字段DTO
 */
export class CreateMetaFieldDto {
  @ApiProperty({ description: '所属表ID' })
  @IsString()
  @IsNotEmpty()
  tableId: string;

  @ApiProperty({ description: '字段技术名称（英文）', example: 'name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: '字段显示名称（中文）', example: '姓名' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  displayName: string;

  @ApiPropertyOptional({ description: '字段描述', example: '客户姓名' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: '字段类型', enum: FieldType })
  @IsEnum(FieldType)
  @IsNotEmpty()
  type: FieldType | string;

  @ApiPropertyOptional({ description: '是否主键', default: false })
  @IsBoolean()
  @IsOptional()
  isPrimaryKey?: boolean;

  @ApiPropertyOptional({ description: '是否必填', default: false })
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @ApiPropertyOptional({ description: '是否唯一', default: false })
  @IsBoolean()
  @IsOptional()
  isUnique?: boolean;

  @ApiPropertyOptional({ description: '是否系统字段', default: false })
  @IsBoolean()
  @IsOptional()
  isSystem?: boolean;

  @ApiPropertyOptional({ description: '是否在UI中隐藏', default: false })
  @IsBoolean()
  @IsOptional()
  isHidden?: boolean;

  @ApiProperty({ description: '字段顺序', example: 1 })
  @IsNumber()
  @Min(0)
  ordinal: number;

  @ApiPropertyOptional({ description: '默认值' })
  @IsOptional()
  defaultValue?: string;

  @ApiPropertyOptional({ description: '验证规则', type: 'array' })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => Object)
  validationRules?: ValidationRule[];

  @ApiPropertyOptional({ description: '是否可搜索', default: false })
  @IsBoolean()
  @IsOptional()
  isSearchable?: boolean;

  @ApiPropertyOptional({ description: '是否可排序', default: false })
  @IsBoolean()
  @IsOptional()
  isSortable?: boolean;

  @ApiPropertyOptional({ description: '是否可筛选', default: false })
  @IsBoolean()
  @IsOptional()
  isFilterable?: boolean;

  @ApiPropertyOptional({ description: '是否可聚合', default: false })
  @IsBoolean()
  @IsOptional()
  isAggregatable?: boolean;

  @ApiPropertyOptional({
    description: '高级设置',
    type: 'object',
    additionalProperties: true,
  })
  @IsObject()
  @IsOptional()
  advancedSettings?: FieldAdvancedSettings;
}

/**
 * 更新元字段DTO
 */
export class UpdateMetaFieldDto {
  @ApiPropertyOptional({ description: '字段显示名称（中文）', example: '姓名' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  displayName?: string;

  @ApiPropertyOptional({ description: '字段描述', example: '客户姓名' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: '字段类型', enum: FieldType })
  @IsEnum(FieldType)
  @IsOptional()
  type?: FieldType | string;

  @ApiPropertyOptional({ description: '是否必填' })
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @ApiPropertyOptional({ description: '是否唯一' })
  @IsBoolean()
  @IsOptional()
  isUnique?: boolean;

  @ApiPropertyOptional({ description: '是否在UI中隐藏' })
  @IsBoolean()
  @IsOptional()
  isHidden?: boolean;

  @ApiPropertyOptional({ description: '字段顺序', example: 1 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  ordinal?: number;

  @ApiPropertyOptional({ description: '默认值' })
  @IsOptional()
  defaultValue?: string;

  @ApiPropertyOptional({ description: '验证规则', type: 'array' })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => Object)
  validationRules?: ValidationRule[];

  @ApiPropertyOptional({ description: '是否可搜索' })
  @IsBoolean()
  @IsOptional()
  isSearchable?: boolean;

  @ApiPropertyOptional({ description: '是否可排序' })
  @IsBoolean()
  @IsOptional()
  isSortable?: boolean;

  @ApiPropertyOptional({ description: '是否可筛选' })
  @IsBoolean()
  @IsOptional()
  isFilterable?: boolean;

  @ApiPropertyOptional({ description: '是否可聚合' })
  @IsBoolean()
  @IsOptional()
  isAggregatable?: boolean;

  @ApiPropertyOptional({
    description: '高级设置',
    type: 'object',
    additionalProperties: true,
  })
  @IsObject()
  @IsOptional()
  advancedSettings?: FieldAdvancedSettings;
}

/**
 * 字段查询参数DTO
 */
export class FieldQueryDto {
  @ApiProperty({ description: '表ID' })
  @IsString()
  @IsNotEmpty()
  tableId: string;

  @ApiPropertyOptional({ description: '字段名关键字搜索' })
  @IsString()
  @IsOptional()
  keyword?: string;

  @ApiPropertyOptional({ description: '字段类型', enum: FieldType })
  @IsEnum(FieldType)
  @IsOptional()
  type?: FieldType | string;

  @ApiPropertyOptional({ description: '是否系统字段' })
  @IsBoolean()
  @IsOptional()
  isSystem?: boolean;
}
