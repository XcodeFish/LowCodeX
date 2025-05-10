import {
  Injectable,
  LoggerService as NestLoggerService,
  LogLevel,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as winston from 'winston';
// 使用require导入，因为这个包没有提供TypeScript类型定义
// eslint-disable-next-line @typescript-eslint/no-var-requires
const DailyRotateFile = require('winston-daily-rotate-file');

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;
  private context?: string;

  constructor() {
    // 确保日志目录存在
    const logDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    // 创建Winston日志记录器
    this.logger = winston.createLogger({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json(),
      ),
      defaultMeta: { service: 'lowcodex-api' },
      transports: [
        // 控制台输出
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf((info) => {
              const { timestamp, level, message, context, ...meta } = info;
              return `[${timestamp}] [${level}] ${context ? `[${context}] ` : ''}${message} ${
                Object.keys(meta).length ? JSON.stringify(meta) : ''
              }`;
            }),
          ),
        }),
        // 按日期轮换记录错误日志
        new DailyRotateFile({
          filename: path.join(logDir, 'error-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
          level: 'error',
        }),
        // 按日期轮换记录所有日志
        new DailyRotateFile({
          filename: path.join(logDir, 'combined-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
        }),
      ],
    });
  }

  /**
   * 设置上下文
   */
  setContext(context: string) {
    this.context = context;
    return this;
  }

  /**
   * 记录日志
   */
  log(message: any, context?: string) {
    this.write('info', message, context);
  }

  /**
   * 记录错误日志
   */
  error(message: any, trace?: string, context?: string) {
    this.write('error', message, context, { trace });
  }

  /**
   * 记录警告日志
   */
  warn(message: any, context?: string) {
    this.write('warn', message, context);
  }

  /**
   * 记录调试日志
   */
  debug(message: any, context?: string) {
    this.write('debug', message, context);
  }

  /**
   * 记录详细日志
   */
  verbose(message: any, context?: string) {
    this.write('verbose', message, context);
  }

  /**
   * 设置日志级别
   */
  setLogLevels(levels: LogLevel[]) {
    // 实现日志级别过滤
    const winstonLevels = {
      error: 0,
      warn: 1,
      info: 2,
      verbose: 3,
      debug: 4,
    };

    // 根据传入的级别过滤
    const enabledLevels = Object.keys(winstonLevels)
      .filter((level) => levels.includes(level as LogLevel))
      .reduce((acc, level) => {
        acc[level] = winstonLevels[level];
        return acc;
      }, {});

    // 重新配置日志记录器
    if (Object.keys(enabledLevels).length > 0) {
      this.logger.configure({
        levels: enabledLevels,
      });
    }
  }

  /**
   * 写入日志
   */
  private write(level: string, message: any, context?: string, meta = {}) {
    const contextStr = context || this.context;
    if (message instanceof Error) {
      this.logger.log({
        level,
        message: message.message,
        stack: message.stack,
        context: contextStr,
        ...meta,
      });
    } else {
      this.logger.log({
        level,
        message,
        context: contextStr,
        ...meta,
      });
    }
  }
}
