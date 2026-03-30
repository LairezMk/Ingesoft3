/**
 * ============================================
 * CONFIGURACIÓN DE SERVICIOS - LUCY TEJADA
 * ============================================
 */

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  poolMin: number;
  poolMax: number;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  ttl: number;
}

export interface JwtConfig {
  secret: string;
  expiresIn: string;
  refreshSecret: string;
  refreshExpiresIn: string;
}

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  fromName: string;
  fromEmail: string;
}

export interface S3Config {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucket: string;
  endpoint?: string;
}

export interface AppConfig {
  name: string;
  version: string;
  env: string;
  port: number;
  host: string;
  apiPrefix: string;
}

export interface ServiceConfig {
  app: AppConfig;
  database: DatabaseConfig;
  redis: RedisConfig;
  jwt: JwtConfig;
  smtp: SmtpConfig;
  s3: S3Config;
}

export const getEnvString = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`Environment variable ${key} is required`);
  }
  return value;
};

export const getEnvNumber = (key: string, defaultValue?: number): number => {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`Environment variable ${key} is required`);
  }
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a number`);
  }
  return parsed;
};

export const getEnvBoolean = (key: string, defaultValue?: boolean): boolean => {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`Environment variable ${key} is required`);
  }
  return value.toLowerCase() === 'true' || value === '1';
};

export const loadConfig = (): ServiceConfig => ({
  app: {
    name: getEnvString('APP_NAME', 'lucy-tejada-platform'),
    version: getEnvString('APP_VERSION', '1.0.0'),
    env: getEnvString('NODE_ENV', 'development'),
    port: getEnvNumber('PORT', 3000),
    host: getEnvString('HOST', '0.0.0.0'),
    apiPrefix: getEnvString('API_PREFIX', '/api/v1'),
  },
  database: {
    host: getEnvString('DATABASE_HOST', 'localhost'),
    port: getEnvNumber('DATABASE_PORT', 5432),
    database: getEnvString('DATABASE_NAME', 'lucy_tejada_db'),
    username: getEnvString('DATABASE_USER', 'postgres'),
    password: getEnvString('DATABASE_PASSWORD', ''),
    ssl: getEnvBoolean('DATABASE_SSL', false),
    poolMin: getEnvNumber('DATABASE_POOL_MIN', 2),
    poolMax: getEnvNumber('DATABASE_POOL_MAX', 10),
  },
  redis: {
    host: getEnvString('REDIS_HOST', 'localhost'),
    port: getEnvNumber('REDIS_PORT', 6379),
    password: process.env.REDIS_PASSWORD || undefined,
    db: getEnvNumber('REDIS_DB', 0),
    ttl: getEnvNumber('REDIS_TTL', 3600),
  },
  jwt: {
    secret: getEnvString('JWT_SECRET'),
    expiresIn: getEnvString('JWT_EXPIRES_IN', '24h'),
    refreshSecret: getEnvString('JWT_REFRESH_SECRET'),
    refreshExpiresIn: getEnvString('JWT_REFRESH_EXPIRES_IN', '7d'),
  },
  smtp: {
    host: getEnvString('SMTP_HOST', 'smtp.gmail.com'),
    port: getEnvNumber('SMTP_PORT', 587),
    secure: getEnvBoolean('SMTP_SECURE', false),
    user: getEnvString('SMTP_USER', ''),
    password: getEnvString('SMTP_PASSWORD', ''),
    fromName: getEnvString('SMTP_FROM_NAME', 'Centro Cultural Lucy Tejada'),
    fromEmail: getEnvString('SMTP_FROM_EMAIL', 'noreply@lucytejada.gov.co'),
  },
  s3: {
    accessKeyId: getEnvString('AWS_ACCESS_KEY_ID', ''),
    secretAccessKey: getEnvString('AWS_SECRET_ACCESS_KEY', ''),
    region: getEnvString('AWS_REGION', 'us-east-1'),
    bucket: getEnvString('AWS_S3_BUCKET', 'lucy-tejada-files'),
    endpoint: process.env.AWS_S3_ENDPOINT || undefined,
  },
});
