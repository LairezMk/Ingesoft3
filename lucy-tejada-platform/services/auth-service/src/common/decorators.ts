/**
 * ============================================
 * DECORADORES LOCALES - AUTH SERVICE
 * ============================================
 */

import { SetMetadata, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRole, AuthenticatedUser } from './types.js';

// Constantes para metadata
export const IS_PUBLIC_KEY = 'isPublic';
export const ROLES_KEY = 'roles';

/**
 * Decorador para marcar rutas como públicas (sin autenticación)
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/**
 * Decorador para especificar roles permitidos
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

/**
 * Decorador para obtener el usuario actual del request
 */
export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext): AuthenticatedUser | unknown => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser;

    if (data) {
      return user?.[data];
    }

    return user;
  },
);
