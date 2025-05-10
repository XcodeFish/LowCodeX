// 不导入Prisma，直接定义实体类

// 通过Prisma模型扩展用户实体
export class User {
  id?: string;
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  status: string;
  tenantId: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  lastLoginAt?: Date | string;

  // 扩展属性（不存储在数据库中）
  roles?: UserRole[];
  permissions?: string[];
  isActivated?: boolean;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }

  get fullName(): string {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim();
  }

  get isActive(): boolean {
    return this.status === 'active';
  }
}

export class UserRole {
  id?: string;
  userId: string;
  roleId: string;
  tenantId?: string;
  applicationId?: string;
  createdAt?: Date | string;

  role?: Role;
}

export class Role {
  id?: string;
  code: string;
  name: string;
  description?: string;
  type: string;
  applicationId?: string;
  tenantId?: string;
  parentId?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;

  permissions?: RolePermission[];
}

export class RolePermission {
  id?: string;
  roleId: string;
  permissionId: string;
  createdAt?: Date | string;

  permission?: Permission;
}

export class Permission {
  id?: string;
  code: string;
  name: string;
  description?: string;
  resourceType: string;
  actionType: string;
  resourcePattern: string;
  conditionExpression?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
