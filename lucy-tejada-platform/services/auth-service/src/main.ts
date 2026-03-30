/**
 * ============================================
 * AUTH SERVICE - PUNTO DE ENTRADA
 * ============================================
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const logger = new Logger('AuthService');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port') || 3001;
  const env = configService.get<string>('app.env') || 'development';

  // Seguridad
  app.use(helmet());

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  });

  // Prefijo global
  app.setGlobalPrefix('api/v1');

  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // Iniciar servidor
  await app.listen(port);

  logger.log(`🔐 Auth Service running on port ${port} in ${env} mode`);
  logger.log(`📡 API endpoint: http://localhost:${port}/api/v1`);
}

bootstrap().catch((error) => {
  console.error('Failed to start Auth Service:', error);
  process.exit(1);
});
