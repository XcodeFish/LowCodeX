import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../../services/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
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
  controllers: [UsersController],
  providers: [UsersService, PrismaService],
  exports: [UsersService, JwtModule],
})
export class UsersModule {}
