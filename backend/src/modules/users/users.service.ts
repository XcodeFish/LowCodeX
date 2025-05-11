import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto, UpdateUserDto, UserQueryParamsDto } from './dto';
import {
  UserWithRelations,
  PaginatedUsersResponse,
  RoleWithRelations,
  Permission,
} from './interfaces';
import { Prisma } from '../../../generated/prisma';

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
      const userData: Prisma.UserCreateInput = {
        username: createUserDto.username,
        email: createUserDto.email,
        password: hashedPassword,
        name: createUserDto.name,
        avatar: createUserDto.avatar,
        status: createUserDto.status || 'active',
        tenantId: createUserDto.tenantId,
      };

      // 先创建用户
      const user = await this.prisma.user.create({
        data: userData,
      });

      // 如果有角色，建立关联
      if (createUserDto.roleIds && createUserDto.roleIds.length > 0) {
        // 创建用户后，创建用户与角色的关联
        await Promise.all(
          createUserDto.roleIds.map((roleId) =>
            this.prisma.userroles.create({
              data: {
                A: user.id,
                B: roleId,
              },
            }),
          ),
        );
      }

      // 获取用户的角色信息
      const roles = await this.prisma.$queryRaw`
        SELECT r.*
        FROM \`roles\` r
        JOIN \`_userroles\` ur ON r.id = ur.B
        WHERE ur.A = ${user.id}
      `;

      // 为角色获取权限
      const rolesWithPermissions = await Promise.all(
        (roles as any[]).map(async (role) => {
          const permissions = await this.prisma.$queryRaw`
            SELECT p.*
            FROM \`permissions\` p
            JOIN \`_rolepermissions\` rp ON p.id = rp.B
            WHERE rp.A = ${role.id}
          `;
          return { ...role, permissions };
        }),
      );

      // 转换为业务模型
      return this.mapToUserWithRelations({
        ...user,
        roles: rolesWithPermissions,
      } as any);
    } catch (error) {
      this.logger.error(`创建用户失败: ${error.message}`, error.stack);
      throw new BadRequestException('创建用户失败，请稍后再试');
    }
  }

  // 查询用户列表（分页）
  async findAll(params: UserQueryParamsDto): Promise<PaginatedUsersResponse> {
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

    // 角色过滤
    if (roleId) {
      where.roles = {
        some: {
          id: roleId,
        },
      };
    }

    try {
      // 获取总数
      const total = await this.prisma.user.count({ where });

      // 获取用户列表
      const users = await this.prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          email: true,
          password: true, // 会在mapper函数中移除
          name: true,
          avatar: true, // 确保包含头像
          status: true,
          tenantId: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
        },
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      });

      // 为每个用户获取角色信息
      const usersWithRoles = await Promise.all(
        users.map(async (user) => {
          const roles = await this.prisma.$queryRaw`
            SELECT r.*
            FROM \`roles\` r
            JOIN \`_userroles\` ur ON r.id = ur.B
            WHERE ur.A = ${user.id}
          `;

          // 为每个角色获取权限
          const rolesWithPermissions = await Promise.all(
            (roles as any[]).map(async (role) => {
              const permissions = await this.prisma.$queryRaw`
                SELECT p.*
                FROM \`permissions\` p
                JOIN \`_rolepermissions\` rp ON p.id = rp.B
                WHERE rp.A = ${role.id}
              `;
              return { ...role, permissions };
            }),
          );

          return { ...user, roles: rolesWithPermissions };
        }),
      );

      // 转换为期望的响应格式
      const items = usersWithRoles.map((user) =>
        this.mapToUserWithRelations(user),
      );

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
  async findOneWithRoles(id: string): Promise<UserWithRelations> {
    this.logger.log(`正在查询用户ID: ${id}`);

    // 验证ID参数
    if (!id) {
      this.logger.error('查询用户失败: 缺少用户ID');
      throw new BadRequestException('用户ID不能为空');
    }

    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          username: true,
          email: true,
          password: true, // 会在后面过滤掉
          name: true,
          avatar: true, // 确保选择avatar字段
          status: true,
          tenantId: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
        },
      });

      if (!user) {
        this.logger.warn(`未找到ID为 ${id} 的用户`);
        throw new NotFoundException(`未找到ID为 ${id} 的用户`);
      }

      // 获取用户的角色
      const roles = await this.prisma.$queryRaw`
        SELECT r.*
        FROM \`roles\` r
        JOIN \`_userroles\` ur ON r.id = ur.B
        WHERE ur.A = ${user.id}
      `;

      // 为角色获取权限
      const rolesWithPermissions = await Promise.all(
        (roles as any[]).map(async (role) => {
          const permissions = await this.prisma.$queryRaw`
            SELECT p.*
            FROM \`permissions\` p
            JOIN \`_rolepermissions\` rp ON p.id = rp.B
            WHERE rp.A = ${role.id}
          `;
          return { ...role, permissions };
        }),
      );

      // 转换为期望的响应格式，明确移除password字段
      const userWithRoles = {
        ...user,
        roles: rolesWithPermissions,
      };

      // 显式记录移除password前的对象结构
      this.logger.debug(
        `用户对象转换前：${Object.keys(userWithRoles).join(', ')}`,
      );

      const result = this.mapToUserWithRelations(userWithRoles as any);

      // 显式检查password是否被移除，avatar是否存在
      this.logger.debug(`用户对象转换后：${Object.keys(result).join(', ')}`);
      if ('password' in result) {
        this.logger.warn(`警告：用户ID=${id}的响应中仍包含password字段`);
        // 确保删除password字段
        const { password, ...userWithoutPassword } = result as any;
        return userWithoutPassword;
      }

      // 确保avatar字段存在
      if (!('avatar' in result)) {
        this.logger.warn(`警告：用户ID=${id}的响应中缺少avatar字段`);
      }

      return result;
    } catch (error) {
      // 重新抛出NotFound异常
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(`查询用户失败: ${error.message}`, error.stack);
      throw new BadRequestException('查询用户信息失败，请稍后再试');
    }
  }

  // 根据用户名查找用户（用于认证）
  async findByUsername(username: string): Promise<any> {
    // 返回类型改为any，允许包含password字段用于认证
    this.logger.log(`正在查询用户名: ${username}`);

    const user = await this.prisma.user.findFirst({
      where: { username },
      select: {
        id: true,
        username: true,
        email: true,
        password: true, // 认证需要，会在auth服务中过滤
        name: true,
        avatar: true, // 确保包含头像
        status: true,
        tenantId: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      return null;
    }

    // 获取用户的角色
    const roles = await this.prisma.$queryRaw`
      SELECT r.*
      FROM \`roles\` r
      JOIN \`_userroles\` ur ON r.id = ur.B
      WHERE ur.A = ${user.id}
    `;

    // 为角色获取权限
    const rolesWithPermissions = await Promise.all(
      (roles as any[]).map(async (role) => {
        const permissions = await this.prisma.$queryRaw`
          SELECT p.*
          FROM \`permissions\` p
          JOIN \`_rolepermissions\` rp ON p.id = rp.B
          WHERE rp.A = ${role.id}
        `;
        return { ...role, permissions };
      }),
    );

    // 组合用户和角色
    const userWithRoles = {
      ...user,
      roles: rolesWithPermissions,
    };

    // 记录转换前状态
    this.logger.debug(
      `findByUsername转换前：${Object.keys(userWithRoles).join(', ')}`,
    );

    // 这里返回包含password的完整用户对象，由auth服务处理密码验证和过滤
    return userWithRoles;
  }

  // 更新用户信息
  async update(
    id: string,
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

    // 检查用户名和邮箱是否已被其他用户使用
    if (updateUserDto.username || updateUserDto.email) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          OR: [
            updateUserDto.username
              ? { username: updateUserDto.username }
              : undefined,
            updateUserDto.email ? { email: updateUserDto.email } : undefined,
          ].filter(Boolean) as any,
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
        } else if (
          updateUserDto.email &&
          existingUser.email === updateUserDto.email
        ) {
          throw new ConflictException(`邮箱 ${updateUserDto.email} 已被使用`);
        }
      }
    }

    try {
      // 准备更新数据
      const updateData: Prisma.UserUpdateInput = {};

      // 基本信息
      if (updateUserDto.username) updateData.username = updateUserDto.username;
      if (updateUserDto.email) updateData.email = updateUserDto.email;
      if (updateUserDto.name !== undefined)
        updateData.name = updateUserDto.name;
      if (updateUserDto.avatar !== undefined)
        updateData.avatar = updateUserDto.avatar;
      if (updateUserDto.status) updateData.status = updateUserDto.status;

      // 如果有提供新密码，需要加密
      if (updateUserDto.password) {
        updateData.password = await this.hashPassword(updateUserDto.password);
      }

      // 角色更新
      if (updateUserDto.roleIds !== undefined) {
        // 先删除现有角色关联
        await this.prisma.userroles.deleteMany({
          where: {
            A: id,
          },
        });

        // 添加新的角色关联
        if (updateUserDto.roleIds.length > 0) {
          await Promise.all(
            updateUserDto.roleIds.map((roleId) =>
              this.prisma.userroles.create({
                data: {
                  A: id,
                  B: roleId,
                },
              }),
            ),
          );
        }
      }

      // 更新用户
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: updateData,
      });

      // 获取用户的角色
      const roles = await this.prisma.$queryRaw`
        SELECT r.*
        FROM \`roles\` r
        JOIN \`_userroles\` ur ON r.id = ur.B
        WHERE ur.A = ${id}
      `;

      // 为角色获取权限
      const rolesWithPermissions = await Promise.all(
        (roles as any[]).map(async (role) => {
          const permissions = await this.prisma.$queryRaw`
            SELECT p.*
            FROM \`permissions\` p
            JOIN \`_rolepermissions\` rp ON p.id = rp.B
            WHERE rp.A = ${role.id}
          `;
          return { ...role, permissions };
        }),
      );

      // 返回更新后的用户
      return this.mapToUserWithRelations({
        ...updatedUser,
        roles: rolesWithPermissions,
      } as any);
    } catch (error) {
      this.logger.error(`更新用户失败: ${error.message}`, error.stack);
      throw new BadRequestException('更新用户失败，请稍后再试');
    }
  }

  // 删除用户
  async remove(id: string): Promise<void> {
    this.logger.log(`正在删除用户ID: ${id}`);

    // 检查用户是否存在
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`未找到ID为 ${id} 的用户`);
    }

    try {
      // 删除用户 (many-to-many关系会自动处理)
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
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  // 将Prisma用户对象映射到业务接口类型
  private mapToUserWithRelations(user: any): UserWithRelations {
    // 为了避免类型错误，先使用any类型处理
    const userObj = { ...user };

    // 移除password字段，确保不返回给客户端
    if (userObj.password !== undefined) {
      delete userObj.password;
    }

    // 日志记录是否成功处理password字段
    const passwordExistsAfterProcessing = 'password' in userObj;
    if (passwordExistsAfterProcessing) {
      this.logger.warn('警告：即使尝试删除后，password字段仍然存在');
      delete userObj.password; // 再次尝试删除
    }

    // 确保avatar字段存在
    if (user.avatar !== undefined && !('avatar' in userObj)) {
      userObj.avatar = user.avatar;
    }

    return {
      id: userObj.id,
      username: userObj.username,
      email: userObj.email,
      name: userObj.name || undefined,
      avatar: userObj.avatar || undefined,
      status: userObj.status,
      tenantId: userObj.tenantId || undefined,
      createdAt: userObj.createdAt,
      updatedAt: userObj.updatedAt,
      lastLoginAt: userObj.lastLoginAt,
      roles: Array.isArray(userObj.roles)
        ? userObj.roles.map((role) => ({
            id: role.id,
            name: role.name,
            description: role.description || undefined,
            tenantId: role.tenantId || undefined,
            createdAt: role.createdAt,
            updatedAt: role.updatedAt,
            permissions: Array.isArray(role.permissions)
              ? role.permissions.map((perm) => ({
                  id: perm.id,
                  name: perm.name,
                  code: perm.code,
                  description: perm.description || undefined,
                  tenantId: perm.tenantId || undefined,
                  createdAt: perm.createdAt,
                  updatedAt: perm.updatedAt,
                }))
              : [],
          }))
        : [],
    };
  }
}
