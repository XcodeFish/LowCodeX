import { ApiProperty } from '@nestjs/swagger';

export class VisualDiagramDto {
  @ApiProperty({ description: '图表ID' })
  id: string;

  @ApiProperty({ description: '图表名称' })
  name: string;

  @ApiProperty({ description: '图表描述', nullable: true })
  description: string | null;

  @ApiProperty({ description: '相关表ID列表', type: [String] })
  tableIds: string[];

  @ApiProperty({ description: '图表元素', type: 'array' })
  elements: any[];

  @ApiProperty({ description: '图表连接', type: 'array' })
  connections: any[];

  @ApiProperty({ description: '图表设置', required: false })
  settings?: Record<string, any>;
}

export class VisualDiagramSaveDto {
  @ApiProperty({ description: '图表名称' })
  name: string;

  @ApiProperty({ description: '图表描述', nullable: true })
  description?: string | null;

  @ApiProperty({ description: '相关表ID列表', type: [String] })
  tableIds: string[];

  @ApiProperty({ description: '图表元素', type: 'array' })
  elements: any[];

  @ApiProperty({ description: '图表连接', type: 'array' })
  connections: any[];

  @ApiProperty({ description: '图表设置', required: false })
  settings?: Record<string, any>;
}
