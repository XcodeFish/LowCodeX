import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma';
import { ConfigService } from '@nestjs/config';
import { DatabaseConfig, TenantConfig, TenantModeEnum } from '../config';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private dbConfig: DatabaseConfig | undefined;

  constructor(private configService: ConfigService) {
    // 获取数据库配置
    const dbConfig = configService.get<DatabaseConfig>('database');
    // 先调用super初始化PrismaClient
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
      errorFormat: 'colorless',
    });

    this.logger.log('dbConfig', dbConfig);

    // 保存配置以供后续使用
    this.dbConfig = dbConfig;

    // 确保DATABASE_URL环境变量已设置（Prisma需要）
    if (dbConfig && dbConfig.url && !process.env.DATABASE_URL) {
      process.env.DATABASE_URL = dbConfig.url;
      this.logger.log(`数据库URL已设置: ${this.maskDatabaseUrl(dbConfig.url)}`);
    }

    // 输出数据库连接信息
    this.logger.log(`准备连接到数据库: ${this.getDatabaseInfo(dbConfig)}`);
  }

  async onModuleInit() {
    try {
      this.logger.log('正在连接数据库...');
      await this.$connect();
      this.logger.log('✅ 数据库连接成功');

      // 添加中间件用于多租户隔离
      const tenantMode = this.configService.get('TENANT_MODE', 'column');
      const tenantIdField = this.configService.get(
        'TENANT_ID_FIELD',
        'tenantId',
      );

      if (tenantMode === 'column') {
        this.logger.log(
          `已启用多租户隔离，模式: ${tenantMode}, 字段: ${tenantIdField}`,
        );

        this.$use(async (params, next) => {
          const tenantId = this.getTenantId();

          if (
            tenantId &&
            params.model &&
            this.isTenantAwareModel(params.model)
          ) {
            if (
              params.action === 'findUnique' ||
              params.action === 'findFirst'
            ) {
              params.args.where[tenantIdField] = tenantId;
              return next(params);
            }

            if (params.action === 'findMany') {
              if (!params.args) params.args = {};
              if (!params.args.where) params.args.where = {};
              params.args.where[tenantIdField] = tenantId;
              return next(params);
            }

            if (params.action === 'create') {
              if (!params.args.data) params.args.data = {};
              params.args.data[tenantIdField] = tenantId;
              return next(params);
            }

            if (params.action === 'update' || params.action === 'updateMany') {
              if (!params.args.where) params.args.where = {};
              params.args.where[tenantIdField] = tenantId;
              return next(params);
            }

            if (params.action === 'delete' || params.action === 'deleteMany') {
              if (!params.args.where) params.args.where = {};
              params.args.where[tenantIdField] = tenantId;
              return next(params);
            }
          }

          return next(params);
        });
      }
    } catch (error) {
      this.logger.error(`❌ 数据库连接失败: ${error.message}`, error.stack);

      // 解析错误码以提供更友好的错误信息
      if (error.code) {
        switch (error.code) {
          case 'P1000':
            this.logger.error(
              '认证失败：提供的数据库凭据无效，请检查用户名和密码',
            );
            break;
          case 'P1001':
            this.logger.error(
              '无法连接到数据库服务器：请检查网络连接和服务器状态',
            );
            break;
          case 'P1003':
            this.logger.error(
              '数据库不存在：请确保已创建数据库或检查数据库名称',
            );
            break;
          default:
            this.logger.error(`Prisma错误码: ${error.code}`);
        }
      }

      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      this.logger.log('正在关闭数据库连接...');
      await this.$disconnect();
      this.logger.log('✅ 数据库连接已安全关闭');
    } catch (error) {
      this.logger.error(
        `❌ 关闭数据库连接时出错: ${error.message}`,
        error.stack,
      );
    }
  }

  // 获取当前租户ID (通常从请求上下文中获取)
  private getTenantId(): number | null {
    // 后续会从请求上下文中获取租户ID
    // 在初始阶段，这里返回null，表示不进行租户过滤
    return null;
  }

  // 检查模型是否应用租户隔离
  private isTenantAwareModel(model: string): boolean {
    const tenantAwareModels = [
      'User',
      'Role',
      'Permission',
      'Application',
      'DataModel',
      'Form',
      'Workflow',
    ];
    return tenantAwareModels.includes(model);
  }

  // 格式化数据库连接信息（隐藏敏感信息）
  private getDatabaseInfo(dbConfig: DatabaseConfig | undefined): string {
    if (!dbConfig) return '未配置';

    return `类型=${dbConfig.type}, 主机=${dbConfig.host}, URL=${dbConfig.url}, 端口=${dbConfig.port}, 数据库=${dbConfig.database}, 用户=${dbConfig.username}`;
  }

  // 掩盖数据库URL中的敏感信息
  private maskDatabaseUrl(url: string): string {
    try {
      // 替换密码部分为***
      return url.replace(/\/\/([^:]+):([^@]+)@/, '//******:*****@');
    } catch (e) {
      return '无法解析URL';
    }
  }
}
