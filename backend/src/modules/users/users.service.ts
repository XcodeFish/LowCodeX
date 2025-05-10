import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';
import * as bcrypt from 'bcryptjs';
import {
  CreateUserDto,
  UpdateUserDto,
  UserQueryParams,
  PaginatedUsersResponse,
  UserWithRelations,
} from '../../types/users.types';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private prisma: PrismaService) {}

  // 创建新用户
  async create(createUserDto: CreateUserDto): Promise<UserWithRelations> {
    this.logger.log(`正在创建新用户: ${createUserDto.username}`);

    // 检查用户名和邮箱是否已存在
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: createUserDto.username },
          { email: createUserDto.email },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.username === createUserDto.username) {
        throw new ConflictException(`用户名 ${createUserDto.username} 已存在`);
      } else {
        throw new ConflictException(`邮箱 ${createUserDto.email} 已被使用`);
      }
    }

    // 密码加密
    const hashedPassword = await this.hashPassword(createUserDto.password);

    try {
      // 创建用户
      const user = await this.prisma.user.create({
        data: {
          username: createUserDto.username,
          email: createUserDto.email,
          password: hashedPassword,
          name: createUserDto.name,
          avatar: createUserDto.avatar,
          status: createUserDto.status || 'active',
          tenantId: createUserDto.tenantId,
        },
      });

      // 如果有提供角色ID，分配角色给用户
      if (createUserDto.roleIds && createUserDto.roleIds.length > 0) {
        await this.assignRolesToUser(user.id, createUserDto.roleIds);
      }

      return this.findOneWithRoles(user.id);
    } catch (error) {
      this.logger.error(`创建用户失败: ${error.message}`, error.stack);
      throw new BadRequestException('创建用户失败，请稍后再试');
    }
  }

  // 查询用户列表（分页）
  async findAll(params: UserQueryParams): Promise<PaginatedUsersResponse> {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      roleId,
      tenantId,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;

    const skip = (page - 1) * limit;
    const where: any = {};

    // 构建查询条件
    if (search) {
      where.OR = [
        { username: { contains: search } },
        { email: { contains: search } },
        { name: { contains: search } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (tenantId) {
      where.tenantId = tenantId;
    }

    // 角色过滤较为复杂，需要使用关系过滤
    if (roleId) {
      where.roles = {
        some: {
          roleId: roleId,
        },
      };
    }

    try {
      // 获取总数
      const total = await this.prisma.user.count({ where });

      // 获取用户列表
      const users = await this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          roles: true,
        },
      });

      // 转换为期望的响应格式
      const items = users.map((user) => {
        // 将Prisma模型转换为我们的自定义类型
        return {
          ...user,
          roles: user.roles || [],
        } as unknown as UserWithRelations;
      });

      return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error(`查询用户列表失败: ${error.message}`, error.stack);
      throw new BadRequestException('查询用户列表失败，请稍后再试');
    }
  }

  // 根据ID查找用户（包含角色和权限信息）
  async findOneWithRoles(id: number): Promise<UserWithRelations> {
    this.logger.log(`正在查询用户ID: ${id}`);

    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        roles: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`未找到ID为 ${id} 的用户`);
    }

    // 转换为期望的响应格式
    return {
      ...user,
      roles: user.roles || [],
    } as unknown as UserWithRelations;
  }

  // 根据用户名查找用户（用于认证）
  async findByUsername(username: string): Promise<UserWithRelations | null> {
    this.logger.log(`正在查询用户名: ${username}`);

    const user = await this.prisma.user.findFirst({
      where: { username },
      include: {
        roles: true,
      },
    });

    if (!user) {
      return null;
    }

    // 转换为期望的响应格式
    return {
      ...user,
      roles: user.roles || [],
    } as unknown as UserWithRelations;
  }

  // 更新用户信息
  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserWithRelations> {
    this.logger.log(`正在更新用户ID: ${id}`);

    // 检查用户是否存在
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`未找到ID为 ${id} 的用户`);
    }

    // 如果更新用户名或邮箱，需要检查是否已存在
    if (updateUserDto.username || updateUserDto.email) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          OR: [
            updateUserDto.username ? { username: updateUserDto.username } : {},
            updateUserDto.email ? { email: updateUserDto.email } : {},
          ],
          NOT: { id },
        },
      });

      if (existingUser) {
        if (
          updateUserDto.username &&
          existingUser.username === updateUserDto.username
        ) {
          throw new ConflictException(
            `用户名 ${updateUserDto.username} 已存在`,
          );
        }
        if (updateUserDto.email && existingUser.email === updateUserDto.email) {
          throw new ConflictException(`邮箱 ${updateUserDto.email} 已被使用`);
        }
      }
    }

    // 准备更新数据
    const updateData: any = { ...updateUserDto };

    // 如果有密码更新，进行加密
    if (updateUserDto.password) {
      updateData.password = await this.hashPassword(updateUserDto.password);
    }

    // 排除不属于用户表的字段
    const { roleIds, ...userData } = updateData;

    try {
      // 更新用户信息
      await this.prisma.user.update({
        where: { id },
        data: userData,
      });

      // 如果有提供角色ID，更新用户角色
      if (roleIds) {
        // 使用正确的方式连接用户和角色
        // 需要根据实际的Prisma模型来操作关系表
        // 移除现有关联
        await this.prisma.user.update({
          where: { id },
          data: {
            roles: {
              set: [],
            },
          },
        });

        // 分配新角色
        await this.assignRolesToUser(id, roleIds);
      }

      return this.findOneWithRoles(id);
    } catch (error) {
      this.logger.error(`更新用户失败: ${error.message}`, error.stack);
      throw new BadRequestException('更新用户失败，请稍后再试');
    }
  }

  // 删除用户
  async remove(id: number): Promise<void> {
    this.logger.log(`正在删除用户ID: ${id}`);

    // 检查用户是否存在
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`未找到ID为 ${id} 的用户`);
    }

    try {
      // 删除用户，Prisma会自动处理关联关系
      await this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      this.logger.error(`删除用户失败: ${error.message}`, error.stack);
      throw new BadRequestException('删除用户失败，请稍后再试');
    }
  }

  // 密码加密
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  // 分配角色给用户
  private async assignRolesToUser(
    userId: number,
    roleIds: number[],
  ): Promise<void> {
    // 检查角色是否存在
    const roles = await this.prisma.role.findMany({
      where: { id: { in: roleIds } },
    });

    if (roles.length !== roleIds.length) {
      const foundIds = roles.map((role) => role.id);
      const missingIds = roleIds.filter((id) => !foundIds.includes(id));
      throw new NotFoundException(`未找到以下角色ID: ${missingIds.join(', ')}`);
    }

    // 使用connect来连接用户和角色
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        roles: {
          connect: roleIds.map((id) => ({ id })),
        },
      },
    });
  }
}
