import { registerAs } from '@nestjs/config';

export interface MailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
  preview: boolean;
  templateDir: string;
}

export default registerAs(
  'mail',
  (): MailConfig => ({
    host: process.env.MAIL_HOST || 'smtp.example.com',
    port: parseInt(process.env.MAIL_PORT || '587', 10),
    secure: process.env.MAIL_SECURE === 'true',
    auth: {
      user: process.env.MAIL_USER || 'user@example.com',
      pass: process.env.MAIL_PASSWORD || 'password',
    },
    from: process.env.MAIL_FROM || 'noreply@example.com',
    preview:
      process.env.MAIL_PREVIEW === 'true' ||
      process.env.NODE_ENV === 'development',
    templateDir: process.env.MAIL_TEMPLATE_DIR || 'src/modules/mail/templates',
  }),
);
