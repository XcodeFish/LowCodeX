import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaService } from '../../services/prisma.service';
import { RedisService } from '../../services/redis.service';
import { AbilityFactory } from './ability.factory';
import { PermissionGuard } from './guards/permission.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { AuditLogService } from '../../modules/system/services/audit-log.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    PassportModule,
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'your-secret-key'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '24h'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    PrismaService,
    RedisService,
    AbilityFactory,
    AuditLogService,
    LocalAuthGuard,
    JwtAuthGuard,
    PermissionGuard,
    // 全局应用JWT认证守卫
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // 全局应用权限守卫
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
  ],
  exports: [
    AuthService,
    AbilityFactory,
    JwtAuthGuard,
    LocalAuthGuard,
    PermissionGuard,
    JwtModule,
  ],
})
export class AuthModule {}
