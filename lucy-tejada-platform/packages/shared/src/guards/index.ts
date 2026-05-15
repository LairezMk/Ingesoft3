/**
 * ============================================
 * GUARDS DE AUTENTICACIÓN - LUCY TEJADA
 * ============================================
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole, RBAC_PERMISSIONS, type RBACPermission } from '@lucy-tejada/types';
import { ROLES_KEY, PERMISSIONS_KEY, IS_PUBLIC_KEY } from '../decorators/index.js';

/**
 * Guard para verificar roles
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Verificar si es ruta pública
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Obtener roles requeridos
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Obtener usuario del request
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    // Admin tiene acceso a todo
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    // Verificar si el usuario tiene alguno de los roles requeridos
    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      throw new ForbiddenException(
        'No tiene permisos suficientes para acceder a este recurso'
      );
    }

    return true;
  }
}

/**
 * Guard para verificar permisos específicos
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Verificar si es ruta pública
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Obtener permisos requeridos
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // Obtener usuario del request
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    // Admin tiene acceso a todo
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    // Obtener permisos del rol del usuario
    const rolePermissions: RBACPermission[] = RBAC_PERMISSIONS[user.role as UserRole] || [];

    // Verificar cada permiso requerido
    const hasPermissions = requiredPermissions.every((required) => {
      const [resource, action] = required.split(':');
      return rolePermissions.some(
        (permission) =>
          (permission.resource === '*' || permission.resource === resource) &&
          (permission.actions.includes('manage') ||
            permission.actions.includes(action as never))
      );
    });

    if (!hasPermissions) {
      throw new ForbiddenException(
        'No tiene permisos suficientes para realizar esta acción'
      );
    }

    return true;
  }
}

/**
 * Guard combinado para roles y permisos
 */
@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    private rolesGuard: RolesGuard,
    private permissionsGuard: PermissionsGuard
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rolesAllowed = await this.rolesGuard.canActivate(context);
    if (!rolesAllowed) return false;

    const permissionsAllowed = await this.permissionsGuard.canActivate(context);
    return permissionsAllowed;
  }
}
