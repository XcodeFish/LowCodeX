import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsOptional,
  IsInt,
  IsBoolean,
  Min,
  Max,
  IsArray,
} from 'class-validator';

export class TestDataGenerationRequestDto {
  @ApiProperty({ description: '元表ID' })
  @IsUUID('4')
  tableId: string;

  @ApiProperty({ description: '要生成的测试数据数量' })
  @IsInt()
  @Min(1)
  @Max(1000)
  count: number;

  @ApiPropertyOptional({ description: '包含关联数据' })
  @IsOptional()
  @IsBoolean()
  includeRelations?: boolean;

  @ApiPropertyOptional({ description: '关联深度' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3)
  relationDepth?: number;

  @ApiPropertyOptional({ description: '生成选项' })
  @IsOptional()
  options?: {
    language?: string; // 语言环境, 例如 'zh-CN', 'en-US'
    seed?: number; // 随机种子
    strictMode?: boolean; // 严格模式，遵循所有验证规则
    customFields?: Record<string, any>; // 自定义字段值
  };
}

export class TestDataPreviewRequestDto {
  @ApiProperty({ description: '元表ID' })
  @IsUUID('4')
  tableId: string;

  @ApiProperty({ description: '要预览的测试数据数量' })
  @IsInt()
  @Min(1)
  @Max(10)
  count: number;

  @ApiPropertyOptional({ description: '包含关联数据' })
  @IsOptional()
  @IsBoolean()
  includeRelations?: boolean;

  @ApiPropertyOptional({ description: '生成选项' })
  @IsOptional()
  options?: {
    language?: string;
    seed?: number;
    strictMode?: boolean;
    customFields?: Record<string, any>;
  };
}

export class FieldOverrideDto {
  @ApiProperty({ description: '字段名' })
  @IsString()
  fieldName: string;

  @ApiProperty({ description: '数据生成模式' })
  @IsString()
  mode: 'fixed' | 'random' | 'sequence' | 'formula';

  @ApiProperty({ description: '值或生成表达式' })
  value: any;
}

export class TestDataTemplateDto {
  @ApiProperty({ description: '模板名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '元表ID' })
  @IsUUID('4')
  tableId: string;

  @ApiProperty({ description: '描述' })
  @IsString()
  description: string;

  @ApiProperty({ description: '字段重写规则' })
  @IsArray()
  fieldOverrides: FieldOverrideDto[];
}
