import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, IsEnum } from 'class-validator';

export enum ImpactType {
  TABLE = 'TABLE',
  FIELD = 'FIELD',
  RELATION = 'RELATION',
  DEPENDENCY = 'DEPENDENCY',
}

export enum ImpactSeverity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

// 添加ImpactResult接口
export interface ImpactResult {
  type: ImpactType;
  severity: ImpactSeverity;
  description: string;
  detail: any;
}

export class ImpactAnalysisRequestDto {
  @ApiProperty({ description: '元表ID' })
  @IsUUID('4')
  tableId: string;

  @ApiPropertyOptional({
    description: '变更版本ID（如果不指定则分析当前版本）',
  })
  @IsOptional()
  @IsUUID('4')
  versionId?: string;

  @ApiPropertyOptional({
    description: '与之比较的版本ID（如果不指定则与最后发布版本比较）',
  })
  @IsOptional()
  @IsUUID('4')
  comparisonVersionId?: string;
}

// 添加响应DTO
export class ImpactAnalysisResponseDto {
  @ApiProperty({ description: '表信息' })
  table: {
    id: string;
    name: string;
    displayName: string;
  };

  @ApiProperty({ description: '当前版本信息' })
  currentVersion: {
    id: string;
    name: string;
    version: number;
  };

  @ApiProperty({ description: '比较版本信息' })
  comparisonVersion: {
    id: string;
    name: string;
    version: number;
  };

  @ApiProperty({ description: '影响概要' })
  impactSummary: {
    totalImpacts: number;
    criticalImpacts: number;
    highImpacts: number;
    mediumImpacts: number;
    lowImpacts: number;
  };

  @ApiProperty({ description: '影响分析结果', type: 'array' })
  impacts: ImpactResult[];
}
