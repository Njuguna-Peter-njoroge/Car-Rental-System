import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './Guards/jwt/jwt-auth.guard/jwt-auth.guard';
import { PermissionsGuard } from './Guards/permissions.guard';
import { RolesGuard } from './Guards/roles.guard';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtService as CustomJwtService } from '../../Shared/Utils/jwt.service';
import { MailerModule } from '../../Shared/Utils/mailer.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    MailerModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'default-secret',
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '24h',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtAuthGuard,
    PermissionsGuard,
    RolesGuard,
    CustomJwtService,
  ],
  exports: [
    AuthService,
    JwtAuthGuard,
    PermissionsGuard,
    RolesGuard,
    CustomJwtService,
    JwtModule,
  ],
})
export class AuthModule {}
