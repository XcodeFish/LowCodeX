import { registerAs } from '@nestjs/config';

export interface AppConfig {
  env: string;
  port: number;
  apiPrefix: string;
  apiVersion: string;
  useGlobalPrefix: boolean;
  cors: {
    origin: string;
    methods: string;
    credentials: boolean;
  };
}

export default registerAs(
  'app',
  (): AppConfig => ({
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '9000', 10),
    apiPrefix: process.env.API_PREFIX || 'api',
    apiVersion: process.env.API_VERSION || 'v1',
    useGlobalPrefix: process.env.GLOBAL_PREFIX === 'true',
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: process.env.CORS_METHODS || 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: process.env.CORS_CREDENTIALS === 'true',
    },
  }),
);
