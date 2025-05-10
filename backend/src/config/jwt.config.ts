import { registerAs } from '@nestjs/config';

export interface JwtConfig {
  secret: string;
  expiresIn: string;
  refreshSecret?: string;
  refreshExpiresIn?: string;
}

export default registerAs(
  'jwt',
  (): JwtConfig => ({
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
    refreshSecret:
      process.env.JWT_REFRESH_SECRET ||
      process.env.JWT_SECRET ||
      'your-refresh-secret-key',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  }),
);
