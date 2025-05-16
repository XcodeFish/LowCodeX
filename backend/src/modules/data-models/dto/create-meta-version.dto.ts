import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class CreateMetaVersionDto {
  @ApiProperty({ description: '表ID' })
  @IsUUID('4')
  tableId: string;

  @ApiProperty({ description: '版本名称' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '版本描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '是否已发布' })
  @IsBoolean()
  isPublished: boolean;

  @ApiPropertyOptional({ description: '版本说明' })
  @IsOptional()
  @IsString()
  comment?: string;
}
