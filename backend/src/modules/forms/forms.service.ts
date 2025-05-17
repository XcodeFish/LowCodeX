import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';
import { CreateFormDto, UpdateFormDto } from './dto/forms.dto';

@Injectable()
export class FormsService {
  constructor(private readonly prisma: PrismaService) {}

  // 表单模板 CRUD
  async createFormTemplate(dto: CreateFormDto) {
    const exist = await this.prisma.form.findFirst({
      where: { code: dto.code },
    });
    if (exist) throw new BadRequestException('表单编码已存在');
    const form = await this.prisma.form.create({
      data: {
        ...dto,
        status: 'draft',
        version: 1,
      },
    });
    return form;
  }

  async getFormTemplates(query: any) {
    const { page = 1, pageSize = 20, status, keyword } = query;
    const where: any = {};
    if (status) where.status = status;
    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { code: { contains: keyword } },
      ];
    }
    const [items, total] = await this.prisma.$transaction([
      this.prisma.form.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.form.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  async getFormTemplate(id: string) {
    const form = await this.prisma.form.findUnique({ where: { id } });
    if (!form) throw new NotFoundException('表单模板不存在');
    return form;
  }

  async updateFormTemplate(id: string, dto: UpdateFormDto) {
    const form = await this.prisma.form.findUnique({ where: { id } });
    if (!form) throw new NotFoundException('表单模板不存在');
    const updated = await this.prisma.form.update({
      where: { id },
      data: {
        ...dto,
        version: form.version + 1,
      },
    });
    return updated;
  }

  async deleteFormTemplate(id: string) {
    const form = await this.prisma.form.findUnique({ where: { id } });
    if (!form) throw new NotFoundException('表单模板不存在');
    await this.prisma.form.delete({ where: { id } });
    return { id };
  }

  // 发布/停用/归档
  async publishForm(id: string) {
    const form = await this.prisma.form.findUnique({ where: { id } });
    if (!form) throw new NotFoundException('表单模板不存在');
    const updated = await this.prisma.form.update({
      where: { id },
      data: { status: 'published' },
    });
    return updated;
  }

  async archiveForm(id: string) {
    const form = await this.prisma.form.findUnique({ where: { id } });
    if (!form) throw new NotFoundException('表单模板不存在');
    const updated = await this.prisma.form.update({
      where: { id },
      data: { status: 'archived', archivedAt: new Date() },
    });
    return updated;
  }

  // 表单数据
  async submitFormData(formId: string, data: any) {
    const form = await this.prisma.form.findFirst({
      where: { id: formId, status: 'published' },
    });
    if (!form) throw new NotFoundException('表单模板不存在或未发布');
    const entity = await this.prisma.formData.create({
      data: {
        formId,
        data: JSON.stringify(data),
        version: form.version,
        archived: false,
      },
    });
    return entity;
  }

  async getFormData(formId: string, query: any) {
    const { page = 1, pageSize = 20 } = query;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.formData.findMany({
        where: { formId, archived: false },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.formData.count({ where: { formId, archived: false } }),
    ]);
    return { items, total, page, pageSize };
  }

  // 数据归档
  async archiveFormData(id: string) {
    const data = await this.prisma.formData.findUnique({ where: { id } });
    if (!data) throw new NotFoundException('表单数据不存在');
    const updated = await this.prisma.formData.update({
      where: { id },
      data: { archived: true },
    });
    return updated;
  }
}
