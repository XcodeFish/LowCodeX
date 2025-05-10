import { registerAs } from '@nestjs/config';

export enum LogLevelEnum {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  VERBOSE = 'verbose',
}

export interface LoggerConfig {
  level: LogLevelEnum;
  filePath: string;
  maxFiles: number;
  maxSize: number; // MB
}

export default registerAs('logger', (): LoggerConfig => {
  const level = (process.env.LOG_LEVEL || 'info').toLowerCase();

  return {
    level: validateLogLevel(level),
    filePath: process.env.LOG_FILE_PATH || 'logs/app.log',
    maxFiles: parseInt(process.env.LOG_MAX_FILES || '5', 10),
    maxSize: parseInt(process.env.LOG_MAX_SIZE || '10', 10),
  };
});

// 验证日志级别是否有效，如果无效则返回默认值
function validateLogLevel(level: string): LogLevelEnum {
  const validLevels = Object.values(LogLevelEnum);
  if (validLevels.includes(level as LogLevelEnum)) {
    return level as LogLevelEnum;
  }
  return LogLevelEnum.INFO;
}
