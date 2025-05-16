import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsNotEmpty,
  IsObject,
} from 'class-validator';
import { RelationType } from '../entities/meta-field.entity';

/**
 * 创建元关系DTO
 */
export class CreateMetaRelationDto {
  @ApiProperty({ description: '关系名称', example: 'customerOrders' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: '关系描述',
    example: '客户与订单的关联关系',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: '源表ID' })
  @IsString()
  @IsNotEmpty()
  sourceTableId: string;

  @ApiProperty({ description: '目标表ID' })
  @IsString()
  @IsNotEmpty()
  targetTableId: string;

  @ApiProperty({ description: '源字段ID' })
  @IsString()
  @IsNotEmpty()
  sourceFieldId: string;

  @ApiProperty({ description: '目标字段ID' })
  @IsString()
  @IsNotEmpty()
  targetFieldId: string;

  @ApiProperty({ description: '关系类型', enum: RelationType })
  @IsEnum(RelationType)
  @IsNotEmpty()
  type: RelationType | string;

  @ApiPropertyOptional({ description: '是否级联删除', default: false })
  @IsBoolean()
  @IsOptional()
  cascadeDelete?: boolean;

  @ApiPropertyOptional({ description: '是否级联更新', default: false })
  @IsBoolean()
  @IsOptional()
  cascadeUpdate?: boolean;

  @ApiPropertyOptional({ description: '是否必需关系', default: false })
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @ApiPropertyOptional({ description: '中间表ID(用于多对多)' })
  @IsString()
  @IsOptional()
  junctionTableId?: string;

  @ApiPropertyOptional({
    description: '自定义选项',
    type: 'object',
    additionalProperties: true,
  })
  @IsObject()
  @IsOptional()
  customOptions?: Record<string, any>;
}

/**
 * 更新元关系DTO
 */
export class UpdateMetaRelationDto {
  @ApiPropertyOptional({ description: '关系名称', example: 'customerOrders' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: '关系描述',
    example: '客户与订单的关联关系',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: '关系类型', enum: RelationType })
  @IsEnum(RelationType)
  @IsOptional()
  type?: RelationType | string;

  @ApiPropertyOptional({ description: '源字段ID' })
  @IsString()
  @IsOptional()
  sourceFieldId?: string;

  @ApiPropertyOptional({ description: '目标字段ID' })
  @IsString()
  @IsOptional()
  targetFieldId?: string;

  @ApiPropertyOptional({ description: '是否级联删除' })
  @IsBoolean()
  @IsOptional()
  cascadeDelete?: boolean;

  @ApiPropertyOptional({ description: '是否级联更新' })
  @IsBoolean()
  @IsOptional()
  cascadeUpdate?: boolean;

  @ApiPropertyOptional({ description: '是否必需关系' })
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @ApiPropertyOptional({ description: '中间表ID(用于多对多)' })
  @IsString()
  @IsOptional()
  junctionTableId?: string;

  @ApiPropertyOptional({
    description: '自定义选项',
    type: 'object',
    additionalProperties: true,
  })
  @IsObject()
  @IsOptional()
  customOptions?: Record<string, any>;
}

/**
 * 关系查询参数DTO
 */
export class RelationQueryDto {
  @ApiPropertyOptional({ description: '源表ID' })
  @IsString()
  @IsOptional()
  sourceTableId?: string;

  @ApiPropertyOptional({ description: '目标表ID' })
  @IsString()
  @IsOptional()
  targetTableId?: string;

  @ApiPropertyOptional({ description: '关系类型', enum: RelationType })
  @IsEnum(RelationType)
  @IsOptional()
  type?: RelationType | string;
}
