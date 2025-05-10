import { registerAs } from '@nestjs/config';

export interface DatabaseConfig {
  url: string;
  type: string;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  synchronize: boolean;
  logging: boolean;
}

export default registerAs('database', (): DatabaseConfig => {
  // 确保DATABASE_URL存在，这是Prisma必需的
  const url = process.env.DATABASE_URL || buildDatabaseUrl();

  return {
    url,
    type: process.env.DB_TYPE || 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_DATABASE || 'lowCode_dev',
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: process.env.DB_LOGGING === 'true',
  };
});

// 如果DATABASE_URL未定义，基于其他数据库配置构建连接字符串
function buildDatabaseUrl(): string {
  const dbType = process.env.DB_TYPE || 'mysql';
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = process.env.DB_PORT || '3306';
  const dbUsername = process.env.DB_USERNAME || 'root';
  const dbPassword = process.env.DB_PASSWORD || 'root';
  const dbName = process.env.DB_DATABASE || 'lowCode_dev';

  return `${dbType}://${dbUsername}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;
}
