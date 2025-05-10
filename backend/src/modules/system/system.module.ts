import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../../services/prisma.module';
import { AuditLogService } from './services/audit-log.service';
import { LoggerService } from './services/logger.service';
import { ConfigService } from './services/config.service';
import { SystemSettingsController } from './controllers/system-settings.controller';
import { AuditLogController } from './controllers/audit-log.controller';
import { JwtModule } from '@nestjs/jwt';
import {
  ConfigModule as NestConfigModule,
  ConfigService as NestConfigService,
} from '@nestjs/config';
import { AbilityFactory } from '../auth/ability.factory';

@Module({
  imports: [
    PrismaModule,
    NestConfigModule,
    JwtModule.registerAsync({
      imports: [NestConfigModule],
      inject: [NestConfigService],
      useFactory: (configService: NestConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'your-secret-key'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '24h'),
        },
      }),
    }),
  ],
  controllers: [SystemSettingsController, AuditLogController],
  providers: [AuditLogService, LoggerService, ConfigService, AbilityFactory],
  exports: [AuditLogService, LoggerService, ConfigService],
})
export class SystemModule {}
