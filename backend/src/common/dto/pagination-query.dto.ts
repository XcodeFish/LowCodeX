import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * 分页查询DTO
 */
export class PaginationQueryDto {
  /**
   * 当前页码（从1开始）
   * @example 1
   */
  @ApiProperty({
    description: '当前页码（从1开始）',
    default: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  page: number = 1;

  /**
   * 每页大小
   * @example 10
   */
  @ApiProperty({
    description: '每页大小',
    default: 10,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  pageSize: number = 10;
}
