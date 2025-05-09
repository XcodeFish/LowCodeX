# LowCodeX 后端开发指南

## 4. 后端开发指南

### 4.1 项目结构

```
backend/
├── src/
│   ├── common/             # 通用模块
│   │   ├── decorators/     # 自定义装饰器
│   │   ├── filters/        # 异常过滤器
│   │   ├── guards/         # 守卫
│   │   ├── interceptors/   # 拦截器
│   │   ├── middlewares/    # 中间件
│   │   └── pipes/          # 管道
│   ├── config/             # 配置
│   │   ├── database.config.ts
│   │   ├── auth.config.ts
│   │   └── app.config.ts
│   ├── modules/            # 业务模块
│   │   ├── auth/           # 认证模块
│   │   ├── forms/          # 表单模块
│   │   ├── models/         # 数据模型模块
│   │   ├── tenants/        # 租户模块
│   │   └── workflows/      # 工作流模块
│   ├── prisma/             # Prisma 相关
│   │   └── schema.prisma   # 数据库模型定义
│   ├── app.module.ts       # 根模块
│   └── main.ts             # 应用入口
├── test/                   # 测试目录
├── .env                    # 环境变量
├── .eslintrc.js            # ESLint 配置
├── nest-cli.json           # NestJS CLI 配置
├── package.json            # 依赖管理
├── tsconfig.json           # TypeScript 配置
└── README.md               # 项目说明
```

### 4.2 开发规范

#### 4.2.1 代码风格

后端项目同样使用 ESLint 和 Prettier 保证代码风格一致：

```bash
# 检查代码风格
npm run lint

# 自动修复代码风格问题
npm run lint:fix

# 格式化代码
npm run format
```

#### 4.2.2 命名规范

- **文件命名**：
  - 模块文件：kebab-case（如 `auth.module.ts`）
  - 控制器文件：kebab-case（如 `forms.controller.ts`）
  - 服务文件：kebab-case（如 `tenant.service.ts`）

- **类命名**：
  - 类名使用 PascalCase（如 `FormService`）
  - 接口使用 PascalCase 并以 `I` 前缀（如 `IFormData`）
  - 装饰器使用 camelCase（如 `@currentUser()`）

- **方法命名**：
  - RESTful 控制器方法命名遵循以下约定：
    - `findAll()`: GET /resource
    - `findOne()`: GET /resource/:id
    - `create()`: POST /resource
    - `update()`: PUT /resource/:id
    - `remove()`: DELETE /resource/:id

#### 4.2.3 模块组织

每个功能模块应包含以下文件（以表单模块为例）：

```
forms/
├── dto/                 # 数据传输对象
│   ├── create-form.dto.ts
│   └── update-form.dto.ts
├── entities/            # 实体定义
│   └── form.entity.ts
├── forms.controller.ts  # 控制器
├── forms.service.ts     # 服务
├── forms.module.ts      # 模块定义
└── forms.repository.ts  # 仓储层（可选）
```

### 4.3 核心模块开发指南

#### 4.3.1 动态模型管理

动态模型管理是 LowCodeX 后端的核心功能，实现了灵活的数据结构定义与管理。

**模型设计**：

![动态模型设计](https://via.placeholder.com/800x400?text=动态模型设计)

**核心实现**：

1. **元数据模型定义**:

```typescript
// src/modules/models/entities/meta-table.entity.ts
import { Field, ObjectType } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { MetaField } from './meta-field.entity';

@ObjectType()
@Entity('meta_tables')
export class MetaTable {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ unique: true })
  tableName: string;

  @Field()
  @Column()
  displayName: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field()
  @Column()
  tenantId: string;

  @Field()
  @Column({ default: false })
  isSystem: boolean;

  @Field(() => [MetaField], { nullable: true })
  @OneToMany(() => MetaField, field => field.table)
  fields?: MetaField[];

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
```

```typescript
// src/modules/models/entities/meta-field.entity.ts
import { Field, ObjectType } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { MetaTable } from './meta-table.entity';

@ObjectType()
@Entity('meta_fields')
export class MetaField {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  tableId: string;

  @Field()
  @Column()
  fieldName: string;

  @Field()
  @Column()
  displayName: string;

  @Field()
  @Column()
  fieldType: string;

  @Field()
  @Column({ default: false })
  isRequired: boolean;

  @Field({ nullable: true })
  @Column({ type: 'json', nullable: true })
  defaultValue?: any;

  @Field({ nullable: true })
  @Column({ type: 'json', nullable: true })
  validators?: any;

  @Field()
  @Column()
  tenantId: string;

  @Field(() => MetaTable)
  @ManyToOne(() => MetaTable, table => table.fields)
  @JoinColumn({ name: 'tableId' })
  table: MetaTable;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
```

2. **动态实体服务**:

```typescript
// src/modules/models/dynamic-entity.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MetaTable } from './entities/meta-table.entity';
import { MetaField } from './entities/meta-field.entity';

@Injectable()
export class DynamicEntityService {
  constructor(private prisma: PrismaService) {}

  /**
   * 根据元数据创建Prisma查询
   * @param tableName 表名
   */
  async getEntityQuery(tableName: string) {
    // 获取小写表名作为Prisma模型名
    const modelName = tableName.toLowerCase();

    // 验证模型是否存在于Prisma客户端
    if (!this.prisma[modelName]) {
      throw new Error(`模型 ${modelName} 不存在`);
    }

    return this.prisma[modelName];
  }

  /**
   * 查询动态实体数据
   * @param tableName 表名
   * @param args 查询参数
   */
  async findMany(tableName: string, args: any = {}) {
    const query = await this.getEntityQuery(tableName);
    return query.findMany(args);
  }

  /**
   * 查询单个动态实体
   * @param tableName 表名
   * @param id 记录ID
   */
  async findUnique(tableName: string, id: string) {
    const query = await this.getEntityQuery(tableName);
    return query.findUnique({
      where: { id }
    });
  }

  /**
   * 创建动态实体记录
   * @param tableName 表名
   * @param data 创建数据
   */
  async create(tableName: string, data: any) {
    const query = await this.getEntityQuery(tableName);
    return query.create({
      data
    });
  }

  /**
   * 更新动态实体记录
   * @param tableName 表名
   * @param id 记录ID
   * @param data 更新数据
   */
  async update(tableName: string, id: string, data: any) {
    const query = await this.getEntityQuery(tableName);
    return query.update({
      where: { id },
      data
    });
  }

  /**
   * 删除动态实体记录
   * @param tableName 表名
   * @param id 记录ID
   */
  async delete(tableName: string, id: string) {
    const query = await this.getEntityQuery(tableName);
    return query.delete({
      where: { id }
    });
  }
}
```

3. **元数据管理服务**:

```typescript
// src/modules/models/meta-table.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMetaTableDto } from './dto/create-meta-table.dto';
import { UpdateMetaTableDto } from './dto/update-meta-table.dto';
import { CreateMetaFieldDto } from './dto/create-meta-field.dto';

@Injectable()
export class MetaTableService {
  constructor(private prisma: PrismaService) {}

  /**
   * 获取所有元数据表
   * @param tenantId 租户ID
   */
  async findAll(tenantId: string) {
    return this.prisma.metaTable.findMany({
      where: { tenantId },
      include: { fields: true }
    });
  }

  /**
   * 获取单个元数据表
   * @param id 表ID
   */
  async findOne(id: string) {
    const table = await this.prisma.metaTable.findUnique({
      where: { id },
      include: { fields: true }
    });

    if (!table) {
      throw new NotFoundException(`表 ID ${id} 不存在`);
    }

    return table;
  }

  /**
   * 根据表名获取元数据表
   * @param tableName 表名
   */
  async findByName(tableName: string) {
    const table = await this.prisma.metaTable.findUnique({
      where: { tableName },
      include: { fields: true }
    });

    if (!table) {
      throw new NotFoundException(`表 ${tableName} 不存在`);
    }

    return table;
  }

  /**
   * 创建元数据表
   * @param createMetaTableDto 创建DTO
   */
  async create(createMetaTableDto: CreateMetaTableDto) {
    const { fields, ...tableData } = createMetaTableDto;

    // 创建表
    const table = await this.prisma.metaTable.create({
      data: tableData
    });

    // 如果提供了字段数据，创建字段
    if (fields && fields.length > 0) {
      await this.createFields(table.id, fields);
    }

    return this.findOne(table.id);
  }

  /**
   * 创建字段
   * @param tableId 表ID
   * @param fields 字段数据
   */
  async createFields(tableId: string, fields: CreateMetaFieldDto[]) {
    // 获取表信息
    const table = await this.prisma.metaTable.findUnique({
      where: { id: tableId }
    });

    if (!table) {
      throw new NotFoundException(`表 ID ${tableId} 不存在`);
    }

    // 批量创建字段
    const createdFields = await Promise.all(
      fields.map((field) =>
        this.prisma.metaField.create({
          data: {
            ...field,
            tableId,
            tenantId: table.tenantId
          }
        })
      )
    );

    return createdFields;
  }

  /**
   * 更新元数据表
   * @param id 表ID
   * @param updateMetaTableDto 更新DTO
   */
  async update(id: string, updateMetaTableDto: UpdateMetaTableDto) {
    // 检查表是否存在
    await this.findOne(id);

    // 更新表
    await this.prisma.metaTable.update({
      where: { id },
      data: updateMetaTableDto
    });

    return this.findOne(id);
  }

  /**
   * 删除元数据表
   * @param id 表ID
   */
  async remove(id: string) {
    // 检查表是否存在
    await this.findOne(id);

    // 删除表及其关联的字段
    await this.prisma.$transaction([
      this.prisma.metaField.deleteMany({
        where: { tableId: id }
      }),
      this.prisma.metaTable.delete({
        where: { id }
      })
    ]);

    return { id };
  }
}
```

#### 4.3.2 动态API生成

LowCodeX 基于元数据模型自动生成 RESTful API。

**核心实现**：

```typescript
// src/modules/models/dynamic-api.controller.ts
import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../tenants/guards/tenant.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { DynamicEntityService } from './dynamic-entity.service';
import { MetaTableService } from './meta-table.service';
import { CurrentTenant } from '../tenants/decorators/current-tenant.decorator';
import { CheckPermissions } from '../auth/decorators/check-permissions.decorator';

@ApiTags('动态API')
@Controller('api/:tableName')
@UseGuards(JwtAuthGuard, TenantGuard, PermissionGuard)
export class DynamicApiController {
  constructor(
    private dynamicEntityService: DynamicEntityService,
    private metaTableService: MetaTableService,
  ) {}

  @Get()
  @ApiOperation({ summary: '获取动态实体列表' })
  @ApiParam({ name: 'tableName', description: '表名' })
  @CheckPermissions((tableName) => ({ resource: tableName, action: 'read' }))
  async findAll(
    @Param('tableName') tableName: string,
    @Query() query: any,
    @CurrentTenant() tenantId: string,
  ) {
    // 添加租户过滤
    const filter = { ...query.filter, tenantId };

    // 构建查询参数
    const args = {
      where: filter,
      orderBy: query.sort,
      skip: query.skip ? parseInt(query.skip) : undefined,
      take: query.take ? parseInt(query.take) : undefined,
    };

    return this.dynamicEntityService.findMany(tableName, args);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个动态实体' })
  @ApiParam({ name: 'tableName', description: '表名' })
  @ApiParam({ name: 'id', description: '记录ID' })
  @CheckPermissions((tableName) => ({ resource: tableName, action: 'read' }))
  async findOne(
    @Param('tableName') tableName: string,
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
  ) {
    // 获取记录并验证租户
    const record = await this.dynamicEntityService.findUnique(tableName, id);

    if (record.tenantId !== tenantId) {
      throw new Error('无权访问此记录');
    }

    return record;
  }

  @Post()
  @ApiOperation({ summary: '创建动态实体' })
  @ApiParam({ name: 'tableName', description: '表名' })
  @ApiBody({ description: '实体数据' })
  @CheckPermissions((tableName) => ({ resource: tableName, action: 'create' }))
  async create(
    @Param('tableName') tableName: string,
    @Body() data: any,
    @CurrentTenant() tenantId: string,
  ) {
    // 添加租户ID
    const createData = {
      ...data,
      tenantId,
    };

    return this.dynamicEntityService.create(tableName, createData);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新动态实体' })
  @ApiParam({ name: 'tableName', description: '表名' })
  @ApiParam({ name: 'id', description: '记录ID' })
  @ApiBody({ description: '更新数据' })
  @CheckPermissions((tableName) => ({ resource: tableName, action: 'update' }))
  async update(
    @Param('tableName') tableName: string,
    @Param('id') id: string,
    @Body() data: any,
    @CurrentTenant() tenantId: string,
  ) {
    // 验证记录所属租户
    const record = await this.dynamicEntityService.findUnique(tableName, id);

    if (record.tenantId !== tenantId) {
      throw new Error('无权更新此记录');
    }

    return this.dynamicEntityService.update(tableName, id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除动态实体' })
  @ApiParam({ name: 'tableName', description: '表名' })
  @ApiParam({ name: 'id', description: '记录ID' })
  @CheckPermissions((tableName) => ({ resource: tableName, action: 'delete' }))
  async remove(
    @Param('tableName') tableName: string,
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
  ) {
    // 验证记录所属租户
    const record = await this.dynamicEntityService.findUnique(tableName, id);

    if (record.tenantId !== tenantId) {
      throw new Error('无权删除此记录');
    }

    return this.dynamicEntityService.delete(tableName, id);
  }
}
```

#### 4.3.3 RBAC权限系统

LowCodeX 采用基于角色的访问控制（RBAC）模型，实现细粒度权限控制。

**核心实现**：

1. **权限模型**:

```typescript
// src/modules/auth/entities/permission.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany } from 'typeorm';
import { Role } from './role.entity';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  resource: string;

  @Column()
  action: string;

  @Column({ type: 'json', nullable: true })
  conditions: any;

  @Column()
  tenantId: string;

  @ManyToMany(() => Role, role => role.permissions)
  roles: Role[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

```typescript
// src/modules/auth/entities/role.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { Permission } from './permission.entity';
import { User } from './user.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  tenantId: string;

  @Column({ default: false })
  isSystem: boolean;

  @ManyToMany(() => Permission, permission => permission.roles)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'roleId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permissionId', referencedColumnName: 'id' }
  })
  permissions: Permission[];

  @ManyToMany(() => User, user => user.roles)
  users: User[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

2. **权限守卫**:

```typescript
// src/modules/auth/guards/permission.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AbilityFactory } from '../ability.factory';
import { PERMISSION_CHECKER_KEY } from '../decorators/check-permissions.decorator';
import { RequestWithUser } from '../interfaces/request-with-user.interface';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private abilityFactory: AbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 获取权限检查器
    const permissionChecker = this.reflector.get<Function>(
      PERMISSION_CHECKER_KEY,
      context.getHandler(),
    );

    // 如果没有权限检查器，允许访问
    if (!permissionChecker) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    // 如果没有用户信息，拒绝访问
    if (!user) {
      return false;
    }

    // 构建参数
    const params = context.getArgByIndex(0).params || {};

    // 执行权限检查器获取权限规则
    const permissionRule = permissionChecker(params.tableName);

    // 创建用户能力实例
    const ability = await this.abilityFactory.createForUser(user);

    // 检查用户是否有权限
    return ability.can(permissionRule.action, permissionRule.resource);
  }
}
```

3. **能力工厂**:

```typescript
// src/modules/auth/ability.factory.ts
import { Injectable } from '@nestjs/common';
import { AbilityBuilder, Ability, AbilityClass, ExtractSubjectType, InferSubjects } from '@casl/ability';
import { User } from './entities/user.entity';
import { PermissionService } from './permission.service';

// 定义可能的操作
export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

// 定义所有主体类型
export type Subjects = string | 'all';

// 定义应用能力类型
export type AppAbility = Ability<[Action, Subjects]>;

@Injectable()
export class AbilityFactory {
  constructor(private permissionService: PermissionService) {}

  async createForUser(user: User): Promise<AppAbility> {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      Ability as AbilityClass<AppAbility>,
    );

    // 获取用户的所有权限
    const permissions = await this.permissionService.findByRoles(user.roleIds);

    // 应用权限规则
    permissions.forEach(permission => {
      // 处理条件
      let conditions = null;

      if (permission.conditions) {
        conditions = this.parseConditions(permission.conditions, user);
      }

      // 定义能力
      can(permission.action as Action, permission.resource, conditions);
    });

    return build();
  }

  // 解析条件表达式中的变量
  private parseConditions(conditions: any, user: User): any {
    // 简单的条件变量替换实现
    // 实际实现可能需要更复杂的解析器

    if (typeof conditions === 'object') {
      const result = {};

      for (const key in conditions) {
        const value = conditions[key];

        if (typeof value === 'string' && value.startsWith('$user.')) {
          const userProp = value.substring(6); // 去掉 '$user.'
          result[key] = user[userProp];
        } else if (typeof value === 'object') {
          result[key] = this.parseConditions(value, user);
        } else {
          result[key] = value;
        }
      }

      return result;
    }

    return conditions;
  }
}
