# LowCodeX 后端功能设计文档

## 1. 概述

本文档详细描述LowCodeX低代码平台的后端功能设计，包括系统架构、核心模块实现、API设计和数据模型。后端采用 Nest.js + Prisma + MySQL + Redis 技术栈，通过模块化和微服务思想构建灵活、可扩展的企业级应用开发平台。

## 2. 系统架构设计

### 2.1 整体架构

LowCodeX后端采用分层架构，主要包含以下层次：

- **API层**：处理HTTP请求，参数验证，路由控制
- **服务层**：实现业务逻辑，事务管理
- **数据访问层**：数据库交互，ORM映射
- **基础设施层**：缓存，队列，存储等基础服务

系统架构图如下：

```
+----------------------------------------------------------+
|                      客户端应用                            |
+----------------------------------------------------------+
                          |
                          | HTTP/WebSocket
                          v
+----------------------------------------------------------+
|                     API网关/负载均衡                        |
+----------------------------------------------------------+
                          |
                          v
+----------------------------------------------------------+
|                       Nest.js应用                         |
|  +----------------+ +----------------+ +----------------+ |
|  |    API控制器    | |   认证与授权    | |    请求过滤     | |
|  +----------------+ +----------------+ +----------------+ |
|                          |                                |
|  +----------------+ +----------------+ +----------------+ |
|  |    业务服务     | |   工作流引擎    | |   实体管理器    | |
|  +----------------+ +----------------+ +----------------+ |
|                          |                                |
|  +----------------+ +----------------+ +----------------+ |
|  |     ORM层      | |   缓存管理器    | |   事件系统     | |
|  |    (Prisma)    | |    (Redis)     | |               | |
|  +----------------+ +----------------+ +----------------+ |
+----------------------------------------------------------+
                          |
        +----------------+-----------------+
        |                                  |
        v                                  v
+----------------+                  +----------------+
|     MySQL      |                  |     Redis      |
| (业务数据/元数据) |                  | (缓存/队列/会话) |
+----------------+                  +----------------+
```

### 2.2 模块划分

系统按照业务功能划分为以下主要模块：

1. **认证与授权模块**：用户认证、JWT管理、RBAC权限控制
2. **租户管理模块**：多租户支持、租户隔离、资源管理
3. **数据模型模块**：元数据管理、动态实体、字段配置
4. **表单管理模块**：表单模板、表单验证、数据处理
5. **工作流引擎模块**：流程定义、任务处理、状态管理
6. **API生成模块**：动态API、API权限、数据验证
7. **存储管理模块**：文件上传下载、存储策略
8. **系统管理模块**：日志、监控、系统配置

### 2.3 技术选型

| 组件 | 技术选择 | 说明 |
|-----|---------|------|
| Web框架 | Nest.js | 企业级Node.js框架，支持TypeScript，依赖注入，模块化设计 |
| ORM | Prisma | 下一代ORM，类型安全，自动生成客户端 |
| 数据库 | MySQL | 关系型数据库，稳定可靠 |
| 缓存/队列 | Redis | 高性能内存数据库，支持多种数据结构 |
| API文档 | Swagger | 自动生成API文档，支持在线测试 |
| 权限控制 | CASL | 细粒度的权限控制库 |
| 认证 | Passport.js | 灵活的认证中间件 |
| 消息队列 | BullMQ | 基于Redis的可靠队列系统 |
| 日志 | Winston | 灵活的日志记录库 |
| 监控 | Prometheus + Grafana | 监控和可视化系统 |

## 3. 核心模块设计

### 3.1 认证与授权模块

认证与授权模块负责用户身份验证和权限控制，是系统安全的基础。

#### 3.1.1 用户认证

**实现方案**：

- 使用JWT (JSON Web Token) 进行无状态认证
- 采用Passport.js集成多种认证策略
- 支持账号密码、OAuth2.0、LDAP等认证方式
- 实现MFA (多因素认证) 增强安全性

**核心数据结构**：

```typescript
// src/modules/auth/entities/user.entity.ts
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ nullable: true })
  fullName: string;

  @Column({ default: false })
  isActive: boolean;

  @Column({ default: false })
  isSuperAdmin: boolean;

  @Column()
  tenantId: string;

  @ManyToMany(() => Role, role => role.users)
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'roleId', referencedColumnName: 'id' }
  })
  roles: Role[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**认证流程**：

1. 客户端提交用户名密码
2. 服务端验证凭据并生成JWT
3. 客户端存储JWT并在后续请求中携带
4. 服务端验证JWT有效性和权限

**关键服务接口**：

```typescript
// src/modules/auth/auth.service.ts
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    // 验证用户凭据
  }

  async login(user: any) {
    // 生成JWT令牌
    const payload = { email: user.email, sub: user.id, tenantId: user.tenantId };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async refreshToken(refreshToken: string) {
    // 刷新令牌
  }

  async validateToken(token: string) {
    // 验证令牌有效性
  }
}
```

#### 3.1.2 RBAC权限控制

**实现方案**：

- 基于角色的访问控制 (RBAC) 模型
- 使用CASL库实现细粒度权限管理
- 支持资源级和操作级权限定义
- 实现数据行级权限控制

**核心数据结构**：

```typescript
// src/modules/auth/entities/role.entity.ts
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

  @ManyToMany(() => Permission, permission => permission.roles)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'roleId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permissionId', referencedColumnName: 'id' }
  })
  permissions: Permission[];

  @ManyToMany(() => User, user => user.roles)
  users: User[];
}

// src/modules/auth/entities/permission.entity.ts
@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  resource: string;  // 资源名称，如 'users', 'forms'

  @Column()
  action: string;    // 操作，如 'read', 'create', 'update', 'delete'

  @Column({ type: 'json', nullable: true })
  conditions: any;   // 条件，如 { tenantId: '${user.tenantId}' }

  @Column()
  tenantId: string;

  @ManyToMany(() => Role, role => role.permissions)
  roles: Role[];
}
```

**权限检查机制**：

1. 用户请求资源
2. 系统获取用户角色
3. 构建用户权限能力（Ability）
4. 根据资源和操作检查权限
5. 应用条件过滤数据结果

**核心服务**：

```typescript
// src/modules/auth/ability.factory.ts
@Injectable()
export class AbilityFactory {
  constructor(private permissionService: PermissionService) {}

  async createForUser(user: User): Promise<AppAbility> {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      Ability as AbilityClass<AppAbility>,
    );

    // 管理员拥有全部权限
    if (user.isSuperAdmin) {
      can('manage', 'all');
      return build();
    }

    // 获取用户所有角色的权限
    const permissions = await this.permissionService.findByRoles(
      user.roles.map(role => role.id)
    );

    // 应用权限规则
    permissions.forEach(permission => {
      let conditions = null;

      // 解析条件中的变量
      if (permission.conditions) {
        conditions = this.parseConditions(permission.conditions, user);
      }

      can(permission.action, permission.resource, conditions);
    });

    return build();
  }

  // 解析条件表达式中的变量
  private parseConditions(conditions: any, user: User): any {
    // 实现条件解析逻辑
  }
}
```

**权限守卫**：

```typescript
// src/modules/auth/guards/permission.guard.ts
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private abilityFactory: AbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 获取设置在路由或控制器上的权限要求
    const requiredPermission = this.reflector.get<PermissionRequirement>(
      'permission',
      context.getHandler(),
    );

    if (!requiredPermission) {
      return true; // 没有权限要求，默认允许
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    // 创建用户权限能力
    const ability = await this.abilityFactory.createForUser(user);

    // 检查用户是否有权限
    return ability.can(
      requiredPermission.action,
      requiredPermission.resource
    );
  }
}
```

### 3.2 租户管理模块

租户管理模块实现多租户支持，使系统能够服务于多个组织，同时确保租户间数据隔离。

#### 3.2.1 租户隔离策略

**实现方案**：

- 支持三种隔离级别：
  1. **共享数据库，共享表**：通过tenantId字段区分（适合小型部署）
  2. **共享数据库，独立Schema**：每个租户使用独立Schema（较好的隔离性）
  3. **独立数据库**：每个租户独立数据库（最高隔离级别）
- 实现策略模式动态切换隔离方式
- 支持混合模式隔离（不同类型的数据采用不同隔离级别）

**核心数据结构**：

```typescript
// src/modules/tenants/entities/tenant.entity.ts
@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  domain: string;

  @Column({ default: 'SHARED_TABLE' })
  isolationMode: 'SHARED_TABLE' | 'SHARED_SCHEMA' | 'DEDICATED_DB';

  @Column({ nullable: true })
  databaseConnectionString: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'json', nullable: true })
  settings: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**租户识别策略**：

```typescript
// src/modules/tenants/tenant-resolver.service.ts
@Injectable()
export class TenantResolverService {
  constructor(
    private tenantService: TenantService,
    private configService: ConfigService,
  ) {}

  async resolveTenantFromRequest(request: Request): Promise<Tenant> {
    const strategy = this.configService.get('TENANT_RESOLVER');

    switch (strategy) {
      case 'subdomain':
        return this.resolveFromSubdomain(request);
      case 'path':
        return this.resolveFromPath(request);
      case 'header':
        return this.resolveFromHeader(request);
      default:
        throw new Error(`不支持的租户解析策略: ${strategy}`);
    }
  }

  private async resolveFromSubdomain(request: Request): Promise<Tenant> {
    // 从子域名解析租户
    const host = request.headers.host;
    const subdomain = host.split('.')[0];
    return this.tenantService.findByDomain(subdomain);
  }

  private async resolveFromPath(request: Request): Promise<Tenant> {
    // 从URL路径解析租户
    const path = request.url;
    const segments = path.split('/');
    if (segments.length >= 2) {
      return this.tenantService.findByName(segments[1]);
    }
    throw new Error('URL路径中未找到租户信息');
  }

  private async resolveFromHeader(request: Request): Promise<Tenant> {
    // 从请求头解析租户
    const tenantHeader = this.configService.get('TENANT_HEADER') || 'X-Tenant-ID';
    const tenantId = request.headers[tenantHeader.toLowerCase()];

    if (!tenantId) {
      throw new Error(`请求头 ${tenantHeader} 中未找到租户ID`);
    }

    return this.tenantService.findById(tenantId as string);
  }
}
```

#### 3.2.2 租户生命周期管理

**实现方案**：

- 提供租户创建、配置、暂停、重新激活、删除等功能
- 实现租户数据初始化流程（基础数据、默认用户、角色等）
- 支持租户配置模板，快速创建相似租户
- 实现租户数据备份与恢复机制

**租户创建流程**：

1. 创建租户基本信息
2. 根据隔离模式准备数据库资源
3. 初始化租户系统数据（角色、权限等）
4. 创建初始管理员账号
5. 应用租户模板配置

**核心服务接口**：

```typescript
// src/modules/tenants/tenant.service.ts
@Injectable()
export class TenantService {
  constructor(
    private prisma: PrismaService,
    private databaseManager: DatabaseManager,
    private initService: TenantInitService,
  ) {}

  async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
    // 1. 创建租户记录
    const tenant = await this.prisma.tenant.create({
      data: {
        name: createTenantDto.name,
        domain: createTenantDto.domain,
        isolationMode: createTenantDto.isolationMode,
        settings: createTenantDto.settings || {},
      },
    });

    // 2. 准备数据库资源
    await this.prepareDatabaseResources(tenant);

    // 3. 初始化租户数据
    await this.initService.initializeTenantData(tenant, createTenantDto.template);

    // 4. 创建管理员账号
    await this.createAdminUser(tenant, createTenantDto.adminEmail, createTenantDto.adminPassword);

    return tenant;
  }

  private async prepareDatabaseResources(tenant: Tenant): Promise<void> {
    switch (tenant.isolationMode) {
      case 'SHARED_TABLE':
        // 共享表模式不需要额外操作
        break;
      case 'SHARED_SCHEMA':
        // 创建租户独立的Schema
        await this.databaseManager.createSchema(tenant.id);
        break;
      case 'DEDICATED_DB':
        // 创建租户独立的数据库
        const connectionString = await this.databaseManager.createDatabase(tenant.name);
        // 更新租户的数据库连接字符串
        await this.prisma.tenant.update({
          where: { id: tenant.id },
          data: { databaseConnectionString: connectionString },
        });
        break;
    }
  }

  async suspend(tenantId: string): Promise<Tenant> {
    // 暂停租户
    return this.prisma.tenant.update({
      where: { id: tenantId },
      data: { isActive: false },
    });
  }

  async activate(tenantId: string): Promise<Tenant> {
    // 激活租户
    return this.prisma.tenant.update({
      where: { id: tenantId },
      data: { isActive: true },
    });
  }

  async remove(tenantId: string): Promise<void> {
    // 删除租户
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException(`租户ID ${tenantId} 不存在`);
    }

    // 清理资源
    switch (tenant.isolationMode) {
      case 'SHARED_SCHEMA':
        await this.databaseManager.dropSchema(tenant.id);
        break;
      case 'DEDICATED_DB':
        await this.databaseManager.dropDatabase(tenant.name);
        break;
    }

    // 删除租户记录
    await this.prisma.tenant.delete({
      where: { id: tenantId },
    });
  }
}
```

### 3.3 数据模型管理模块

数据模型管理模块是低代码平台的核心功能，它允许用户在不编写代码的情况下定义和管理业务数据结构。

#### 3.3.1 元数据模型设计

**实现方案**：

- 采用元数据驱动的动态实体管理，将表结构定义存储为元数据
- 支持通过API和界面管理数据模型，无需直接操作数据库
- 使用Prisma的schema扩展能力，实现动态数据模型的映射
- 实现模型版本管理，支持模型升级和结构变更

**核心数据结构**：

```typescript
// src/modules/models/entities/meta-table.entity.ts
@Entity('meta_tables')
export class MetaTable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  tableName: string;  // 表名，如 'customers'

  @Column()
  displayName: string;  // 显示名称，如 '客户'

  @Column({ nullable: true })
  description: string;  // 描述

  @Column()
  tenantId: string;  // 所属租户

  @Column({ default: '1.0.0' })
  version: string;  // 模型版本

  @Column({ default: false })
  isSystem: boolean;  // 是否系统内置模型

  @Column({ type: 'json', nullable: true })
  options: any;  // 额外选项，如审计配置、索引等

  @OneToMany(() => MetaField, field => field.table)
  fields: MetaField[];  // 字段定义

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// src/modules/models/entities/meta-field.entity.ts
@Entity('meta_fields')
export class MetaField {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tableId: string;  // 所属表ID

  @Column()
  fieldName: string;  // 字段名，如 'firstName'

  @Column()
  displayName: string;  // 显示名称，如 '名字'

  @Column()
  fieldType: string;  // 字段类型，如 'string', 'number', 'boolean'

  @Column({ nullable: true })
  length: number;  // 字段长度 (适用于string类型)

  @Column({ default: false })
  isPrimaryKey: boolean;  // 是否主键

  @Column({ default: false })
  isRequired: boolean;  // 是否必填

  @Column({ default: false })
  isUnique: boolean;  // 是否唯一

  @Column({ nullable: true })
  defaultValue: string;  // 默认值

  @Column({ type: 'json', nullable: true })
  validators: any;  // 验证规则

  @Column({ nullable: true })
  reference: string;  // 关联引用，如 'users.id'

  @Column({ nullable: true })
  referenceType: 'oneToOne' | 'oneToMany' | 'manyToOne' | 'manyToMany';  // 关联类型

  @ManyToOne(() => MetaTable, table => table.fields)
  @JoinColumn({ name: 'tableId' })
  table: MetaTable;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**模式转换服务**：

```typescript
// src/modules/models/schema-generator.service.ts
@Injectable()
export class SchemaGeneratorService {
  /**
   * 根据元数据生成Prisma Schema
   */
  async generatePrismaSchema(tables: MetaTable[]): Promise<string> {
    let schema = this.getSchemaHeader();

    // 生成模型定义
    for (const table of tables) {
      schema += this.generateModelDefinition(table);
    }

    return schema;
  }

  /**
   * 生成单个模型定义
   */
  private generateModelDefinition(table: MetaTable): string {
    let modelDef = `model ${this.pascalCase(table.tableName)} {\n`;

    // 添加字段定义
    for (const field of table.fields) {
      modelDef += `  ${this.generateFieldDefinition(field)}\n`;
    }

    // 添加租户字段 (用于多租户隔离)
    if (!table.isSystem) {
      modelDef += `  tenantId String\n`;
      modelDef += `  tenant   Tenant @relation(fields: [tenantId], references: [id])\n`;
    }

    // 添加审计字段
    modelDef += `  createdAt DateTime @default(now())\n`;
    modelDef += `  updatedAt DateTime @updatedAt\n`;

    // 添加索引和关系
    modelDef += this.generateIndexes(table);

    modelDef += `}\n\n`;
    return modelDef;
  }

  /**
   * 生成字段定义
   */
  private generateFieldDefinition(field: MetaField): string {
    let fieldDef = `${field.fieldName} ${this.mapFieldType(field)}`;

    // 添加主键定义
    if (field.isPrimaryKey) {
      fieldDef += ' @id';
      if (field.fieldType === 'string' && !field.defaultValue) {
        fieldDef += ' @default(uuid())';
      }
    }

    // 添加必填和默认值
    if (!field.isRequired) {
      fieldDef += '?';
    }

    if (field.defaultValue) {
      fieldDef += ` @default(${field.defaultValue})`;
    }

    // 添加唯一约束
    if (field.isUnique) {
      fieldDef += ' @unique';
    }

    return fieldDef;
  }

  /**
   * 将元数据字段类型映射到Prisma类型
   */
  private mapFieldType(field: MetaField): string {
    switch (field.fieldType) {
      case 'string':
        return field.length ? `String @db.VarChar(${field.length})` : 'String';
      case 'number':
        return 'Int';
      case 'decimal':
        return 'Decimal';
      case 'boolean':
        return 'Boolean';
      case 'datetime':
        return 'DateTime';
      case 'json':
        return 'Json';
      default:
        return 'String';
    }
  }

  // 其他辅助方法...
}
```

#### 3.3.2 动态实体服务

**实现方案**：

- 基于元数据模型动态生成和注册实体服务
- 使用Prisma的动态客户端创建数据访问接口
- 实现CRUD操作统一接口，支持复杂查询和关系处理
- 提供事件机制，支持业务逻辑扩展和自定义处理

**核心服务接口**：

```typescript
// src/modules/models/dynamic-entity.service.ts
@Injectable()
export class DynamicEntityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly metaTableService: MetaTableService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * 根据表名获取操作实体的Prisma客户端
   */
  async getEntityClient(tableName: string): Promise<any> {
    // 转换为Pascal命名约定，适应Prisma客户端
    const modelName = this.toPascalCase(tableName);

    // 验证模型是否存在
    if (!this.prisma[modelName]) {
      throw new NotFoundException(`模型 ${modelName} 不存在`);
    }

    return this.prisma[modelName];
  }

  /**
   * 查询实体列表
   */
  async findMany(tableName: string, options?: {
    filter?: any;
    sort?: any;
    pagination?: { page: number; pageSize: number };
    include?: any;
  }): Promise<{ data: any[]; total: number }> {
    const client = await this.getEntityClient(tableName);
    const metaTable = await this.metaTableService.findByName(tableName);

    // 构建查询参数
    const args: any = {};

    // 应用过滤条件
    if (options?.filter) {
      args.where = this.buildFilterCondition(options.filter, metaTable);
    }

    // 应用排序
    if (options?.sort) {
      args.orderBy = this.buildSortCondition(options.sort);
    }

    // 应用分页
    if (options?.pagination) {
      const { page, pageSize } = options.pagination;
      args.skip = (page - 1) * pageSize;
      args.take = pageSize;
    }

    // 应用关联加载
    if (options?.include) {
      args.include = options.include;
    }

    // 执行查询
    const [data, total] = await Promise.all([
      client.findMany(args),
      client.count({ where: args.where }),
    ]);

    // 触发事件
    await this.eventEmitter.emitAsync(`entity.${tableName}.found`, { data });

    return { data, total };
  }

  /**
   * 查询单个实体
   */
  async findOne(tableName: string, id: string, include?: any): Promise<any> {
    const client = await this.getEntityClient(tableName);

    const record = await client.findUnique({
      where: { id },
      include,
    });

    if (!record) {
      throw new NotFoundException(`在表 ${tableName} 中找不到ID为 ${id} 的记录`);
    }

    // 触发事件
    await this.eventEmitter.emitAsync(`entity.${tableName}.foundOne`, { record });

    return record;
  }

  /**
   * 创建实体
   */
  async create(tableName: string, data: any, options?: { include?: any }): Promise<any> {
    const client = await this.getEntityClient(tableName);
    const metaTable = await this.metaTableService.findByName(tableName);

    // 验证数据
    await this.validateEntityData(data, metaTable, 'create');

    // 触发前置事件
    await this.eventEmitter.emitAsync(`entity.${tableName}.beforeCreate`, { data });

    // 执行创建
    const record = await client.create({
      data,
      include: options?.include,
    });

    // 触发后置事件
    await this.eventEmitter.emitAsync(`entity.${tableName}.created`, { record });

    return record;
  }

  /**
   * 更新实体
   */
  async update(tableName: string, id: string, data: any, options?: { include?: any }): Promise<any> {
    const client = await this.getEntityClient(tableName);
    const metaTable = await this.metaTableService.findByName(tableName);

    // 验证记录是否存在
    await this.findOne(tableName, id);

    // 验证数据
    await this.validateEntityData(data, metaTable, 'update');

    // 触发前置事件
    await this.eventEmitter.emitAsync(`entity.${tableName}.beforeUpdate`, { id, data });

    // 执行更新
    const record = await client.update({
      where: { id },
      data,
      include: options?.include,
    });

    // 触发后置事件
    await this.eventEmitter.emitAsync(`entity.${tableName}.updated`, { record });

    return record;
  }

  /**
   * 删除实体
   */
  async remove(tableName: string, id: string): Promise<any> {
    const client = await this.getEntityClient(tableName);

    // 验证记录是否存在
    await this.findOne(tableName, id);

    // 触发前置事件
    await this.eventEmitter.emitAsync(`entity.${tableName}.beforeRemove`, { id });

    // 执行删除
    const record = await client.delete({
      where: { id },
    });

    // 触发后置事件
    await this.eventEmitter.emitAsync(`entity.${tableName}.removed`, { record });

    return record;
  }

  /**
   * 构建过滤条件
   */
  private buildFilterCondition(filter: any, metaTable: MetaTable): any {
    // 实现复杂查询条件构建逻辑
    // 支持 AND, OR, 等于, 不等于, 大于, 小于, 包含, 开始于, 结束于等操作
  }

  /**
   * 构建排序条件
   */
  private buildSortCondition(sort: any): any {
    // 实现排序条件构建逻辑
  }

  /**
   * 验证实体数据
   */
  private async validateEntityData(data: any, metaTable: MetaTable, operation: 'create' | 'update'): Promise<void> {
    // 实现数据验证逻辑
    // 验证必填字段、字段类型、字段长度、唯一性等
  }
}
```

### 3.4 表单管理模块

表单管理模块负责表单模板的创建、存储和渲染，以及表单数据的验证和处理。

#### 3.4.1 表单模板管理

**实现方案**：

- 使用JSON Schema定义表单结构和验证规则
- 支持表单模板的版本控制和历史记录
- 提供表单模板库，支持预设模板和复用
- 实现表单与数据模型的关联，自动生成表单模板

**核心数据结构**：

```typescript
// src/modules/forms/entities/form-template.entity.ts
@Entity('form_templates')
export class FormTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;  // 表单名称

  @Column({ nullable: true })
  description: string;  // 表单描述

  @Column({ nullable: true })
  modelId: string;  // 关联的数据模型ID

  @Column({ type: 'json' })
  schema: any;  // 表单JSON Schema

  @Column({ type: 'json', nullable: true })
  uiSchema: any;  // UI渲染配置

  @Column({ nullable: true })
  category: string;  // 表单分类

  @Column({ default: '1.0.0' })
  version: string;  // 版本号

  @Column({ default: 'draft' })
  status: 'draft' | 'published' | 'archived';  // 状态

  @Column()
  tenantId: string;  // 所属租户

  @Column({ type: 'json', nullable: true })
  settings: any;  // 额外配置

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// src/modules/forms/entities/form-submission.entity.ts
@Entity('form_submissions')
export class FormSubmission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  formTemplateId: string;  // 表单模板ID

  @Column({ nullable: true })
  recordId: string;  // 关联的数据记录ID

  @Column({ type: 'json' })
  formData: any;  // 表单数据

  @Column({ nullable: true })
  userId: string;  // 提交用户ID

  @Column()
  tenantId: string;  // 所属租户

  @Column({ type: 'json', nullable: true })
  validationErrors: any;  // 验证错误信息

  @Column({ default: 'submitted' })
  status: 'draft' | 'submitted' | 'approved' | 'rejected';  // 状态

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**表单模板服务**：

```typescript
// src/modules/forms/form-template.service.ts
@Injectable()
export class FormTemplateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly modelService: MetaTableService,
  ) {}

  /**
   * 创建表单模板
   */
  async create(createFormTemplateDto: CreateFormTemplateDto): Promise<FormTemplate> {
    // 验证Schema格式
    this.validateSchema(createFormTemplateDto.schema);

    // 创建表单模板记录
    return this.prisma.formTemplate.create({
      data: createFormTemplateDto,
    });
  }

  /**
   * 根据数据模型自动生成表单
   */
  async generateFromModel(modelId: string, options?: {
    includeFields?: string[];
    excludeFields?: string[];
    overrideUiSchema?: any;
  }): Promise<FormTemplate> {
    // 获取数据模型
    const model = await this.modelService.findOne(modelId);

    // 生成JSON Schema
    const schema = this.buildSchemaFromModel(model, options);

    // 生成UI Schema
    const uiSchema = this.buildUiSchemaFromModel(model, options);

    // 创建表单模板
    return this.create({
      name: `${model.displayName}表单`,
      description: `自动生成的${model.displayName}表单`,
      modelId: model.id,
      schema,
      uiSchema,
      tenantId: model.tenantId,
      category: 'auto-generated',
    });
  }

  /**
   * 发布表单模板
   */
  async publish(id: string): Promise<FormTemplate> {
    // 查找模板
    const template = await this.findOne(id);

    // 验证模板
    this.validateSchema(template.schema);

    // 创建新版本
    return this.prisma.formTemplate.update({
      where: { id },
      data: {
        status: 'published',
        version: this.incrementVersion(template.version),
      },
    });
  }

  /**
   * 根据数据模型构建JSON Schema
   */
  private buildSchemaFromModel(model: MetaTable, options?: any): any {
    const schema = {
      type: 'object',
      required: [],
      properties: {},
    };

    // 过滤字段
    const fieldsToInclude = model.fields.filter(field => {
      // 排除系统字段和指定排除的字段
      if (field.fieldName === 'id' || field.fieldName === 'tenantId' ||
          field.fieldName === 'createdAt' || field.fieldName === 'updatedAt') {
        return false;
      }

      // 检查是否在排除列表中
      if (options?.excludeFields?.includes(field.fieldName)) {
        return false;
      }

      // 检查是否在包含列表中
      if (options?.includeFields && !options.includeFields.includes(field.fieldName)) {
        return false;
      }

      return true;
    });

    // 添加字段定义
    for (const field of fieldsToInclude) {
      // 添加属性定义
      schema.properties[field.fieldName] = this.getSchemaPropertyForField(field);

      // 添加必填字段
      if (field.isRequired) {
        schema.required.push(field.fieldName);
      }
    }

    return schema;
  }

  /**
   * 构建字段的Schema定义
   */
  private getSchemaPropertyForField(field: MetaField): any {
    const property: any = {
      title: field.displayName,
    };

    // 根据字段类型设置属性类型
    switch (field.fieldType) {
      case 'string':
        property.type = 'string';
        if (field.length) {
          property.maxLength = field.length;
        }
        break;
      case 'number':
        property.type = 'integer';
        break;
      case 'decimal':
        property.type = 'number';
        break;
      case 'boolean':
        property.type = 'boolean';
        break;
      case 'datetime':
        property.type = 'string';
        property.format = 'date-time';
        break;
      case 'json':
        property.type = 'object';
        break;
      default:
        property.type = 'string';
    }

    // 添加验证规则
    if (field.validators) {
      Object.assign(property, field.validators);
    }

    return property;
  }

  // 其他辅助方法...
}
```

#### 3.4.2 表单提交与验证

**实现方案**：

- 使用AJV（Another JSON Schema Validator）验证表单数据
- 支持多种表单数据处理方式：直接保存、转换为实体数据、触发工作流
- 提供表单提交历史记录和数据跟踪
- 实现表单数据的导入导出功能

**核心服务接口**：

```typescript
// src/modules/forms/form-submission.service.ts
@Injectable()
export class FormSubmissionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly formTemplateService: FormTemplateService,
    private readonly dynamicEntityService: DynamicEntityService,
    private readonly workflowService: WorkflowService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * 提交表单
   */
  async submit(submitDto: SubmitFormDto): Promise<FormSubmission> {
    // 获取表单模板
    const template = await this.formTemplateService.findOne(submitDto.formTemplateId);

    // 验证表单数据
    const validationResult = await this.validateFormData(submitDto.formData, template.schema);

    if (!validationResult.valid) {
      // 保存包含验证错误的提交记录
      return this.prisma.formSubmission.create({
        data: {
          formTemplateId: template.id,
          formData: submitDto.formData,
          userId: submitDto.userId,
          tenantId: submitDto.tenantId,
          validationErrors: validationResult.errors,
          status: 'draft',
        },
      });
    }

    // 创建提交记录
    const submission = await this.prisma.formSubmission.create({
      data: {
        formTemplateId: template.id,
        formData: submitDto.formData,
        userId: submitDto.userId,
        tenantId: submitDto.tenantId,
        status: 'submitted',
      },
    });

    // 处理表单数据
    if (template.modelId) {
      // 获取关联的数据模型
      const model = await this.prisma.metaTable.findUnique({
        where: { id: template.modelId },
      });

      // 将表单数据转换为实体数据
      const entityData = this.mapFormDataToEntityData(submitDto.formData, template, model);

      try {
        // 创建或更新实体记录
        const record = submitDto.recordId
          ? await this.dynamicEntityService.update(model.tableName, submitDto.recordId, entityData)
          : await this.dynamicEntityService.create(model.tableName, entityData);

        // 更新提交记录，关联数据记录
        await this.prisma.formSubmission.update({
          where: { id: submission.id },
          data: { recordId: record.id },
        });
      } catch (error) {
        // 记录错误信息
        await this.prisma.formSubmission.update({
          where: { id: submission.id },
          data: { validationErrors: { entitySaveError: error.message } },
        });

        throw error;
      }
    }

    // 触发工作流（如果配置了表单提交工作流）
    if (template.settings?.workflowTrigger) {
      await this.workflowService.triggerWorkflow({
        workflowKey: template.settings.workflowTrigger,
        data: {
          formSubmission: submission,
          formData: submitDto.formData,
        },
        initiator: submitDto.userId,
        tenantId: submitDto.tenantId,
      });
    }

    // 触发事件
    await this.eventEmitter.emitAsync('form.submitted', { submission, template });

    return submission;
  }

  /**
   * 验证表单数据
   */
  async validateFormData(formData: any, schema: any): Promise<{ valid: boolean; errors?: any }> {
    const ajv = new Ajv({ allErrors: true });
    addFormats(ajv);

    const validate = ajv.compile(schema);
    const valid = validate(formData);

    if (!valid) {
      return {
        valid: false,
        errors: validate.errors,
      };
    }

    return { valid: true };
  }

  /**
   * 映射表单数据到实体数据
   */
  private mapFormDataToEntityData(formData: any, template: FormTemplate, model: MetaTable): any {
    // 根据表单模板配置，将表单数据映射到实体字段
    const entityData: any = {};

    // 获取字段映射配置
    const fieldMapping = template.settings?.fieldMapping || {};

    // 遍历表单数据
    for (const [key, value] of Object.entries(formData)) {
      // 获取映射的实体字段名
      const entityField = fieldMapping[key] || key;

      // 检查字段是否存在于实体中
      const fieldExists = model.fields.some(field => field.fieldName === entityField);

      if (fieldExists) {
        entityData[entityField] = value;
      }
    }

    // 添加租户ID
    entityData.tenantId = template.tenantId;

    return entityData;
  }

  /**
   * 获取表单提交历史
   */
  async getSubmissionHistory(filters: {
    formTemplateId?: string;
    userId?: string;
    recordId?: string;
    startDate?: Date;
    endDate?: Date;
    tenantId: string;
  }): Promise<FormSubmission[]> {
    // 构建查询条件
    const where: any = {
      tenantId: filters.tenantId,
    };

    if (filters.formTemplateId) {
      where.formTemplateId = filters.formTemplateId;
    }

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.recordId) {
      where.recordId = filters.recordId;
    }

    // 日期范围过滤
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};

      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }

      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    // 查询提交历史
    return this.prisma.formSubmission.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
```

### 3.5 工作流引擎模块

工作流引擎模块负责业务流程的定义、执行和监控，是实现业务自动化的核心组件。

#### 3.5.1 工作流定义

**实现方案**：

- 采用BPMN 2.0标准定义工作流模型
- 支持可视化工作流设计和JSON格式工作流定义
- 实现工作流模板版本控制和历史记录
- 支持工作流模板的导入、导出和共享

**核心数据结构**：

```typescript
// src/modules/workflows/entities/workflow-definition.entity.ts
@Entity('workflow_definitions')
export class WorkflowDefinition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;  // 工作流名称

  @Column({ nullable: true })
  description: string;  // 工作流描述

  @Column()
  key: string;  // 工作流唯一标识符，用于API调用

  @Column({ type: 'json' })
  definition: any;  // 工作流定义（BPMN或JSON格式）

  @Column({ default: '1.0.0' })
  version: string;  // 版本号

  @Column({ default: 'draft' })
  status: 'draft' | 'published' | 'deprecated';  // 状态

  @Column({ nullable: true })
  category: string;  // 分类

  @Column()
  tenantId: string;  // 所属租户

  @Column({ nullable: true })
  formId: string;  // 关联的表单ID

  @Column({ type: 'json', nullable: true })
  settings: any;  // 额外配置信息

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// src/modules/workflows/entities/workflow-instance.entity.ts
@Entity('workflow_instances')
export class WorkflowInstance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  definitionId: string;  // 工作流定义ID

  @Column()
  businessKey: string;  // 业务键，关联业务数据

  @Column({ type: 'json' })
  variables: any;  // 工作流变量

  @Column({ default: 'running' })
  status: 'running' | 'completed' | 'terminated' | 'suspended';  // 状态

  @Column({ nullable: true })
  startedBy: string;  // 发起人ID

  @Column()
  tenantId: string;  // 所属租户

  @Column({ type: 'json', nullable: true })
  currentTasks: any;  // 当前任务信息

  @CreateDateColumn()
  startedAt: Date;  // 开始时间

  @Column({ nullable: true })
  endedAt: Date;  // 结束时间

  @UpdateDateColumn()
  updatedAt: Date;
}

// src/modules/workflows/entities/workflow-task.entity.ts
@Entity('workflow_tasks')
export class WorkflowTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  instanceId: string;  // 工作流实例ID

  @Column()
  nodeId: string;  // 节点ID

  @Column()
  nodeName: string;  // 节点名称

  @Column()
  taskType: 'user' | 'service' | 'script' | 'timer' | 'message';  // 任务类型

  @Column({ type: 'json', nullable: true })
  assignees: string[];  // 处理人列表（用户任务）

  @Column({ nullable: true })
  formId: string;  // 关联的表单ID

  @Column({ type: 'json' })
  data: any;  // 任务数据

  @Column({ default: 'created' })
  status: 'created' | 'assigned' | 'completed' | 'cancelled' | 'failed';  // 状态

  @Column({ nullable: true })
  completedBy: string;  // 完成人ID

  @Column({ nullable: true })
  result: string;  // 处理结果

  @Column()
  tenantId: string;  // 所属租户

  @CreateDateColumn()
  createdAt: Date;  // 创建时间

  @Column({ nullable: true })
  completedAt: Date;  // 完成时间

  @Column({ nullable: true })
  dueDate: Date;  // 截止时间
}
```

**工作流定义服务**：

```typescript
// src/modules/workflows/workflow-definition.service.ts
@Injectable()
export class WorkflowDefinitionService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * 创建工作流定义
   */
  async create(createWorkflowDto: CreateWorkflowDto): Promise<WorkflowDefinition> {
    // 验证工作流定义格式
    this.validateWorkflowDefinition(createWorkflowDto.definition);

    // 生成唯一的工作流键
    const key = createWorkflowDto.key || this.generateWorkflowKey(createWorkflowDto.name);

    // 检查键是否唯一
    const existingWorkflow = await this.prisma.workflowDefinition.findFirst({
      where: {
        key,
        tenantId: createWorkflowDto.tenantId,
      },
    });

    if (existingWorkflow) {
      throw new ConflictException(`工作流键 '${key}' 已存在`);
    }

    // 创建工作流定义
    return this.prisma.workflowDefinition.create({
      data: {
        ...createWorkflowDto,
        key,
      },
    });
  }

  /**
   * 发布工作流定义
   */
  async publish(id: string): Promise<WorkflowDefinition> {
    // 查找工作流定义
    const workflow = await this.findOne(id);

    // 验证工作流定义
    this.validateWorkflowDefinition(workflow.definition);

    // 更新状态为已发布并增加版本号
    return this.prisma.workflowDefinition.update({
      where: { id },
      data: {
        status: 'published',
        version: this.incrementVersion(workflow.version),
      },
    });
  }

  /**
   * 更新工作流定义
   */
  async update(id: string, updateWorkflowDto: UpdateWorkflowDto): Promise<WorkflowDefinition> {
    // 查找工作流定义
    await this.findOne(id);

    // 验证工作流定义格式
    if (updateWorkflowDto.definition) {
      this.validateWorkflowDefinition(updateWorkflowDto.definition);
    }

    // 更新工作流定义
    return this.prisma.workflowDefinition.update({
      where: { id },
      data: updateWorkflowDto,
    });
  }

  /**
   * 根据键获取最新版本的工作流定义
   */
  async findByKey(key: string, tenantId: string): Promise<WorkflowDefinition> {
    const workflow = await this.prisma.workflowDefinition.findFirst({
      where: {
        key,
        tenantId,
        status: 'published',
      },
      orderBy: {
        version: 'desc',
      },
    });

    if (!workflow) {
      throw new NotFoundException(`未找到键为 '${key}' 的已发布工作流定义`);
    }

    return workflow;
  }

  /**
   * 验证工作流定义
   */
  private validateWorkflowDefinition(definition: any): void {
    // 检查必要的节点和连接
    if (!definition.nodes || !Array.isArray(definition.nodes) || definition.nodes.length === 0) {
      throw new BadRequestException('工作流定义必须包含至少一个节点');
    }

    // 检查是否有开始节点和结束节点
    const hasStartNode = definition.nodes.some(node => node.type === 'start');
    const hasEndNode = definition.nodes.some(node => node.type === 'end');

    if (!hasStartNode) {
      throw new BadRequestException('工作流定义必须包含开始节点');
    }

    if (!hasEndNode) {
      throw new BadRequestException('工作流定义必须包含结束节点');
    }

    // 其他验证逻辑...
  }

  /**
   * 生成工作流唯一键
   */
  private generateWorkflowKey(name: string): string {
    // 将名称转换为小写，并替换空格和特殊字符
    const baseKey = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    // 添加时间戳确保唯一性
    return `${baseKey}-${Date.now()}`;
  }

  /**
   * 增加版本号
   */
  private incrementVersion(version: string): string {
    const parts = version.split('.');
    const lastPart = parseInt(parts[parts.length - 1], 10) + 1;
    parts[parts.length - 1] = lastPart.toString();
    return parts.join('.');
  }
}
```

#### 3.5.2 工作流执行引擎

**实现方案**：

- 基于状态机和事件驱动的工作流执行引擎
- 使用Redis实现分布式锁和工作流状态存储
- 支持多种节点类型：用户任务、服务任务、脚本任务、定时器、消息等
- 提供工作流历史记录和活动监控

**核心服务接口**：

```typescript
// src/modules/workflows/workflow-engine.service.ts
@Injectable()
export class WorkflowEngineService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workflowDefinitionService: WorkflowDefinitionService,
    private readonly redisService: RedisService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * 启动工作流实例
   */
  async startWorkflow(startDto: StartWorkflowDto): Promise<WorkflowInstance> {
    // 获取工作流定义
    const definition = await this.workflowDefinitionService.findByKey(
      startDto.workflowKey,
      startDto.tenantId,
    );

    // 创建工作流实例
    const instance = await this.prisma.workflowInstance.create({
      data: {
        definitionId: definition.id,
        businessKey: startDto.businessKey,
        variables: startDto.variables || {},
        startedBy: startDto.startedBy,
        tenantId: startDto.tenantId,
        status: 'running',
      },
    });

    // 获取开始节点
    const startNode = definition.definition.nodes.find(node => node.type === 'start');

    // 执行开始节点
    await this.executeNode(instance, startNode);

    // 触发工作流启动事件
    await this.eventEmitter.emitAsync('workflow.started', { instance, definition });

    return instance;
  }

  /**
   * 执行节点
   */
  private async executeNode(instance: WorkflowInstance, node: any): Promise<void> {
    // 根据节点类型执行不同逻辑
    switch (node.type) {
      case 'start':
        await this.executeStartNode(instance, node);
        break;
      case 'end':
        await this.executeEndNode(instance, node);
        break;
      case 'userTask':
        await this.executeUserTaskNode(instance, node);
        break;
      case 'serviceTask':
        await this.executeServiceTaskNode(instance, node);
        break;
      case 'scriptTask':
        await this.executeScriptTaskNode(instance, node);
        break;
      case 'timer':
        await this.executeTimerNode(instance, node);
        break;
      case 'gateway':
        await this.executeGatewayNode(instance, node);
        break;
      default:
        throw new Error(`不支持的节点类型: ${node.type}`);
    }
  }

  /**
   * 执行开始节点
   */
  private async executeStartNode(instance: WorkflowInstance, node: any): Promise<void> {
    // 更新实例状态
    await this.updateInstanceState(instance.id, {
      currentNode: node.id,
    });

    // 查找下一个节点
    const nextNode = this.findNextNode(instance, node);

    if (nextNode) {
      await this.executeNode(instance, nextNode);
    }
  }

  /**
   * 执行用户任务节点
   */
  private async executeUserTaskNode(instance: WorkflowInstance, node: any): Promise<void> {
    // 获取处理人
    const assignees = await this.resolveAssignees(instance, node);

    // 创建用户任务
    const task = await this.prisma.workflowTask.create({
      data: {
        instanceId: instance.id,
        nodeId: node.id,
        nodeName: node.name,
        taskType: 'user',
        assignees,
        formId: node.properties?.formId,
        data: {
          ...node.properties,
          variables: instance.variables,
        },
        status: 'created',
        tenantId: instance.tenantId,
      },
    });

    // 更新实例状态
    await this.updateInstanceState(instance.id, {
      currentNode: node.id,
      currentTasks: [...(instance.currentTasks || []), task.id],
    });

    // 触发任务创建事件
    await this.eventEmitter.emitAsync('workflow.task.created', { task, instance });
  }

  /**
   * 完成用户任务
   */
  async completeUserTask(completeTaskDto: CompleteTaskDto): Promise<void> {
    // 获取任务
    const task = await this.prisma.workflowTask.findUnique({
      where: { id: completeTaskDto.taskId },
    });

    if (!task) {
      throw new NotFoundException(`未找到任务ID: ${completeTaskDto.taskId}`);
    }

    // 检查任务状态
    if (task.status !== 'created' && task.status !== 'assigned') {
      throw new BadRequestException(`任务已${task.status === 'completed' ? '完成' : '取消或失败'}`);
    }

    // 获取工作流实例
    const instance = await this.prisma.workflowInstance.findUnique({
      where: { id: task.instanceId },
    });

    // 获取工作流定义
    const definition = await this.prisma.workflowDefinition.findUnique({
      where: { id: instance.definitionId },
    });

    // 更新任务状态
    await this.prisma.workflowTask.update({
      where: { id: task.id },
      data: {
        status: 'completed',
        completedBy: completeTaskDto.userId,
        completedAt: new Date(),
        result: completeTaskDto.result,
      },
    });

    // 更新工作流实例变量
    if (completeTaskDto.variables) {
      await this.updateInstanceVariables(instance.id, completeTaskDto.variables);
      instance.variables = { ...instance.variables, ...completeTaskDto.variables };
    }

    // 更新实例状态，移除已完成的任务
    const currentTasks = instance.currentTasks.filter(id => id !== task.id);
    await this.updateInstanceState(instance.id, { currentTasks });

    // 获取当前节点
    const currentNode = definition.definition.nodes.find(n => n.id === task.nodeId);

    // 查找下一个节点
    const nextNode = this.findNextNode(instance, currentNode, completeTaskDto.result);

    if (nextNode) {
      // 执行下一个节点
      await this.executeNode({ ...instance, currentTasks }, nextNode);
    } else if (currentTasks.length === 0) {
      // 如果没有下一个节点且没有活动任务，则结束工作流
      await this.completeWorkflowInstance(instance.id);
    }

    // 触发任务完成事件
    await this.eventEmitter.emitAsync('workflow.task.completed', {
      task,
      instance,
      definition,
      result: completeTaskDto.result,
    });
  }

  /**
   * 更新工作流实例状态
   */
  private async updateInstanceState(instanceId: string, state: any): Promise<void> {
    await this.prisma.workflowInstance.update({
      where: { id: instanceId },
      data: state,
    });
  }

  /**
   * 更新工作流实例变量
   */
  private async updateInstanceVariables(instanceId: string, variables: any): Promise<void> {
    // 获取当前实例
    const instance = await this.prisma.workflowInstance.findUnique({
      where: { id: instanceId },
      select: { variables: true },
    });

    // 合并变量
    const updatedVariables = { ...instance.variables, ...variables };

    // 更新实例
    await this.prisma.workflowInstance.update({
      where: { id: instanceId },
      data: { variables: updatedVariables },
    });
  }

  /**
   * 完成工作流实例
   */
  private async completeWorkflowInstance(instanceId: string): Promise<void> {
    await this.prisma.workflowInstance.update({
      where: { id: instanceId },
      data: {
        status: 'completed',
        endedAt: new Date(),
      },
    });

    // 触发工作流完成事件
    const instance = await this.prisma.workflowInstance.findUnique({
      where: { id: instanceId },
    });

    await this.eventEmitter.emitAsync('workflow.completed', { instance });
  }

  /**
   * 查找下一个节点
   */
  private findNextNode(instance: WorkflowInstance, currentNode: any, result?: string): any {
    // 获取工作流定义
    const definition = instance.definitionId;

    // 根据连线和条件找到下一个节点
    // 实现节点跳转逻辑，支持条件表达式解析
    // ...

    return nextNode;
  }

  /**
   * 解析任务处理人
   */
  private async resolveAssignees(instance: WorkflowInstance, node: any): Promise<string[]> {
    const assigneeConfig = node.properties?.assignee;

    if (!assigneeConfig) {
      return [];
    }

    // 静态指定的用户ID
    if (assigneeConfig.type === 'static' && assigneeConfig.value) {
      return Array.isArray(assigneeConfig.value)
        ? assigneeConfig.value
        : [assigneeConfig.value];
    }

    // 通过角色指定
    if (assigneeConfig.type === 'role' && assigneeConfig.value) {
      // 查询角色下的用户
      const users = await this.prisma.user.findMany({
        where: {
          roles: {
            some: {
              id: assigneeConfig.value,
            },
          },
          tenantId: instance.tenantId,
        },
        select: { id: true },
      });

      return users.map(user => user.id);
    }

    // 动态表达式
    if (assigneeConfig.type === 'expression' && assigneeConfig.value) {
      // 解析表达式获取用户ID
      // 支持从实例变量中获取，如 ${initiator} 或 ${manager}
      // ...
    }

    return [];
  }
}
```

#### 3.5.3 工作流监控与管理

**实现方案**：

- 提供工作流实例和任务的状态查询接口
- 支持工作流实例的手动干预（暂停、恢复、终止）
- 实现工作流统计分析功能
- 提供工作流历史记录和审计日志

**核心服务接口**：

```typescript
// src/modules/workflows/workflow-monitor.service.ts
@Injectable()
export class WorkflowMonitorService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * 获取工作流实例列表
   */
  async getInstances(filters: {
    definitionId?: string;
    businessKey?: string;
    status?: string;
    startedBy?: string;
    startedAfter?: Date;
    startedBefore?: Date;
    tenantId: string;
  }, pagination?: { page: number; pageSize: number }): Promise<{ data: WorkflowInstance[]; total: number }> {
    // 构建查询条件
    const where: any = {
      tenantId: filters.tenantId,
    };

    if (filters.definitionId) {
      where.definitionId = filters.definitionId;
    }

    if (filters.businessKey) {
      where.businessKey = filters.businessKey;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.startedBy) {
      where.startedBy = filters.startedBy;
    }

    // 日期范围过滤
    if (filters.startedAfter || filters.startedBefore) {
      where.startedAt = {};

      if (filters.startedAfter) {
        where.startedAt.gte = filters.startedAfter;
      }

      if (filters.startedBefore) {
        where.startedAt.lte = filters.startedBefore;
      }
    }

    // 分页参数
    const skip = pagination ? (pagination.page - 1) * pagination.pageSize : undefined;
    const take = pagination ? pagination.pageSize : undefined;

    // 执行查询
    const [data, total] = await Promise.all([
      this.prisma.workflowInstance.findMany({
        where,
        orderBy: { startedAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.workflowInstance.count({ where }),
    ]);

    return { data, total };
  }

  /**
   * 获取任务列表
   */
  async getTasks(filters: {
    instanceId?: string;
    nodeId?: string;
    taskType?: string;
    status?: string;
    assignee?: string;
    tenantId: string;
  }, pagination?: { page: number; pageSize: number }): Promise<{ data: WorkflowTask[]; total: number }> {
    // 构建查询条件
    const where: any = {
      tenantId: filters.tenantId,
    };

    if (filters.instanceId) {
      where.instanceId = filters.instanceId;
    }

    if (filters.nodeId) {
      where.nodeId = filters.nodeId;
    }

    if (filters.taskType) {
      where.taskType = filters.taskType;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.assignee) {
      where.assignees = {
        has: filters.assignee,
      };
    }

    // 分页参数
    const skip = pagination ? (pagination.page - 1) * pagination.pageSize : undefined;
    const take = pagination ? pagination.pageSize : undefined;

    // 执行查询
    const [data, total] = await Promise.all([
      this.prisma.workflowTask.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.workflowTask.count({ where }),
    ]);

    return { data, total };
  }

  /**
   * 获取用户待办任务
   */
  async getUserTasks(userId: string, tenantId: string, status: string[] = ['created', 'assigned']): Promise<WorkflowTask[]> {
    return this.prisma.workflowTask.findMany({
      where: {
        assignees: {
          has: userId,
        },
        status: {
          in: status,
        },
        tenantId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * 暂停工作流实例
   */
  async suspendWorkflow(instanceId: string): Promise<WorkflowInstance> {
    return this.prisma.workflowInstance.update({
      where: { id: instanceId },
      data: { status: 'suspended' },
    });
  }

  /**
   * 恢复工作流实例
   */
  async resumeWorkflow(instanceId: string): Promise<WorkflowInstance> {
    return this.prisma.workflowInstance.update({
      where: { id: instanceId },
      data: { status: 'running' },
    });
  }

  /**
   * 终止工作流实例
   */
  async terminateWorkflow(instanceId: string, reason: string): Promise<WorkflowInstance> {
    // 更新实例状态
    const instance = await this.prisma.workflowInstance.update({
      where: { id: instanceId },
      data: {
        status: 'terminated',
        endedAt: new Date(),
        variables: {
          ...instance.variables,
          terminationReason: reason,
        },
      },
    });

    // 取消所有未完成的任务
    await this.prisma.workflowTask.updateMany({
      where: {
        instanceId,
        status: {
          in: ['created', 'assigned'],
        },
      },
      data: {
        status: 'cancelled',
      },
    });

    return instance;
  }
}
```

### 3.6 API生成模块

API生成模块负责根据元数据模型自动生成REST API接口，实现低代码平台的核心动态能力。

#### 3.6.1 动态API设计

**实现方案**：

- 基于Nest.js的动态模块和控制器系统
- 根据元数据定义动态创建REST API端点
- 支持标准CRUD操作和自定义业务逻辑
- 实现API版本控制和权限管理

**核心服务接口**：

```typescript
// src/modules/api-generator/api-generator.service.ts
@Injectable()
export class ApiGeneratorService {
  constructor(
    private readonly metaTableService: MetaTableService,
    private readonly moduleRef: ModuleRef,
  ) {}

  /**
   * 为所有元数据表生成API接口
   */
  async generateApis(tenantId: string): Promise<void> {
    // 获取所有元数据表
    const tables = await this.metaTableService.findAll(tenantId);

    // 为每个表生成API
    for (const table of tables) {
      await this.generateApiForTable(table);
    }
  }

  /**
   * 为指定元数据表生成API接口
   */
  async generateApiForTable(table: MetaTable): Promise<void> {
    // 生成API配置
    const apiConfig = this.createApiConfig(table);

    // 注册动态控制器
    this.registerDynamicController(table, apiConfig);

    // 更新API路由记录
    await this.updateApiRouteRecord(table, apiConfig);
  }

  /**
   * 创建API配置
   */
  private createApiConfig(table: MetaTable): ApiConfig {
    // 生成API路径、方法和操作
    const basePath = `/${table.tableName.toLowerCase()}`;

    // 默认CRUD操作配置
    const operations = [
      {
        path: '',
        method: 'GET',
        operation: 'list',
        description: `获取${table.displayName}列表`,
      },
      {
        path: '/:id',
        method: 'GET',
        operation: 'findOne',
        description: `获取单个${table.displayName}`,
      },
      {
        path: '',
        method: 'POST',
        operation: 'create',
        description: `创建新的${table.displayName}`,
      },
      {
        path: '/:id',
        method: 'PUT',
        operation: 'update',
        description: `更新${table.displayName}`,
      },
      {
        path: '/:id',
        method: 'DELETE',
        operation: 'remove',
        description: `删除${table.displayName}`,
      },
    ];

    // 添加自定义操作
    if (table.customOperations) {
      operations.push(...table.customOperations);
    }

    return {
      basePath,
      tableName: table.tableName,
      displayName: table.displayName,
      operations,
      permissions: this.generateDefaultPermissions(table),
    };
  }

  /**
   * 生成默认权限配置
   */
  private generateDefaultPermissions(table: MetaTable): any {
    return {
      list: [`${table.tableName}:read`],
      findOne: [`${table.tableName}:read`],
      create: [`${table.tableName}:create`],
      update: [`${table.tableName}:update`],
      remove: [`${table.tableName}:delete`],
    };
  }

  /**
   * 注册动态控制器
   */
  private registerDynamicController(table: MetaTable, apiConfig: ApiConfig): void {
    // 创建动态控制器类
    const DynamicController = this.createDynamicControllerClass(table, apiConfig);

    // 注册到Nest.js模块系统
    // 这里使用了高级的Nest.js动态模块注册技术
    // 实际实现可能需要依赖Nest.js的内部API
  }

  /**
   * 创建动态控制器类
   */
  private createDynamicControllerClass(table: MetaTable, apiConfig: ApiConfig): any {
    // 使用装饰器元编程创建控制器类
    // 这是一个简化的示例，实际实现会更复杂

    @Controller(apiConfig.basePath)
    class GeneratedController {
      constructor(
        private readonly dynamicEntityService: DynamicEntityService,
        private readonly abilityFactory: AbilityFactory,
      ) {}

      @Get()
      @UseGuards(JwtAuthGuard, AbilityGuard)
      @CheckPermissions((ability: AppAbility) => ability.can('read', apiConfig.tableName))
      async findAll(@Query() query: any, @Req() req: any): Promise<any> {
        // 解析查询参数
        const { page, limit, sort, filter, ...rest } = query;

        // 构建查询条件
        const where = this.buildWhereClause(rest, filter);

        // 调用动态实体服务
        return this.dynamicEntityService.findAll(
          apiConfig.tableName,
          req.user.tenantId,
          {
            where,
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 10,
            sort: sort || undefined,
          },
        );
      }

      @Get(':id')
      @UseGuards(JwtAuthGuard, AbilityGuard)
      @CheckPermissions((ability: AppAbility) => ability.can('read', apiConfig.tableName))
      async findOne(@Param('id') id: string, @Req() req: any): Promise<any> {
        return this.dynamicEntityService.findOne(
          apiConfig.tableName,
          id,
          req.user.tenantId,
        );
      }

      @Post()
      @UseGuards(JwtAuthGuard, AbilityGuard)
      @CheckPermissions((ability: AppAbility) => ability.can('create', apiConfig.tableName))
      async create(@Body() data: any, @Req() req: any): Promise<any> {
        return this.dynamicEntityService.create(
          apiConfig.tableName,
          data,
          req.user.tenantId,
        );
      }

      @Put(':id')
      @UseGuards(JwtAuthGuard, AbilityGuard)
      @CheckPermissions((ability: AppAbility) => ability.can('update', apiConfig.tableName))
      async update(@Param('id') id: string, @Body() data: any, @Req() req: any): Promise<any> {
        return this.dynamicEntityService.update(
          apiConfig.tableName,
          id,
          data,
          req.user.tenantId,
        );
      }

      @Delete(':id')
      @UseGuards(JwtAuthGuard, AbilityGuard)
      @CheckPermissions((ability: AppAbility) => ability.can('delete', apiConfig.tableName))
      async remove(@Param('id') id: string, @Req() req: any): Promise<any> {
        return this.dynamicEntityService.remove(
          apiConfig.tableName,
          id,
          req.user.tenantId,
        );
      }

      /**
       * 构建查询条件
       */
      private buildWhereClause(params: any, filterString?: string): any {
        let where: any = {};

        // 处理简单查询参数
        for (const [key, value] of Object.entries(params)) {
          where[key] = value;
        }

        // 处理高级过滤条件
        if (filterString) {
          try {
            const filter = JSON.parse(filterString);
            where = {
              ...where,
              ...this.parseAdvancedFilter(filter),
            };
          } catch (error) {
            // 忽略无效的过滤条件
          }
        }

        return where;
      }

      /**
       * 解析高级过滤条件
       */
      private parseAdvancedFilter(filter: any): any {
        // 实现复杂查询条件的转换逻辑
        // 支持逻辑操作符和比较操作符
        // 例如：{ name: { $contains: 'test' }, age: { $gt: 18 } }
        return filter;
      }
    }

    return GeneratedController;
  }

  /**
   * 更新API路由记录
   */
  private async updateApiRouteRecord(table: MetaTable, apiConfig: ApiConfig): Promise<void> {
    // 记录生成的API路由信息到数据库
    // 这对于API文档生成和权限管理很有用
    // ...
  }
}
```

#### 3.6.2 API文档生成

**实现方案**：

- 使用Swagger/OpenAPI标准自动生成API文档
- 根据元数据模型自动生成请求和响应模型
- 支持API分组和权限标记
- 提供文档版本控制和导出功能

**核心服务实现**：

```typescript
// src/modules/api-generator/api-docs.service.ts
@Injectable()
export class ApiDocsService {
  constructor(
    private readonly metaTableService: MetaTableService,
    private readonly apiGeneratorService: ApiGeneratorService,
  ) {}

  /**
   * 生成OpenAPI文档
   */
  async generateOpenApiDocs(tenantId: string): Promise<any> {
    // 获取所有元数据表
    const tables = await this.metaTableService.findAll(tenantId);

    // 创建OpenAPI文档基础结构
    const openApiDoc = {
      openapi: '3.0.0',
      info: {
        title: 'LowCodeX 动态API',
        description: '低代码平台自动生成的API接口文档',
        version: '1.0.0',
      },
      servers: [
        {
          url: '/api/v1',
          description: 'API服务器',
        },
      ],
      paths: {},
      components: {
        schemas: {},
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    };

    // 为每个表生成路径和模型定义
    for (const table of tables) {
      this.generatePathsForTable(openApiDoc, table);
      this.generateSchemaForTable(openApiDoc, table);
    }

    return openApiDoc;
  }

  /**
   * 为表生成API路径
   */
  private generatePathsForTable(openApiDoc: any, table: MetaTable): void {
    const basePath = `/${table.tableName.toLowerCase()}`;

    // 列表接口
    openApiDoc.paths[basePath] = {
      get: {
        summary: `获取${table.displayName}列表`,
        description: `分页获取${table.displayName}列表数据`,
        tags: [table.displayName],
        parameters: [
          {
            name: 'page',
            in: 'query',
            description: '页码',
            schema: { type: 'integer', default: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            description: '每页数量',
            schema: { type: 'integer', default: 10 },
          },
          {
            name: 'sort',
            in: 'query',
            description: '排序字段，格式为：字段名:asc|desc',
            schema: { type: 'string' },
          },
          {
            name: 'filter',
            in: 'query',
            description: '高级过滤条件，JSON格式',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: '成功',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: {
                        $ref: `#/components/schemas/${table.tableName}`,
                      },
                    },
                    meta: {
                      type: 'object',
                      properties: {
                        page: { type: 'integer' },
                        limit: { type: 'integer' },
                        total: { type: 'integer' },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: '未授权',
          },
          '403': {
            description: '无权访问',
          },
        },
        security: [{ bearerAuth: [] }],
      },
      post: {
        summary: `创建${table.displayName}`,
        description: `创建新的${table.displayName}记录`,
        tags: [table.displayName],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: `#/components/schemas/${table.tableName}Input`,
              },
            },
          },
        },
        responses: {
          '201': {
            description: '创建成功',
            content: {
              'application/json': {
                schema: {
                  $ref: `#/components/schemas/${table.tableName}`,
                },
              },
            },
          },
          '400': {
            description: '参数错误',
          },
          '401': {
            description: '未授权',
          },
          '403': {
            description: '无权访问',
          },
        },
        security: [{ bearerAuth: [] }],
      },
    };

    // 单个资源接口
    openApiDoc.paths[`${basePath}/{id}`] = {
      get: {
        summary: `获取单个${table.displayName}`,
        description: `根据ID获取${table.displayName}详情`,
        tags: [table.displayName],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: '记录ID',
          },
        ],
        responses: {
          '200': {
            description: '成功',
            content: {
              'application/json': {
                schema: {
                  $ref: `#/components/schemas/${table.tableName}`,
                },
              },
            },
          },
          '404': {
            description: '记录不存在',
          },
          '401': {
            description: '未授权',
          },
          '403': {
            description: '无权访问',
          },
        },
        security: [{ bearerAuth: [] }],
      },
      put: {
        summary: `更新${table.displayName}`,
        description: `更新${table.displayName}记录`,
        tags: [table.displayName],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: '记录ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: `#/components/schemas/${table.tableName}Input`,
              },
            },
          },
        },
        responses: {
          '200': {
            description: '更新成功',
            content: {
              'application/json': {
                schema: {
                  $ref: `#/components/schemas/${table.tableName}`,
                },
              },
            },
          },
          '400': {
            description: '参数错误',
          },
          '404': {
            description: '记录不存在',
          },
          '401': {
            description: '未授权',
          },
          '403': {
            description: '无权访问',
          },
        },
        security: [{ bearerAuth: [] }],
      },
      delete: {
        summary: `删除${table.displayName}`,
        description: `删除${table.displayName}记录`,
        tags: [table.displayName],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: '记录ID',
          },
        ],
        responses: {
          '200': {
            description: '删除成功',
          },
          '404': {
            description: '记录不存在',
          },
          '401': {
            description: '未授权',
          },
          '403': {
            description: '无权访问',
          },
        },
        security: [{ bearerAuth: [] }],
      },
    };

    // 添加自定义操作
    if (table.customOperations) {
      for (const op of table.customOperations) {
        // 实现自定义操作的OpenAPI文档生成
        // ...
      }
    }
  }

  /**
   * 为表生成数据模型
   */
  private generateSchemaForTable(openApiDoc: any, table: MetaTable): void {
    // 创建输出模型
    const schema = {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: '唯一标识符',
        },
      },
      required: ['id'],
    };

    // 创建输入模型（不包含id，因为创建时不需要提供id）
    const inputSchema = {
      type: 'object',
      properties: {},
      required: [],
    };

    // 添加字段定义
    for (const field of table.fields) {
      schema.properties[field.fieldName] = this.getSchemaTypeForField(field);

      // 如果是必填字段，添加到required数组
      if (field.required) {
        schema.required.push(field.fieldName);
      }

      // 对于非主键字段，添加到输入模型
      if (!field.isPrimaryKey) {
        inputSchema.properties[field.fieldName] = this.getSchemaTypeForField(field);

        if (field.required) {
          inputSchema.required.push(field.fieldName);
        }
      }
    }

    // 添加审计字段
    schema.properties.createdAt = {
      type: 'string',
      format: 'date-time',
      description: '创建时间',
    };

    schema.properties.updatedAt = {
      type: 'string',
      format: 'date-time',
      description: '更新时间',
    };

    // 保存模型定义
    openApiDoc.components.schemas[table.tableName] = schema;
    openApiDoc.components.schemas[`${table.tableName}Input`] = inputSchema;
  }

  /**
   * 根据字段类型获取OpenAPI类型定义
   */
  private getSchemaTypeForField(field: MetaField): any {
    switch (field.fieldType) {
      case 'string':
        return {
          type: 'string',
          description: field.displayName,
          maxLength: field.length,
        };
      case 'number':
        return {
          type: 'integer',
          description: field.displayName,
        };
      case 'decimal':
        return {
          type: 'number',
          description: field.displayName,
        };
      case 'boolean':
        return {
          type: 'boolean',
          description: field.displayName,
        };
      case 'datetime':
        return {
          type: 'string',
          format: 'date-time',
          description: field.displayName,
        };
      case 'json':
        return {
          type: 'object',
          description: field.displayName,
        };
      default:
        return {
          type: 'string',
          description: field.displayName,
        };
    }
  }
}
```

### 3.7 权限系统模块

权限系统模块实现了基于角色的访问控制(RBAC)和基于属性的访问控制(ABAC)的混合模式，为低代码平台提供细粒度的权限管理能力。

#### 3.7.1 权限模型设计

**实现方案**：

- 基于CASL库实现权限规则定义和验证
- 支持角色、资源、操作和条件的组合授权
- 实现动态权限规则和上下文感知的权限判断
- 支持租户隔离和资源所有者权限

**核心数据结构**：

```typescript
// src/modules/permissions/entities/role.entity.ts
@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;  // 角色名称

  @Column({ nullable: true })
  description: string;  // 角色描述

  @Column()
  tenantId: string;  // 所属租户

  @Column({ default: false })
  isSystem: boolean;  // 是否系统角色

  @Column({ default: false })
  isDefault: boolean;  // 是否默认角色

  @Column({ type: 'json', default: [] })
  permissions: Permission[];  // 权限列表

  @ManyToMany(() => User, user => user.roles)
  users: User[];  // 拥有此角色的用户
}

// src/modules/permissions/types/permission.type.ts
export interface Permission {
  action: string;  // 操作，如 'read', 'create', 'update', 'delete', 'manage'
  subject: string;  // 资源类型，如 'user', 'role', 'form', 'workflow'等
  conditions?: any;  // 条件，如 { ownerId: '${user.id}' }
  fields?: string[];  // 允许的字段，用于字段级权限
  reason?: string;  // 权限说明
}
```

**权限服务实现**：

```typescript
// src/modules/permissions/ability.factory.ts
@Injectable()
export class AbilityFactory {
  constructor(
    private readonly roleService: RoleService,
  ) {}

  /**
   * 创建用户权限对象
   */
  async createForUser(user: User): Promise<AppAbility> {
    // 加载用户角色
    const roles = user.roles ? user.roles : await this.roleService.findUserRoles(user.id);

    // 收集所有权限
    const permissions: Permission[] = [];
    for (const role of roles) {
      permissions.push(...role.permissions);
    }

    // 添加系统默认权限
    permissions.push(
      { action: 'read', subject: 'profile', conditions: { id: user.id } },
      { action: 'update', subject: 'profile', conditions: { id: user.id } },
    );

    // 为超级管理员添加所有权限
    if (user.isAdmin) {
      permissions.push({ action: 'manage', subject: 'all' });
    }

    // 创建Ability实例
    return this.createAbility(permissions, user);
  }

  /**
   * 根据权限规则创建Ability实例
   */
  private createAbility(permissions: Permission[], user: User): AppAbility {
    // 解析权限条件中的变量
    const parsedPermissions = permissions.map(permission => ({
      ...permission,
      conditions: permission.conditions ? this.parseConditions(permission.conditions, user) : undefined,
    }));

    // 创建Ability实例
    return new AbilityBuilder<AppAbility>(createMongoAbility)
      .can(parsedPermissions)
      .build();
  }

  /**
   * 解析条件中的变量
   * 支持类似 { ownerId: '${user.id}' } 的表达式
   */
  private parseConditions(conditions: any, user: User): any {
    const result = {};

    for (const [key, value] of Object.entries(conditions)) {
      if (typeof value === 'string' && value.includes('${')) {
        // 解析表达式
        const matches = value.match(/\${([^}]+)}/g);
        if (matches) {
          let parsedValue = value;
          for (const match of matches) {
            const path = match.substring(2, match.length - 1);
            const replacement = this.getValueByPath(user, path);
            parsedValue = parsedValue.replace(match, replacement);
          }
          result[key] = parsedValue;
        } else {
          result[key] = value;
        }
      } else if (typeof value === 'object' && value !== null) {
        result[key] = this.parseConditions(value, user);
      } else {
        result[key] = value;
      }
    }

    return result;
  }

  /**
   * 根据路径获取对象属性值
   */
  private getValueByPath(obj: any, path: string): any {
    return path.split('.').reduce((o, p) => (o ? o[p] : undefined), obj);
  }
}

// src/modules/permissions/guards/ability.guard.ts
@Injectable()
export class AbilityGuard implements CanActivate {
  constructor(
    private readonly abilityFactory: AbilityFactory,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 获取所需权限检查函数
    const checkPermission = this.reflector.get<PermissionCheck>(
      CHECK_PERMISSIONS_KEY,
      context.getHandler(),
    );

    // 如果没有定义权限检查，则允许访问
    if (!checkPermission) {
      return true;
    }

    // 获取请求和用户信息
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // 如果用户未登录，拒绝访问
    if (!user) {
      throw new UnauthorizedException('请先登录');
    }

    // 创建用户权限对象
    const ability = await this.abilityFactory.createForUser(user);

    // 执行权限检查
    try {
      const result = checkPermission(ability);

      // 如果返回的是Promise，等待结果
      if (result instanceof Promise) {
        return await result;
      }

      return result;
    } catch (error) {
      throw new ForbiddenException('没有权限执行此操作');
    }
  }
}

// src/modules/permissions/decorators/check-permissions.decorator.ts
export const CHECK_PERMISSIONS_KEY = 'check_permissions';

export type PermissionCheck = (ability: AppAbility) => boolean | Promise<boolean>;

export const CheckPermissions = (check: PermissionCheck) =>
  SetMetadata(CHECK_PERMISSIONS_KEY, check);
```

#### 3.7.2 角色与用户权限管理

**实现方案**：

- 支持系统角色和自定义角色管理
- 实现用户与角色的多对多关联
- 提供权限赋予和撤销接口
- 支持权限继承和层级结构

**角色管理服务**：

```typescript
// src/modules/permissions/role.service.ts
@Injectable()
export class RoleService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * 创建角色
   */
  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    // 检查角色名称是否已存在
    const existingRole = await this.prisma.role.findFirst({
      where: {
        name: createRoleDto.name,
        tenantId: createRoleDto.tenantId,
      },
    });

    if (existingRole) {
      throw new ConflictException(`角色名称 '${createRoleDto.name}' 已存在`);
    }

    // 创建角色
    return this.prisma.role.create({
      data: createRoleDto,
    });
  }

  /**
   * 为角色添加权限
   */
  async addPermission(roleId: string, permission: Permission): Promise<Role> {
    // 查找角色
    const role = await this.findOne(roleId);

    // 检查权限是否已存在
    const existingPermission = role.permissions.find(p =>
      p.action === permission.action && p.subject === permission.subject
    );

    if (existingPermission) {
      throw new ConflictException('此权限已存在');
    }

    // 添加权限
    return this.prisma.role.update({
      where: { id: roleId },
      data: {
        permissions: {
          push: permission,
        },
      },
    });
  }

  /**
   * 为角色删除权限
   */
  async removePermission(roleId: string, action: string, subject: string): Promise<Role> {
    // 查找角色
    const role = await this.findOne(roleId);

    // 过滤出要保留的权限
    const updatedPermissions = role.permissions.filter(p =>
      !(p.action === action && p.subject === subject)
    );

    // 如果权限数量没变，说明没找到要删除的权限
    if (updatedPermissions.length === role.permissions.length) {
      throw new NotFoundException('未找到指定权限');
    }

    // 更新权限
    return this.prisma.role.update({
      where: { id: roleId },
      data: {
        permissions: updatedPermissions,
      },
    });
  }

  /**
   * 为用户分配角色
   */
  async assignRoleToUser(userId: string, roleId: string): Promise<void> {
    // 检查用户和角色是否存在
    const [user, role] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.role.findUnique({ where: { id: roleId } }),
    ]);

    if (!user) {
      throw new NotFoundException(`用户ID ${userId} 不存在`);
    }

    if (!role) {
      throw new NotFoundException(`角色ID ${roleId} 不存在`);
    }

    // 检查是否已分配
    const alreadyAssigned = await this.prisma.usersRoles.findFirst({
      where: {
        userId,
        roleId,
      },
    });

    if (alreadyAssigned) {
      return; // 已经分配，直接返回
    }

    // 分配角色
    await this.prisma.usersRoles.create({
      data: {
        userId,
        roleId,
      },
    });
  }

  /**
   * 移除用户角色
   */
  async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
    // 删除关联
    await this.prisma.usersRoles.deleteMany({
      where: {
        userId,
        roleId,
      },
    });
  }

  /**
   * 获取用户的所有角色
   */
  async findUserRoles(userId: string): Promise<Role[]> {
    // 获取用户角色关联
    const userRoles = await this.prisma.usersRoles.findMany({
      where: { userId },
      select: { roleId: true },
    });

    // 查询角色详情
    return this.prisma.role.findMany({
      where: {
        id: {
          in: userRoles.map(ur => ur.roleId),
        },
      },
    });
  }

  /**
   * 初始化系统角色
   */
  async initSystemRoles(tenantId: string): Promise<void> {
    // 系统预定义角色
    const systemRoles = [
      {
        name: '超级管理员',
        description: '拥有系统中的所有权限',
        isSystem: true,
        permissions: [{ action: 'manage', subject: 'all' }],
      },
      {
        name: '租户管理员',
        description: '拥有租户内的管理权限',
        isSystem: true,
        permissions: [
          { action: 'manage', subject: 'user', conditions: { tenantId } },
          { action: 'manage', subject: 'role', conditions: { tenantId } },
          { action: 'manage', subject: 'form', conditions: { tenantId } },
          { action: 'manage', subject: 'workflow', conditions: { tenantId } },
          { action: 'manage', subject: 'model', conditions: { tenantId } },
        ],
      },
      {
        name: '开发者',
        description: '可以创建和管理模型、表单和工作流',
        isSystem: true,
        permissions: [
          { action: 'manage', subject: 'form', conditions: { tenantId } },
          { action: 'manage', subject: 'workflow', conditions: { tenantId } },
          { action: 'manage', subject: 'model', conditions: { tenantId } },
          { action: 'read', subject: 'user', conditions: { tenantId } },
          { action: 'read', subject: 'role', conditions: { tenantId } },
        ],
      },
      {
        name: '普通用户',
        description: '基本应用操作权限',
        isSystem: true,
        isDefault: true,
        permissions: [
          { action: 'read', subject: 'form', conditions: { tenantId, published: true } },
          { action: 'create', subject: 'form-submission', conditions: { tenantId } },
          { action: 'read', subject: 'form-submission', conditions: { tenantId, createdBy: '${user.id}' } },
          { action: 'update', subject: 'form-submission', conditions: { tenantId, createdBy: '${user.id}', status: 'draft' } },
        ],
      },
    ];

    // 逐个创建或更新角色
    for (const roleData of systemRoles) {
      // 检查角色是否已存在
      const existingRole = await this.prisma.role.findFirst({
        where: {
          name: roleData.name,
          tenantId,
        },
      });

      if (existingRole) {
        // 更新现有角色
        await this.prisma.role.update({
          where: { id: existingRole.id },
          data: {
            description: roleData.description,
            permissions: roleData.permissions,
            isSystem: roleData.isSystem,
            isDefault: roleData.isDefault || false,
          },
        });
      } else {
        // 创建新角色
        await this.prisma.role.create({
          data: {
            ...roleData,
            tenantId,
          },
        });
      }
    }
  }
}
```

#### 3.7.3 数据权限与行级访问控制

**实现方案**：

- 支持资源所有权和数据可见性控制
- 通过中间件自动注入查询条件实现行级权限
- 提供字段级权限控制，限制数据展示范围
- 实现数据脱敏和隐私保护

**数据权限过滤器实现**：

```typescript
// src/modules/permissions/interceptors/data-permission.interceptor.ts
@Injectable()
export class DataPermissionInterceptor implements NestInterceptor {
  constructor(
    private readonly abilityFactory: AbilityFactory,
    private readonly reflector: Reflector,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // 如果用户未登录，跳过处理
    if (!user) {
      return next.handle();
    }

    // 获取数据权限配置
    const dataPermission = this.reflector.get<DataPermissionOptions>(
      DATA_PERMISSION_KEY,
      context.getHandler(),
    );

    // 如果没有配置数据权限，跳过处理
    if (!dataPermission) {
      return next.handle();
    }

    // 创建用户权限对象
    const ability = await this.abilityFactory.createForUser(user);

    // 处理请求参数中的查询条件
    if (dataPermission.filterQuery) {
      this.applyQueryFilter(request, ability, dataPermission);
    }

    // 处理返回结果
    return next.handle().pipe(
      map(data => {
        // 应用字段过滤
        if (dataPermission.filterFields) {
          return this.applyFieldFilter(data, ability, dataPermission);
        }
        return data;
      }),
    );
  }

  /**
   * 应用查询过滤器
   */
  private applyQueryFilter(request: any, ability: AppAbility, options: DataPermissionOptions): void {
    const { subject } = options;
    const query = request.query || {};

    // 获取用户对指定资源的条件限制
    const conditionsByAction = {};
    for (const rule of ability.rules) {
      if (rule.subject === subject && rule.conditions) {
        conditionsByAction[rule.action] = rule.conditions;
      }
    }

    // 根据当前操作类型应用条件
    const action = this.getActionFromMethod(request.method);
    const conditions = conditionsByAction[action] || conditionsByAction.manage;

    // 如果有条件限制，将其合并到查询中
    if (conditions) {
      request.query = {
        ...query,
        filter: this.mergeFilters(query.filter, conditions),
      };
    }
  }

  /**
   * 合并过滤条件
   */
  private mergeFilters(existingFilter: any, conditionFilter: any): any {
    let filter = existingFilter;

    // 如果现有过滤器是字符串，尝试解析为对象
    if (typeof filter === 'string') {
      try {
        filter = JSON.parse(filter);
      } catch (e) {
        filter = {};
      }
    } else if (!filter) {
      filter = {};
    }

    // 合并条件
    return {
      ...filter,
      ...conditionFilter,
    };
  }

  /**
   * 应用字段过滤器
   */
  private applyFieldFilter(data: any, ability: AppAbility, options: DataPermissionOptions): any {
    const { subject } = options;

    // 如果是数组，递归处理每个元素
    if (Array.isArray(data)) {
      return data.map(item => this.applyFieldFilter(item, ability, options));
    }

    // 如果是对象，过滤字段
    if (data && typeof data === 'object') {
      // 获取允许的字段
      const allowedFields = this.getAllowedFields(ability, subject);

      // 如果没有字段限制，返回原始数据
      if (!allowedFields) {
        return data;
      }

      // 创建新对象，只包含允许的字段
      const result = {};
      for (const field of allowedFields) {
        if (data[field] !== undefined) {
          result[field] = data[field];
        }
      }

      return result;
    }

    return data;
  }

  /**
   * 获取允许的字段
   */
  private getAllowedFields(ability: AppAbility, subject: string): string[] | null {
    // 获取所有适用的规则
    const rules = ability.rules.filter(rule => rule.subject === subject && rule.fields);

    // 如果没有字段限制规则，返回null表示不限制
    if (rules.length === 0) {
      return null;
    }

    // 合并所有规则的字段
    const fields = new Set<string>();
    for (const rule of rules) {
      if (rule.fields) {
        for (const field of rule.fields) {
          fields.add(field);
        }
      }
    }

    return Array.from(fields);
  }

  /**
   * 根据HTTP方法获取操作类型
   */
  private getActionFromMethod(method: string): string {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'read';
      case 'POST':
        return 'create';
      case 'PUT':
      case 'PATCH':
        return 'update';
      case 'DELETE':
        return 'delete';
      default:
        return 'read';
    }
  }
}

// src/modules/permissions/decorators/data-permission.decorator.ts
export const DATA_PERMISSION_KEY = 'data_permission';

export interface DataPermissionOptions {
  subject: string;
  filterQuery?: boolean;
  filterFields?: boolean;
}

export const DataPermission = (options: DataPermissionOptions) =>
  SetMetadata(DATA_PERMISSION_KEY, options);
```

## 4. 技术架构图

```
+-------------------+        +-------------------+
|                   |        |                   |
|  客户端应用        |        |  管理控制台        |
|                   |        |                   |
+--------+----------+        +---------+---------+
         |                             |
         |    HTTP/WebSocket           |
         v                             v
+-------------------+        +-------------------+
|                   |        |                   |
|    API 网关        +<-------+  认证服务         |
|                   |        |                   |
+--------+----------+        +---------+---------+
         |
         |
+--------v----------+
|                   |
|   Nest.js应用     |
|                   |
+-------------------+
|                   |
|  低代码核心模块     |
|                   |
+--------+----------+
         |
         |
+--------v----------+        +-------------------+
|                   |        |                   |
|   MySQL 数据库     |        |    Redis 缓存     |
|                   |        |                   |
+-------------------+        +-------------------+
```

## 5. 总结

本文档详细描述了LowCodeX平台的后端设计，包括系统架构、核心模块和技术选型。通过低代码理念和模块化设计，LowCodeX提供了以下核心功能：

1. **动态数据模型管理**：通过元数据驱动的方式定义和管理业务数据结构
2. **表单模板设计与数据管理**：支持复杂表单的定义、渲染和数据收集
3. **工作流引擎**：实现业务流程的自动化执行和监控
4. **动态API生成**：基于元数据自动生成REST API接口
5. **权限系统**：提供细粒度的角色和数据权限控制

这些模块协同工作，为企业用户提供了一个完整的低代码开发环境，使其能够快速构建和部署业务应用，显著降低开发成本和周期。

后续规划中，将进一步增强系统的扩展性、性能和安全性，并提供更丰富的集成能力，支持更多复杂业务场景的实现。
