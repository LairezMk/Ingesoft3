/**
 * ============================================
 * ACADEMIC SERVICE - ENTRY POINT
 * ============================================
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const logger = new Logger('AcademicService');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('ACADEMIC_SERVICE_PORT') || 3002;
  const env = configService.get<string>('NODE_ENV') || 'development';

  app.use(helmet());

  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  });

  app.setGlobalPrefix('api/v1');

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

  await app.listen(port);

  logger.log(`📚 Academic Service running on port ${port} in ${env} mode`);
  logger.log(`📡 API endpoint: http://localhost:${port}/api/v1`);
}

bootstrap().catch((error) => {
  console.error('Failed to start Academic Service:', error);
  process.exit(1);
});
