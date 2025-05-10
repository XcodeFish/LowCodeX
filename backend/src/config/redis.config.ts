import { registerAs } from '@nestjs/config';

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  url: string;
}

export default registerAs('redis', (): RedisConfig => {
  const host = process.env.REDIS_HOST || 'localhost';
  const port = parseInt(process.env.REDIS_PORT || '6379', 10);
  const password = process.env.REDIS_PASSWORD || '';
  const db = parseInt(process.env.REDIS_DB || '0', 10);

  const authPart = password ? `:${password}@` : '';
  const url = `redis://${authPart}${host}:${port}/${db}`;

  return {
    host,
    port,
    password,
    db,
    url,
  };
});
