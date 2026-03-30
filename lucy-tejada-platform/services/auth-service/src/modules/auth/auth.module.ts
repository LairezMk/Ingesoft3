/**
 * ============================================
 * AUTH MODULE - MÓDULO DE AUTENTICACIÓN
 * ============================================
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';

import { User } from '../users/entities/user.entity.js';
import { PersonProfile } from '../users/entities/person-profile.entity.js';
import { RefreshToken } from '../sessions/entities/refresh-token.entity.js';
import { UserSession } from '../sessions/entities/user-session.entity.js';
import { AuditLog } from './entities/audit-log.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      PersonProfile,
      RefreshToken,
      UserSession,
      AuditLog,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn') || '24h',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
