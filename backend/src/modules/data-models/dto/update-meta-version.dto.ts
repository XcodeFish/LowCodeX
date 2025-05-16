import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

/**
 * 更新元版本DTO
 */
export class UpdateMetaVersionDto {
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
