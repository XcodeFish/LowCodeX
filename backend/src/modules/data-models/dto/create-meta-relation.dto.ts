import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { RelationType } from '../interfaces/relation-type.enum';

export class CreateMetaRelationDto {
  @ApiProperty({ description: '关系名称' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '关系描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '源表ID' })
  @IsUUID('4')
  sourceTableId: string;

  @ApiProperty({ description: '目标表ID' })
  @IsUUID('4')
  targetTableId: string;

  @ApiProperty({ description: '源字段ID' })
  @IsUUID('4')
  sourceFieldId: string;

  @ApiProperty({ description: '目标字段ID' })
  @IsUUID('4')
  targetFieldId: string;

  @ApiProperty({ description: '关系类型', enum: RelationType })
  @IsEnum(RelationType)
  type: RelationType;

  @ApiProperty({ description: '是否级联删除' })
  @IsBoolean()
  cascadeDelete: boolean;

  @ApiProperty({ description: '是否级联更新' })
  @IsBoolean()
  cascadeUpdate: boolean;

  @ApiProperty({ description: '是否必需关系' })
  @IsBoolean()
  isRequired: boolean;

  @ApiPropertyOptional({ description: '中间表ID(用于多对多)' })
  @IsOptional()
  @IsUUID('4')
  junctionTableId?: string;

  @ApiPropertyOptional({ description: '自定义选项' })
  @IsOptional()
  customOptions?: Record<string, any>;
}
