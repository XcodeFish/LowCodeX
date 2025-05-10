import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import { LoggerConfig, LogLevelEnum } from '../config';

// 日志级别映射
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  VERBOSE = 4,
}

@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly logLevelMap = {
    [LogLevelEnum.ERROR]: LogLevel.ERROR,
    [LogLevelEnum.WARN]: LogLevel.WARN,
    [LogLevelEnum.INFO]: LogLevel.INFO,
    [LogLevelEnum.DEBUG]: LogLevel.DEBUG,
    [LogLevelEnum.VERBOSE]: LogLevel.VERBOSE,
  };

  private readonly logDir: string;
  private readonly logLevel: LogLevel;
  private readonly maxLogFiles: number;
  private readonly maxFileSize: number; // 单位: bytes
  private currentLogFile: string;
  private currentFileSize: number = 0;
  private logStream: fs.WriteStream | null = null;

  constructor(private configService: ConfigService) {
    const loggerConfig = this.configService.get<LoggerConfig>('logger');

    if (!loggerConfig) {
      throw new Error('日志配置未找到');
    }

    this.logDir = loggerConfig.filePath;
    const logDirPath = path.dirname(this.logDir);

    // 确保日志目录存在
    if (!fs.existsSync(logDirPath)) {
      fs.mkdirSync(logDirPath, { recursive: true });
    }

    // 设置日志级别
    this.logLevel = this.logLevelMap[loggerConfig.level] ?? LogLevel.INFO;

    // 设置日志文件轮转配置
    this.maxLogFiles = loggerConfig.maxFiles;
    this.maxFileSize = loggerConfig.maxSize * 1024 * 1024; // 转换为字节

    this.initLogFile();
  }

  private initLogFile(): void {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.currentLogFile = path.resolve(this.logDir);

    // 确保旧的日志流被关闭
    if (this.logStream) {
      this.logStream.end();
      this.logStream = null;
    }

    // 创建一个新的写入流
    this.logStream = fs.createWriteStream(this.currentLogFile, { flags: 'a' });
    this.currentFileSize = fs.existsSync(this.currentLogFile)
      ? fs.statSync(this.currentLogFile).size
      : 0;

    // 检查并清理旧日志文件
    this.cleanupOldLogFiles();
  }

  private cleanupOldLogFiles(): void {
    const logDirPath = path.dirname(this.logDir);
    if (!fs.existsSync(logDirPath)) return;

    const files = fs
      .readdirSync(logDirPath)
      .filter((file) => file.endsWith('.log'))
      .map((file) => ({
        name: file,
        path: path.join(logDirPath, file),
        time: fs.statSync(path.join(logDirPath, file)).mtime.getTime(),
      }))
      .sort((a, b) => b.time - a.time);

    // 保留最新的 maxLogFiles 个文件，删除其余的
    if (files.length > this.maxLogFiles) {
      files.slice(this.maxLogFiles).forEach((file) => {
        try {
          fs.unlinkSync(file.path);
        } catch (error) {
          console.error(`无法删除日志文件 ${file.path}: ${error.message}`);
        }
      });
    }
  }

  private checkRotation(): void {
    if (this.currentFileSize >= this.maxFileSize) {
      this.initLogFile();
    }
  }

  private formatMessage(level: string, message: any, context?: string): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? `[${context}] ` : '';
    const formattedMessage =
      typeof message === 'object'
        ? util.inspect(message, { depth: null })
        : message;

    return `${timestamp} ${level.toUpperCase()} ${contextStr}${formattedMessage}\n`;
  }

  private writeLog(level: LogLevel, message: string): void {
    if (level > this.logLevel) return;

    // 确保日志流存在
    if (!this.logStream) {
      this.initLogFile();
    }

    // 写入日志并更新文件大小
    const logSize = Buffer.byteLength(message);
    this.logStream?.write(message);
    this.currentFileSize += logSize;

    // 检查是否需要轮转日志文件
    this.checkRotation();
  }

  log(message: any, context?: string): void {
    const formattedMessage = this.formatMessage('info', message, context);
    this.writeLog(LogLevel.INFO, formattedMessage);
    console.log(formattedMessage.trimEnd());
  }

  error(message: any, trace?: string, context?: string): void {
    const errorMessage = trace ? `${message}\n${trace}` : message;
    const formattedMessage = this.formatMessage('error', errorMessage, context);
    this.writeLog(LogLevel.ERROR, formattedMessage);
    console.error(formattedMessage.trimEnd());
  }

  warn(message: any, context?: string): void {
    const formattedMessage = this.formatMessage('warn', message, context);
    this.writeLog(LogLevel.WARN, formattedMessage);
    console.warn(formattedMessage.trimEnd());
  }

  debug(message: any, context?: string): void {
    const formattedMessage = this.formatMessage('debug', message, context);
    this.writeLog(LogLevel.DEBUG, formattedMessage);
    console.debug(formattedMessage.trimEnd());
  }

  verbose(message: any, context?: string): void {
    const formattedMessage = this.formatMessage('verbose', message, context);
    this.writeLog(LogLevel.VERBOSE, formattedMessage);
    console.log(formattedMessage.trimEnd());
  }
}
