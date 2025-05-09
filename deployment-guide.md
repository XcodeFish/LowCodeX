# LowCodeX 私有化部署指南

## 1. 部署概述

LowCodeX 支持灵活的私有化部署方案，可以根据企业实际需求选择合适的部署模式。本文档提供了详细的部署步骤和配置指南，帮助系统管理员快速完成系统部署。

### 1.1 系统要求

#### 硬件要求

| 组件 | 最低配置 | 推荐配置 |
|-----|---------|---------|
| CPU | 2核 | 4核或更高 |
| 内存 | 4GB | 8GB或更高 |
| 存储 | 20GB | 40GB或更高 |
| 网络 | 100Mbps | 1000Mbps |

#### 软件要求

| 组件 | 版本要求 |
|-----|---------|
| Docker | 20.10.0+ |
| Docker Compose | 1.29.0+ |
| 或 Kubernetes | 1.19.0+ |
| MySQL | 8.0+ |
| Redis | 6.0+ |

### 1.2 部署架构

![部署架构图](https://via.placeholder.com/800x400?text=LowCodeX+部署架构图)

LowCodeX 采用微服务架构，主要组件包括：

1. **前端应用**：React 构建的前端应用，提供用户界面
2. **后端服务**：Nest.js 构建的后端服务，提供API和业务逻辑
3. **数据库**：MySQL 存储业务数据和元数据
4. **缓存/队列**：Redis 提供缓存和消息队列功能
5. **反向代理**：Nginx 提供负载均衡和静态资源服务

## 2. 部署方式

LowCodeX 支持以下几种部署方式：

1. **Docker Compose 部署**：适合小型团队或测试环境
2. **Kubernetes 部署**：适合生产环境和大规模部署
3. **手动部署**：适合特殊环境或无法使用容器的场景

本文档主要介绍 Docker Compose 部署方式，这是最简单且推荐的方式。

## 3. Docker Compose 部署

### 3.1 环境准备

1. 安装 Docker 和 Docker Compose

```bash
# 安装 Docker
curl -fsSL https://get.docker.com | sh

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

2. 克隆部署仓库

```bash
git clone https://github.com/your-org/lowcodex-deploy.git
cd lowcodex-deploy
```

### 3.2 配置环境变量

创建 `.env` 文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置以下参数：

```ini
# 基础配置
NODE_ENV=production
APP_PORT=3000
APP_URL=http://localhost
APP_SECRET=your-secret-key

# 数据库配置
DB_HOST=mysql
DB_PORT=3306
DB_USER=lowcodex
DB_PASSWORD=your-strong-password
DB_NAME=lowcodex

# Redis配置
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# JWT 配置
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=1d

# CORS 配置
CORS_ORIGINS=*

# 初始管理员账号
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123

# 存储配置
STORAGE_TYPE=local # 或 s3, oss 等
```

### 3.3 启动服务

使用 Docker Compose 启动所有服务：

```bash
docker-compose up -d
```

这将启动以下服务：

- `frontend`：前端应用，默认暴露 80 端口
- `backend`：后端服务，默认暴露 3000 端口
- `mysql`：MySQL 数据库，默认暴露 3306 端口
- `redis`：Redis 服务，默认暴露 6379 端口
- `nginx`：反向代理服务，默认暴露 80、443 端口

### 3.4 初始化数据

首次启动后，需要初始化系统数据：

```bash
# 执行数据库迁移
docker-compose exec backend npx prisma migrate deploy

# 初始化种子数据
docker-compose exec backend npm run seed
```

### 3.5 访问系统

系统启动后，可以通过浏览器访问：

- 前端应用：<http://localhost>
- API 文档：<http://localhost/api/docs>

默认管理员账号为 `.env` 文件中配置的 `ADMIN_EMAIL` 和 `ADMIN_PASSWORD`。

## 4. 多租户配置

LowCodeX 支持多种租户隔离模式，根据实际需求选择合适的模式。

### 4.1 租户隔离模式

| 隔离模式 | 配置方式 | 适用场景 |
|---------|---------|---------|
| 共享数据库，共享表 | `TENANT_MODE=shared` | 成本敏感，安全要求较低 |
| 共享数据库，独立Schema | `TENANT_MODE=schema` | 平衡成本和隔离性 |
| 独立数据库 | `TENANT_MODE=database` | 高安全要求，完全隔离 |

### 4.2 配置租户模式

在 `.env` 文件中配置租户模式：

```ini
# 租户配置
TENANT_MODE=shared  # 或 schema, database
TENANT_ID_FIELD=tenantId
```

### 4.3 租户识别方式

LowCodeX 支持多种租户识别方式：

1. **子域名识别**：通过子域名区分不同租户，如 `tenant1.example.com`
2. **路径识别**：通过URL路径区分不同租户，如 `example.com/tenant1`
3. **请求头识别**：通过HTTP请求头区分不同租户，如 `X-Tenant-ID: tenant1`

在 `.env` 文件中配置租户识别方式：

```ini
# 租户识别配置
TENANT_RESOLVER=subdomain  # 或 path, header
TENANT_HEADER=X-Tenant-ID  # 使用 header 方式时的请求头名称
```

## 5. HTTPS 配置

### 5.1 使用自签名证书

```bash
# 生成自签名证书
mkdir -p ./nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ./nginx/ssl/private.key -out ./nginx/ssl/certificate.crt
```

修改 `docker-compose.yml`，配置 Nginx 使用 HTTPS：

```yaml
nginx:
  # ... 其他配置
  volumes:
    - ./nginx/conf.d:/etc/nginx/conf.d
    - ./nginx/ssl:/etc/nginx/ssl
```

创建 Nginx 配置文件 `./nginx/conf.d/default.conf`：

```nginx
server {
    listen 80;
    server_name _;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name _;

    ssl_certificate /etc/nginx/ssl/certificate.crt;
    ssl_certificate_key /etc/nginx/ssl/private.key;

    # ... 其他配置
}
```

### 5.2 使用 Let's Encrypt 证书

1. 安装 Certbot

```bash
sudo apt-get install certbot
```

2. 获取证书

```bash
sudo certbot certonly --standalone -d example.com -d www.example.com
```

3. 配置 Nginx 使用 Let's Encrypt 证书

```nginx
server {
    listen 443 ssl;
    server_name example.com www.example.com;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    # ... 其他配置
}
```

## 6. 系统监控

### 6.1 日志管理

LowCodeX 使用 ELK (Elasticsearch, Logstash, Kibana) 或 PLG (Prometheus, Loki, Grafana) 进行日志收集和分析。

配置 `docker-compose.yml` 添加日志驱动：

```yaml
services:
  backend:
    # ... 其他配置
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### 6.2 监控告警

使用 Prometheus + Grafana 进行系统监控：

1. 配置 Prometheus 监控目标：

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'lowcodex'
    scrape_interval: 15s
    static_configs:
      - targets: ['backend:3000']
```

2. 配置 Grafana 仪表盘，监控关键指标：
   - CPU 和内存使用率
   - 请求响应时间
   - 错误率
   - 数据库连接数
   - Redis 缓存命中率

## 7. 系统备份与恢复

### 7.1 数据备份策略

1. **数据库备份**：每日全量备份 + 增量备份

```bash
# MySQL 备份脚本
mysqldump -h mysql -u root -p --all-databases > /backup/mysql_$(date +%Y%m%d).sql
```

2. **配置文件备份**：定期备份所有配置文件

```bash
# 配置文件备份
tar -czf /backup/config_$(date +%Y%m%d).tar.gz .env docker-compose.yml nginx/
```

### 7.2 数据恢复

1. **数据库恢复**：

```bash
# MySQL 恢复
mysql -h mysql -u root -p < /backup/mysql_20220101.sql
```

2. **配置文件恢复**：

```bash
# 配置文件恢复
tar -xzf /backup/config_20220101.tar.gz -C /path/to/restore
```

## 8. 故障排除

### 8.1 常见问题

1. **服务无法启动**
   - 检查端口占用：`netstat -tulpn`
   - 检查日志：`docker-compose logs -f [service_name]`

2. **数据库连接失败**
   - 检查数据库配置：`.env` 中的数据库参数
   - 检查数据库状态：`docker-compose ps mysql`

3. **API 响应缓慢**
   - 检查数据库索引
   - 检查缓存配置
   - 检查服务器资源使用情况

### 8.2 日志收集

收集诊断信息：

```bash
# 收集所有容器状态
docker-compose ps > diagnostic_info.txt

# 收集所有容器日志
docker-compose logs > logs.txt

# 收集系统信息
cat /proc/cpuinfo >> diagnostic_info.txt
cat /proc/meminfo >> diagnostic_info.txt
df -h >> diagnostic_info.txt
```

## 9. 升级与迭代

### 9.1 版本升级流程

1. **备份当前系统**

   ```bash
   # 备份数据库
   docker-compose exec mysql mysqldump -u root -p --all-databases > backup.sql

   # 备份配置文件
   cp .env .env.backup
   cp docker-compose.yml docker-compose.yml.backup
   ```

2. **拉取新版本代码**

   ```bash
   git pull origin main
   ```

3. **迁移数据库**

   ```bash
   docker-compose run --rm backend npx prisma migrate deploy
   ```

4. **重启服务**

   ```bash
   docker-compose down
   docker-compose up -d
   ```

### 9.2 回滚机制

如果升级失败，可以按照以下步骤回滚：

1. **停止当前服务**

   ```bash
   docker-compose down
   ```

2. **恢复配置文件**

   ```bash
   cp .env.backup .env
   cp docker-compose.yml.backup docker-compose.yml
   ```

3. **恢复数据库**

   ```bash
   docker-compose up -d mysql
   cat backup.sql | docker-compose exec -T mysql mysql -u root -p
   ```

4. **启动旧版本服务**

   ```bash
   docker-compose up -d
   ```

## 10. 高可用部署

对于生产环境，建议配置高可用部署方案：

### 10.1 多副本部署

使用 Docker Swarm 或 Kubernetes 部署多个服务副本：

```yaml
# docker-compose.yml 中配置
services:
  backend:
    # ... 其他配置
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
```

### 10.2 数据库高可用

配置 MySQL 主从复制或集群：

1. **主从复制**：一主多从，主库负责写入，从库负责读取
2. **MySQL InnoDB Cluster**：多主节点集群，自动故障转移

### 10.3 负载均衡

使用 Nginx 或云服务商提供的负载均衡服务：

```nginx
# nginx.conf
upstream backend {
    server backend1:3000;
    server backend2:3000;
    server backend3:3000;
}

server {
    listen 80;

    location /api {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 11. 安全加固

### 11.1 网络安全

1. **防火墙配置**：只开放必要端口
2. **使用 HTTPS**：所有流量加密
3. **配置 CSP 策略**：防止 XSS 攻击

### 11.2 应用安全

1. **定期更新依赖**：修复已知漏洞
2. **开启 CSRF 保护**：防止跨站请求伪造
3. **配置 Rate Limiting**：防止暴力破解和 DoS 攻击

### 11.3 数据安全

1. **敏感数据加密**：密码、个人信息等
2. **定期备份**：防止数据丢失
3. **访问控制**：最小权限原则
