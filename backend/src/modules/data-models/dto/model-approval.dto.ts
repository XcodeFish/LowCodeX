import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, IsEnum } from 'class-validator';

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELED = 'canceled',
}

export class CreateModelApprovalDto {
  @ApiProperty({ description: '元表ID' })
  @IsUUID('4')
  tableId: string;

  @ApiProperty({ description: '版本ID' })
  @IsUUID('4')
  versionId: string;

  @ApiProperty({ description: '申请说明' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ description: '申请附件' })
  @IsOptional()
  @IsString()
  attachments?: string;
}

export class ApproveModelDto {
  @ApiProperty({ description: '审批结果', enum: ApprovalStatus })
  @IsEnum(ApprovalStatus)
  status: ApprovalStatus;

  @ApiProperty({ description: '审批意见' })
  @IsString()
  comment: string;
}

export class ModelApprovalQueryDto {
  @ApiPropertyOptional({ description: '元表ID' })
  @IsOptional()
  @IsUUID('4')
  tableId?: string;

  @ApiPropertyOptional({ description: '审批状态', enum: ApprovalStatus })
  @IsOptional()
  @IsEnum(ApprovalStatus)
  status?: ApprovalStatus;

  @ApiPropertyOptional({ description: '申请人ID' })
  @IsOptional()
  @IsString()
  requestedBy?: string;

  @ApiPropertyOptional({ description: '审批人ID' })
  @IsOptional()
  @IsString()
  approvedBy?: string;
}
