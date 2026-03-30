/**
 * ============================================
 * APP MODULE - MÓDULO PRINCIPAL AUTH SERVICE
 * ============================================
 */

import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import {
  databaseConfig,
  jwtConfig,
  redisConfig,
  appConfig,
} from './config/index.js';

import { AuthModule } from './modules/auth/auth.module.js';

import {
  HttpExceptionFilter,
  AllExceptionsFilter,
  LoggingInterceptor,
  TransformInterceptor,
  RequestIdMiddleware,
  SecurityHeadersMiddleware,
} from './common/index.js';

@Module({
  imports: [
    // Configuración
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, redisConfig, appConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // Base de datos
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        database: configService.get<string>('database.database'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        ssl: configService.get<boolean>('database.ssl'),
        synchronize: false, // Usar migraciones en producción
        logging: configService.get<string>('app.env') === 'development',
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),

    // Módulos
    AuthModule,
  ],
  providers: [
    // Filtros globales
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },

    // Interceptores globales
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestIdMiddleware, SecurityHeadersMiddleware)
      .forRoutes('*');
  }
}
