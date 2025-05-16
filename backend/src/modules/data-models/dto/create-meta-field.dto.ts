import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsInt,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FieldType } from '../interfaces/field-type.enum';

export class ValidationRuleDto {
  @ApiProperty({
    description: '规则类型',
    enum: ['required', 'length', 'range', 'regex', 'custom'],
  })
  @IsEnum(['required', 'length', 'range', 'regex', 'custom'])
  type: string;

  @ApiProperty({ description: '错误消息' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: '表达式(用于自定义规则)' })
  @IsOptional()
  @IsString()
  expression?: string;

  @ApiPropertyOptional({ description: '规则参数' })
  @IsOptional()
  parameters?: Record<string, any>;
}

export class EnumOptionDto {
  @ApiProperty({ description: '枚举值' })
  @IsString()
  value: string;

  @ApiProperty({ description: '显示标签' })
  @IsString()
  label: string;

  @ApiPropertyOptional({ description: '颜色(用于UI展示)' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ description: '排序' })
  @IsOptional()
  @IsInt()
  order?: number;

  @ApiPropertyOptional({ description: '是否禁用' })
  @IsOptional()
  @IsBoolean()
  disabled?: boolean;
}

export class FieldAdvancedSettingsDto {
  @ApiPropertyOptional({ description: '最小长度' })
  @IsOptional()
  @IsInt()
  minLength?: number;

  @ApiPropertyOptional({ description: '最大长度' })
  @IsOptional()
  @IsInt()
  maxLength?: number;

  @ApiPropertyOptional({ description: '最小值' })
  @IsOptional()
  @IsInt()
  min?: number;

  @ApiPropertyOptional({ description: '最大值' })
  @IsOptional()
  @IsInt()
  max?: number;

  @ApiPropertyOptional({ description: '精度(总位数)' })
  @IsOptional()
  @IsInt()
  precision?: number;

  @ApiPropertyOptional({ description: '小数位数' })
  @IsOptional()
  @IsInt()
  scale?: number;

  @ApiPropertyOptional({ description: '枚举选项', type: [EnumOptionDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => EnumOptionDto)
  enumOptions?: EnumOptionDto[];

  @ApiPropertyOptional({ description: '引用的表ID' })
  @IsOptional()
  @IsUUID('4')
  referenceTableId?: string;

  @ApiPropertyOptional({ description: '引用的字段ID' })
  @IsOptional()
  @IsUUID('4')
  referenceFieldId?: string;

  @ApiPropertyOptional({
    description: '关系类型',
    enum: ['oneToOne', 'oneToMany', 'manyToOne', 'manyToMany'],
  })
  @IsOptional()
  @IsEnum(['oneToOne', 'oneToMany', 'manyToOne', 'manyToMany'])
  relationType?: string;

  @ApiPropertyOptional({ description: '渲染类型' })
  @IsOptional()
  @IsString()
  renderType?: string;

  @ApiPropertyOptional({ description: '渲染选项' })
  @IsOptional()
  renderOptions?: Record<string, any>;
}

export class CreateMetaFieldDto {
  @ApiProperty({ description: '所属表ID' })
  @IsUUID('4')
  tableId: string;

  @ApiProperty({ description: '技术名称（英文）' })
  @IsString()
  name: string;

  @ApiProperty({ description: '显示名称（中文）' })
  @IsString()
  displayName: string;

  @ApiPropertyOptional({ description: '字段描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '字段类型', enum: FieldType })
  @IsEnum(FieldType)
  type: FieldType;

  @ApiProperty({ description: '是否主键' })
  @IsBoolean()
  isPrimaryKey: boolean;

  @ApiProperty({ description: '是否必填' })
  @IsBoolean()
  isRequired: boolean;

  @ApiProperty({ description: '是否唯一' })
  @IsBoolean()
  isUnique: boolean;

  @ApiProperty({ description: '是否系统字段' })
  @IsBoolean()
  isSystem: boolean;

  @ApiProperty({ description: '是否在UI中隐藏' })
  @IsBoolean()
  isHidden: boolean;

  @ApiProperty({ description: '字段顺序' })
  @IsInt()
  ordinal: number;

  @ApiPropertyOptional({ description: '默认值' })
  @IsOptional()
  defaultValue?: any;

  @ApiPropertyOptional({ description: '验证规则', type: [ValidationRuleDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ValidationRuleDto)
  validationRules?: ValidationRuleDto[];

  @ApiProperty({ description: '是否可搜索' })
  @IsBoolean()
  isSearchable: boolean;

  @ApiProperty({ description: '是否可排序' })
  @IsBoolean()
  isSortable: boolean;

  @ApiProperty({ description: '是否可筛选' })
  @IsBoolean()
  isFilterable: boolean;

  @ApiProperty({ description: '是否可聚合' })
  @IsBoolean()
  isAggregatable: boolean;

  @ApiPropertyOptional({ description: '高级设置' })
  @IsOptional()
  @ValidateNested()
  @Type(() => FieldAdvancedSettingsDto)
  advancedSettings?: FieldAdvancedSettingsDto;
}
