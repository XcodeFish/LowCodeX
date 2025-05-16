import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../../services/prisma.service';
import {
  CreateModelApprovalDto,
  ApproveModelDto,
  ApprovalStatus,
} from '../dto/model-approval.dto';
import { MetaVersionsService } from './meta-versions.service';
import { ModelGeneratorService } from './model-generator.service';

@Injectable()
export class ModelApprovalService {
  constructor(
    private prisma: PrismaService,
    private versionsService: MetaVersionsService,
    private modelGeneratorService: ModelGeneratorService,
  ) {}

  async create(dto: CreateModelApprovalDto, userId: string) {
    // 检查是否有正在审批的申请
    const pendingApproval = await this.prisma.modelApproval.findFirst({
      where: {
        tableId: dto.tableId,
        status: ApprovalStatus.PENDING,
      },
    });

    if (pendingApproval) {
      throw new ConflictException('该模型已有待审批的发布申请');
    }

    // 创建审批申请
    return this.prisma.modelApproval.create({
      data: {
        tableId: dto.tableId,
        versionId: dto.versionId,
        description: dto.description,
        attachments: dto.attachments,
        requestedBy: userId,
      },
      include: {
        table: true,
        version: true,
      },
    });
  }

  async approve(id: string, dto: ApproveModelDto, userId: string) {
    // 查找审批申请
    const approval = await this.prisma.modelApproval.findUnique({
      where: { id },
      include: {
        table: true,
        version: true,
      },
    });

    if (!approval) {
      throw new NotFoundException(`ID为${id}的审批申请不存在`);
    }

    if (approval.status !== ApprovalStatus.PENDING) {
      throw new ConflictException('该审批申请已处理');
    }

    // 不能自己审批自己的申请
    if (approval.requestedBy === userId) {
      throw new ForbiddenException('不能审批自己提交的申请');
    }

    // 更新审批状态
    const updatedApproval = await this.prisma.modelApproval.update({
      where: { id },
      data: {
        status: dto.status,
        approvedBy: userId,
        approvedAt: new Date(),
        comment: dto.comment,
      },
      include: {
        table: true,
        version: true,
      },
    });

    // 如果审批通过，发布版本并生成代码
    if (dto.status === ApprovalStatus.APPROVED) {
      // 发布版本
      await this.versionsService.publish(approval.versionId, userId);

      // 生成应用模块
      await this.modelGeneratorService.generateApplicationModule(
        approval.tableId,
      );
    }

    return updatedApproval;
  }

  async cancel(id: string, userId: string) {
    // 查找审批申请
    const approval = await this.prisma.modelApproval.findUnique({
      where: { id },
    });

    if (!approval) {
      throw new NotFoundException(`ID为${id}的审批申请不存在`);
    }

    if (approval.status !== ApprovalStatus.PENDING) {
      throw new ConflictException('该审批申请已处理，无法取消');
    }

    // 只有申请人可以取消
    if (approval.requestedBy !== userId) {
      throw new ForbiddenException('只有申请人可以取消审批申请');
    }

    // 更新为已取消
    return this.prisma.modelApproval.update({
      where: { id },
      data: {
        status: ApprovalStatus.CANCELED,
      },
    });
  }

  async findAll(
    tableId?: string,
    status?: ApprovalStatus,
    requestedBy?: string,
    approvedBy?: string,
  ) {
    const where = {};

    if (tableId) {
      where['tableId'] = tableId;
    }

    if (status) {
      where['status'] = status;
    }

    if (requestedBy) {
      where['requestedBy'] = requestedBy;
    }

    if (approvedBy) {
      where['approvedBy'] = approvedBy;
    }

    return this.prisma.modelApproval.findMany({
      where,
      include: {
        table: {
          select: {
            id: true,
            name: true,
            displayName: true,
          },
        },
        version: {
          select: {
            id: true,
            name: true,
            version: true,
          },
        },
      },
      orderBy: {
        requestedAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const approval = await this.prisma.modelApproval.findUnique({
      where: { id },
      include: {
        table: true,
        version: true,
      },
    });

    if (!approval) {
      throw new NotFoundException(`ID为${id}的审批申请不存在`);
    }

    return approval;
  }

  // 获取审批流程历史
  async getApprovalHistory(tableId: string) {
    return this.prisma.modelApproval.findMany({
      where: {
        tableId,
      },
      include: {
        version: {
          select: {
            id: true,
            name: true,
            version: true,
          },
        },
      },
      orderBy: {
        requestedAt: 'desc',
      },
    });
  }
}
