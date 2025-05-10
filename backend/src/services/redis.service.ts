import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';
import { RedisConfig } from '../config';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private redisClient: RedisClientType;
  private redisConfig: RedisConfig | undefined;

  constructor(private configService: ConfigService) {
    this.redisConfig = this.configService.get<RedisConfig>('redis');
    this.logger.log('redisConfig', this.redisConfig);
    if (this.redisConfig) {
      this.logger.log(
        `准备连接到Redis服务器: 主机=${this.redisConfig.host}, 端口=${this.redisConfig.port}, 数据库=${this.redisConfig.db}`,
      );
    } else {
      this.logger.warn('Redis配置未找到，将使用默认配置');
    }
  }

  async onModuleInit() {
    try {
      this.logger.log('正在连接Redis...');
      const redisConfig = this.redisConfig;

      if (!redisConfig) {
        throw new Error('Redis配置未找到');
      }

      this.redisClient = createClient({
        url: redisConfig.url,
      });

      // 错误处理
      this.redisClient.on('error', (err) => {
        this.logger.error(`❌ Redis连接错误: ${err.message}`, err.stack);

        // 提供针对常见错误的更多信息
        if (err.code === 'ECONNREFUSED') {
          this.logger.error(
            `连接被拒绝：请检查Redis服务器(${redisConfig.host}:${redisConfig.port})是否正在运行`,
          );
        } else if (err.code === 'ETIMEDOUT') {
          this.logger.error(`连接超时：请检查网络连接和防火墙设置`);
        } else if (err.code === 'NOAUTH') {
          this.logger.error(`认证失败：提供的Redis密码无效`);
        }
      });

      // 连接监听
      this.redisClient.on('connect', () => {
        this.logger.log(
          `⏳ Redis正在连接到: ${redisConfig.host}:${redisConfig.port}`,
        );
      });

      this.redisClient.on('ready', () => {
        this.logger.log(
          `✅ Redis连接已建立并就绪: ${redisConfig.host}:${redisConfig.port}, 数据库: ${redisConfig.db}`,
        );
      });

      // 重连监听
      this.redisClient.on('reconnecting', () => {
        this.logger.warn(`⚠️ Redis正在尝试重新连接...`);
      });

      await this.redisClient.connect();
      this.logger.log('✅ Redis连接成功');

      // 测试Redis连接
      await this.redisClient.ping();
      this.logger.log('✅ Redis服务器响应PONG');
    } catch (error) {
      this.logger.error(`❌ Redis初始化失败: ${error.message}`, error.stack);

      // 不要中断应用启动
      // throw error;
    }
  }

  async onModuleDestroy() {
    if (this.redisClient) {
      try {
        this.logger.log('正在关闭Redis连接...');
        await this.redisClient.disconnect();
        this.logger.log('✅ Redis连接已安全关闭');
      } catch (error) {
        this.logger.error(
          `❌ 关闭Redis连接时出错: ${error.message}`,
          error.stack,
        );
      }
    }
  }

  // 获取Redis客户端实例
  getClient(): RedisClientType {
    if (!this.redisClient) {
      this.logger.warn('尝试获取未初始化的Redis客户端');
    }
    return this.redisClient;
  }

  // 缓存方法
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      if (typeof value !== 'string') {
        value = JSON.stringify(value);
      }

      if (ttl) {
        await this.redisClient.set(key, value, { EX: ttl });
        this.logger.debug(`Redis缓存设置: key=${key}, ttl=${ttl}秒`);
      } else {
        await this.redisClient.set(key, value);
        this.logger.debug(`Redis缓存设置: key=${key}, 无过期时间`);
      }
    } catch (error) {
      this.logger.error(`❌ Redis设置键值对失败: ${error.message}, key=${key}`);
      throw error;
    }
  }

  async get<T = any>(key: string): Promise<T | null> {
    try {
      const value = await this.redisClient.get(key);
      if (!value) {
        this.logger.debug(`Redis缓存未命中: key=${key}`);
        return null;
      }

      this.logger.debug(`Redis缓存命中: key=${key}`);
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as unknown as T;
      }
    } catch (error) {
      this.logger.error(`❌ Redis获取键值对失败: ${error.message}, key=${key}`);
      return null;
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redisClient.del(key);
      this.logger.debug(`Redis缓存删除: key=${key}`);
    } catch (error) {
      this.logger.error(`❌ Redis删除键值对失败: ${error.message}, key=${key}`);
      throw error;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redisClient.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(
        `❌ Redis检查键是否存在失败: ${error.message}, key=${key}`,
      );
      return false;
    }
  }

  // 发布订阅方法
  async publish(channel: string, message: any): Promise<void> {
    try {
      if (typeof message !== 'string') {
        message = JSON.stringify(message);
      }
      await this.redisClient.publish(channel, message);
      this.logger.debug(`Redis消息发布: channel=${channel}`);
    } catch (error) {
      this.logger.error(
        `❌ Redis发布消息失败: ${error.message}, channel=${channel}`,
      );
      throw error;
    }
  }

  async subscribe(
    channel: string,
    callback: (message: string) => void,
  ): Promise<void> {
    try {
      const subscriber = this.redisClient.duplicate();
      await subscriber.connect();
      this.logger.log(`Redis订阅频道: ${channel}`);

      await subscriber.subscribe(channel, (message) => {
        this.logger.debug(`Redis收到消息: channel=${channel}`);
        callback(message);
      });
    } catch (error) {
      this.logger.error(
        `❌ Redis订阅频道失败: ${error.message}, channel=${channel}`,
      );
      throw error;
    }
  }

  // 锁方法
  async acquireLock(
    lockName: string,
    ttl: number = 30,
  ): Promise<string | null> {
    try {
      const token = Math.random().toString(36).substring(2);
      const acquired = await this.redisClient.set(`lock:${lockName}`, token, {
        NX: true,
        EX: ttl,
      });

      if (acquired) {
        this.logger.debug(`Redis获取锁成功: ${lockName}, ttl=${ttl}秒`);
      } else {
        this.logger.debug(`Redis获取锁失败: ${lockName}, 锁已被占用`);
      }

      return acquired ? token : null;
    } catch (error) {
      this.logger.error(
        `❌ Redis获取锁失败: ${error.message}, lockName=${lockName}`,
      );
      return null;
    }
  }

  async releaseLock(lockName: string, token: string): Promise<boolean> {
    try {
      const script = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("del", KEYS[1])
        else
          return 0
        end
      `;

      const result = await this.redisClient.eval(script, {
        keys: [`lock:${lockName}`],
        arguments: [token],
      });

      const released = result === 1;
      if (released) {
        this.logger.debug(`Redis释放锁成功: ${lockName}`);
      } else {
        this.logger.debug(`Redis释放锁失败: ${lockName}, 令牌不匹配或锁不存在`);
      }

      return released;
    } catch (error) {
      this.logger.error(
        `❌ Redis释放锁失败: ${error.message}, lockName=${lockName}`,
      );
      return false;
    }
  }
}
