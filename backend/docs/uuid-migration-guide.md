# UUID迁移指南

## 背景

为了提高系统的安全性、可扩展性和健壮性，我们决定将所有实体的ID从数字类型(number)迁移到UUID字符串类型(string)。这种迁移提供以下好处：

1. **全局唯一性**：UUID在不同系统和环境中保持唯一，无需中央协调
2. **安全性增强**：不会暴露资源数量和创建顺序，降低ID被猜测的风险
3. **分布式系统友好**：适合微服务架构和分布式数据库
4. **数据迁移和合并容易**：不同来源的数据可以无冲突合并
5. **隐私保护**：不透露业务信息如用户数量、交易量等

## 迁移步骤

### 1. 更新Prisma模型

修改`prisma/schema.prisma`文件，将所有模型的ID字段从`Int`改为`String`，并设置默认值为UUID：

```prisma
model User {
  id        String   @id @default(uuid())
  // 其他字段...
}

model Role {
  id        String   @id @default(uuid())
  // 其他字段...
}

// 其他模型...
```

更新所有外键关系，确保类型匹配：

```prisma
model UserRole {
  id        String   @id @default(uuid())
  userId    String   // 从Int改为String
  roleId    String   // 从Int改为String

  user      User     @relation(fields: [userId], references: [id])
  role      Role     @relation(fields: [roleId], references: [id])
  // 其他字段...
}
```

### 2. 生成数据库迁移

运行Prisma迁移命令，生成迁移脚本：

```bash
npx prisma migrate dev --name uuid_migration
```

这将生成一个迁移脚本，用于将数据库中的ID字段从数字类型转换为UUID字符串类型。

> 注意：对于生产环境，需要仔细规划迁移策略，可能需要编写自定义迁移脚本来保留现有数据。

### 3. 更新TypeScript接口

所有涉及ID字段的接口都需要更新，将类型从`number`改为`string`：

```typescript
export interface User {
  id: string; // 从number改为string
  // 其他字段...
}
```

> 注意：我们已经更新了关键接口，但可能有一些接口被遗漏。请仔细检查并更新所有接口。

### 4. 更新服务和控制器

所有使用ID的服务和控制器需要更新，以适应UUID字符串类型：

```typescript
async findById(id: string): Promise<User> { // 从number改为string
  return this.prisma.user.findUnique({
    where: { id },
  });
}
```

### 5. 更新测试和种子数据

确保更新所有测试用例和种子数据，使用UUID格式而不是数字：

```typescript
// 旧的方式
const user = await prisma.user.create({
  data: { /* ... */ }
});
const userId = user.id; // 数字ID

// 新的方式
const user = await prisma.user.create({
  data: { /* ... */ }
});
const userId = user.id; // UUID字符串
```

### 6. 处理前端代码

更新前端代码中所有处理ID的部分，确保它们适应UUID字符串：

```typescript
// 旧的方式
const userId = parseInt(params.id);

// 新的方式
const userId = params.id; // 已经是字符串，无需转换
```

### 7. API文档更新

更新所有API文档，指明ID字段现在是UUID字符串而不是数字：

```yaml
components:
  schemas:
    User:
      properties:
        id:
          type: string
          format: uuid
          example: "123e4567-e89b-12d3-a456-426614174000"
```

## 关于UUID的最佳实践

1. **使用UUID v4**：提供最佳的随机性和唯一性
2. **存储格式**：以标准的连字符格式存储（例如`123e4567-e89b-12d3-a456-426614174000`）
3. **索引考虑**：UUID作为主键需要注意索引性能，考虑使用适当的数据库索引策略
4. **客户端生成**：对于某些场景，可以在客户端生成UUID，减少服务器负担

## 迁移过程中的注意事项

1. **数据备份**：在开始迁移前，确保有完整的数据备份
2. **逐步迁移**：对于大型系统，考虑逐模块迁移而不是一次性迁移全部
3. **双写阶段**：在过渡期可能需要同时支持数字ID和UUID
4. **性能监控**：迁移后密切监控系统性能，特别是涉及ID的查询
5. **回滚计划**：准备详细的回滚方案，以防迁移出现问题

## 可能遇到的问题和解决方案

1. **性能问题**：UUID索引可能比整数索引慢，解决方案是使用适当的索引策略
2. **存储空间增加**：UUID需要更多存储空间，解决方案是监控数据库大小和优化存储
3. **URL长度**：UUID在URL中较长，解决方案是考虑在API设计中使用恰当的路径结构
4. **第三方集成**：某些第三方服务可能期望数字ID，解决方案是创建适配层

## 时间线和责任划分

1. **规划阶段**（1周）：确定迁移范围和策略
2. **开发阶段**（2-3周）：更新代码和数据库模型
3. **测试阶段**（1-2周）：确保所有功能正常工作
4. **迁移阶段**（特定时间窗口）：将变更应用到生产环境
5. **监控阶段**（1-2周）：密切监控系统性能和稳定性

## 结论

将ID从数字类型迁移到UUID是一项重要的架构改进，虽然过程复杂，但长期收益显著。通过仔细规划和执行，可以平滑完成这一迁移，同时保持系统的稳定性和性能。
