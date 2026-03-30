/**
 * ============================================
 * DECORADORES PERSONALIZADOS - LUCY TEJADA
 * ============================================
 */

import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { UserRole } from '@lucy-tejada/types';

/**
 * Decorador para obtener el usuario actual del request
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (data) {
      return user?.[data];
    }

    return user;
  }
);

/**
 * Key para metadata de roles
 */
export const ROLES_KEY = 'roles';

/**
 * Decorador para especificar roles permitidos
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

/**
 * Key para metadata de permisos
 */
export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorador para especificar permisos requeridos
 */
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

/**
 * Key para rutas públicas
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorador para marcar rutas como públicas (sin autenticación)
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/**
 * Key para auditoría
 */
export const AUDIT_KEY = 'audit';

/**
 * Decorador para habilitar auditoría en endpoints
 */
export const Audit = (entityType: string, action?: string) =>
  SetMetadata(AUDIT_KEY, { entityType, action });

/**
 * Key para caché
 */
export const CACHE_KEY = 'cache';

/**
 * Decorador para configurar caché en endpoints
 */
export const CacheResponse = (ttl: number = 60, key?: string) =>
  SetMetadata(CACHE_KEY, { ttl, key });

/**
 * Key para rate limiting
 */
export const RATE_LIMIT_KEY = 'rateLimit';

/**
 * Decorador para configurar rate limiting personalizado
 */
export const RateLimit = (limit: number, windowMs: number = 60000) =>
  SetMetadata(RATE_LIMIT_KEY, { limit, windowMs });

/**
 * Decorador para obtener IP del cliente
 */
export const ClientIP = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return (
      request.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      request.headers['x-real-ip'] ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      'unknown'
    );
  }
);

/**
 * Decorador para obtener User-Agent
 */
export const UserAgent = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers['user-agent'] || 'unknown';
  }
);

/**
 * Decorador para obtener el ID de sesión
 */
export const SessionId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.sessionId;
  }
);
