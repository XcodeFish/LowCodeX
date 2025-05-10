import appConfig, { AppConfig } from './app.config';
import databaseConfig, { DatabaseConfig } from './database.config';
import jwtConfig, { JwtConfig } from './jwt.config';
import loggerConfig, { LoggerConfig, LogLevelEnum } from './logger.config';
import redisConfig, { RedisConfig } from './redis.config';
import tenantConfig, { TenantConfig, TenantModeEnum } from './tenant.config';
import mailConfig, { MailConfig } from './mail.config';

// 导出所有配置
export {
  appConfig,
  databaseConfig,
  jwtConfig,
  loggerConfig,
  redisConfig,
  tenantConfig,
  mailConfig,
};

// 导出所有配置接口
export {
  AppConfig,
  DatabaseConfig,
  JwtConfig,
  LoggerConfig,
  LogLevelEnum,
  RedisConfig,
  TenantConfig,
  TenantModeEnum,
  MailConfig,
};

// 导出配置加载所需的模块数组
export const configModules = [
  appConfig,
  databaseConfig,
  jwtConfig,
  loggerConfig,
  redisConfig,
  tenantConfig,
  mailConfig,
];
