/**
 * ============================================
 * AUTH SERVICE - CONFIGURACIÓN
 * ============================================
 */

import { registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => ({
  type: 'postgres' as const,
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  database: process.env.DATABASE_NAME || 'lucy_tejada_db',
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || '',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.DATABASE_SSL === 'true',
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/migrations/*.js'],
  autoLoadEntities: true,
}));

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'your-secret-key',
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
}));

export const redisConfig = registerAs('redis', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0', 10),
  ttl: parseInt(process.env.REDIS_TTL || '3600', 10),
}));

export const appConfig = registerAs('app', () => ({
  name: 'auth-service',
  port: parseInt(process.env.AUTH_SERVICE_PORT || '3001', 10),
  env: process.env.NODE_ENV || 'development',
  maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10),
  lockoutDurationMinutes: parseInt(process.env.LOCKOUT_DURATION_MINUTES || '30', 10),
  sessionTimeoutMinutes: parseInt(process.env.SESSION_TIMEOUT_MINUTES || '60', 10),
}));
