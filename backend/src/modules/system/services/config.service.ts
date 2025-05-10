import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../services/prisma.service';

/**
 * 系统配置类型
 */
export interface SystemConfig {
  key: string;
  value: any;
  description?: string;
  isPublic: boolean;
  group: string;
}

/**
 * 系统配置服务
 * 用于管理系统配置，支持缓存，分组和访问控制
 */
@Injectable()
export class ConfigService {
  private readonly logger = new Logger(ConfigService.name);
  private cache: Map<string, any> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private cacheTTL = 60 * 1000; // 默认缓存60秒

  constructor(private prisma: PrismaService) {
    this.initializeCache();
  }

  /**
   * 初始化配置缓存
   */
  private async initializeCache(): Promise<void> {
    try {
      // 查询所有公共配置并加载到缓存中
      const configs = await this.prisma.$queryRaw<SystemConfig[]>`
        SELECT * FROM "SystemConfig" WHERE "isPublic" = true
      `;

      for (const config of configs) {
        this.setCache(config.key, config.value);
      }

      this.logger.log(`已加载 ${configs.length} 条系统配置到缓存`);
    } catch (error) {
      this.logger.error('初始化系统配置缓存失败', error.stack);
    }
  }

  /**
   * 设置缓存
   */
  private setCache(key: string, value: any): void {
    this.cache.set(key, value);
    this.cacheExpiry.set(key, Date.now() + this.cacheTTL);
  }

  /**
   * 获取缓存
   */
  private getCache(key: string): any | null {
    if (!this.cache.has(key)) {
      return null;
    }

    const expiry = this.cacheExpiry.get(key);
    if (expiry && expiry < Date.now()) {
      // 缓存过期，删除
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
      return null;
    }

    return this.cache.get(key);
  }

  /**
   * 设置配置值
   */
  async set(
    key: string,
    value: any,
    options: {
      description?: string;
      isPublic?: boolean;
      group?: string;
    } = {},
  ): Promise<void> {
    const { description, isPublic = true, group = 'system' } = options;

    try {
      // 检查配置是否存在
      const exists = await this.prisma.$queryRaw<any[]>`
        SELECT COUNT(*) as count FROM "SystemConfig" WHERE key = ${key}
      `;

      const count = parseInt(exists[0]?.count || '0', 10);

      if (count > 0) {
        // 更新现有配置
        await this.prisma.$executeRaw`
          UPDATE "SystemConfig"
          SET
            "value" = ${JSON.stringify(value)},
            "description" = ${description || null},
            "isPublic" = ${isPublic},
            "group" = ${group},
            "updatedAt" = ${new Date()}
          WHERE key = ${key}
        `;
      } else {
        // 创建新配置
        await this.prisma.$executeRaw`
          INSERT INTO "SystemConfig"
          ("key", "value", "description", "isPublic", "group", "createdAt", "updatedAt")
          VALUES
          (${key}, ${JSON.stringify(value)}, ${description || null}, ${isPublic}, ${group}, ${new Date()}, ${new Date()})
        `;
      }

      // 更新缓存
      if (isPublic) {
        this.setCache(key, value);
      } else {
        // 如果设置为非公开，从缓存中移除
        this.cache.delete(key);
        this.cacheExpiry.delete(key);
      }

      this.logger.log(`系统配置 [${key}] 已${count > 0 ? '更新' : '创建'}`);
    } catch (error) {
      this.logger.error(
        `设置系统配置 [${key}] 失败: ${error.message}`,
        error.stack,
      );
      throw new Error(`设置系统配置失败: ${error.message}`);
    }
  }

  /**
   * 获取配置值
   */
  async get<T = any>(key: string, defaultValue?: T): Promise<T> {
    // 先从缓存中查找
    const cachedValue = this.getCache(key);
    if (cachedValue !== null) {
      return cachedValue as T;
    }

    try {
      // 从数据库中查找
      const result = await this.prisma.$queryRaw<SystemConfig[]>`
        SELECT * FROM "SystemConfig" WHERE key = ${key}
      `;

      if (result.length === 0) {
        return defaultValue as T;
      }

      const config = result[0];

      // 如果是公开配置，添加到缓存
      if (config.isPublic) {
        this.setCache(key, config.value);
      }

      return config.value as T;
    } catch (error) {
      this.logger.error(
        `获取系统配置 [${key}] 失败: ${error.message}`,
        error.stack,
      );
      return defaultValue as T;
    }
  }

  /**
   * 删除配置
   */
  async delete(key: string): Promise<boolean> {
    try {
      // 从数据库中删除
      await this.prisma.$executeRaw`
        DELETE FROM "SystemConfig" WHERE key = ${key}
      `;

      // 从缓存中删除
      this.cache.delete(key);
      this.cacheExpiry.delete(key);

      this.logger.log(`系统配置 [${key}] 已删除`);
      return true;
    } catch (error) {
      this.logger.error(
        `删除系统配置 [${key}] 失败: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }

  /**
   * 获取指定分组的所有配置
   */
  async getByGroup(
    group: string,
    includePrivate = false,
  ): Promise<SystemConfig[]> {
    try {
      let query = `SELECT * FROM "SystemConfig" WHERE "group" = ${group}`;

      if (!includePrivate) {
        query += ` AND "isPublic" = true`;
      }

      const configs = await this.prisma.$queryRawUnsafe<SystemConfig[]>(query);
      return configs;
    } catch (error) {
      this.logger.error(
        `获取分组 [${group}] 的系统配置失败: ${error.message}`,
        error.stack,
      );
      return [];
    }
  }

  /**
   * 获取所有配置
   */
  async getAll(
    includePrivate = false,
  ): Promise<Record<string, SystemConfig[]>> {
    try {
      let query = `SELECT * FROM "SystemConfig"`;

      if (!includePrivate) {
        query += ` WHERE "isPublic" = true`;
      }

      const configs = await this.prisma.$queryRawUnsafe<SystemConfig[]>(query);

      // 按分组整理
      const result: Record<string, SystemConfig[]> = {};

      for (const config of configs) {
        if (!result[config.group]) {
          result[config.group] = [];
        }

        result[config.group].push(config);
      }

      return result;
    } catch (error) {
      this.logger.error(`获取所有系统配置失败: ${error.message}`, error.stack);
      return {};
    }
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
    this.logger.log('系统配置缓存已清除');
  }
}
