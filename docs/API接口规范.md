# LowCodeX API接口规范

## 一、统一响应结构

为保证接口统一性和提高可维护性，所有API接口应遵循以下响应结构：

```typescript
{
  "code": number,       // 业务状态码
  "message": string,    // 状态描述信息
  "data": any,          // 业务数据(成功时)或null(失败时)
  "timestamp": number   // 响应时间戳(毫秒)
}
```

## 二、业务状态码规范

业务状态码应与HTTP状态码区分，采用自定义业务码：

| 状态码 | 描述 | 说明 |
|-------|------|------|
| 200 | 成功 | 请求成功处理并返回 |
| 400 | 参数错误 | 请求参数有误 |
| 401 | 未授权 | 用户未登录或token失效 |
| 403 | 权限不足 | 用户无权限执行该操作 |
| 404 | 资源不存在 | 请求的资源不存在 |
| 409 | 业务冲突 | 业务逻辑冲突(如重复创建) |
| 429 | 请求过于频繁 | 请求被限流 |
| 500 | 系统错误 | 服务器内部错误 |
| 503 | 服务不可用 | 服务暂时不可用 |

## 三、响应数据规范

### 1. 单一资源返回

```typescript
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "name": "张三",
    "age": 28
  },
  "timestamp": 1650000000000
}
```

### 2. 列表数据返回

统一使用`items`作为列表数据的字段名:

```typescript
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      { "id": 1, "name": "张三" },
      { "id": 2, "name": "李四" }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 10
  },
  "timestamp": 1650000000000
}
```

### 3. 空数据返回

```typescript
{
  "code": 200,
  "message": "success",
  "data": null,
  "timestamp": 1650000000000
}
```

### 4. 错误返回

```typescript
{
  "code": 400,
  "message": "用户名不能为空",
  "data": null,
  "timestamp": 1650000000000
}
```

## 四、数据结构命名规范

1. **避免双层data**：不允许出现`data.data`这样的嵌套结构
2. **列表数据**：统一使用`items`字段
3. **分页信息**：统一使用`page`(当前页码)、`pageSize`(每页条数)和`total`(总条数)
4. **布尔值**：统一使用`isXxx`形式命名，如`isDeleted`
5. **时间字段**：
   - 创建时间：`createdAt`
   - 更新时间：`updatedAt`
   - 删除时间：`deletedAt`

## 五、分页数据规范

分页数据结构统一为：

```typescript
{
  "items": Array<T>,  // 列表数据
  "total": number,    // 总条数
  "page": number,     // 当前页码(从1开始)
  "pageSize": number  // 每页条数
}
```

## 六、HTTP状态码使用

服务端应始终返回HTTP 200状态码，业务状态通过响应体中的`code`字段表示。这样可以避免前端对HTTP错误状态码的特殊处理，统一错误处理逻辑。

## 七、异常处理规范

1. **参数校验异常**
   - code: 400
   - message: 具体说明哪个参数有问题，如"用户名不能为空"

2. **认证异常**
   - code: 401
   - message: "用户未登录"或"登录已过期，请重新登录"

3. **授权异常**
   - code: 403
   - message: "权限不足，无法执行该操作"

4. **资源不存在**
   - code: 404
   - message: "资源不存在"或具体说明如"用户不存在"

5. **业务异常**
   - code: 409
   - message: 具体业务错误信息

6. **系统异常**
   - code: 500
   - message: "系统异常，请稍后再试"（生产环境不应暴露具体错误详情）

## 八、实现示例

### TypeScript接口定义

```typescript
// 通用响应结构
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T | null;
  timestamp: number;
}

// 分页数据结构
interface PaginationData<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
```

### Java实现示例

```java
@Data
public class ApiResponse<T> {
    private Integer code;
    private String message;
    private T data;
    private Long timestamp;

    public static <T> ApiResponse<T> success(T data) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setCode(200);
        response.setMessage("success");
        response.setData(data);
        response.setTimestamp(System.currentTimeMillis());
        return response;
    }

    public static <T> ApiResponse<T> error(Integer code, String message) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setCode(code);
        response.setMessage(message);
        response.setData(null);
        response.setTimestamp(System.currentTimeMillis());
        return response;
    }
}
```

## 九、最佳实践

1. **统一异常处理**：实现全局异常处理器，统一捕获异常并转换为规范的响应格式
2. **参数校验**：使用验证框架进行参数校验，将校验失败信息转换为规范的错误响应
3. **日志记录**：记录所有异常，便于问题排查
4. **错误文档**：建立错误码文档，详细说明每个错误码的含义和处理方法
5. **版本控制**：在URL或请求头中包含API版本信息

通过严格遵循以上规范，我们可以确保API接口的统一性、可维护性和可扩展性，为前后端协作提供良好的基础。
