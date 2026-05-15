/**
 * ============================================
 * JWT AUTH GUARD - ACADEMIC SERVICE
 * ============================================
 */

import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '@lucy-tejada/shared';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  override canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  override handleRequest<TUser = unknown>(
    err: Error | null,
    user: TUser,
    info: unknown
  ): TUser {
    if (err || !user) {
      if (info && typeof info === 'object' && 'name' in info) {
        const errorInfo = info as { name: string; message?: string };
        if (errorInfo.name === 'TokenExpiredError') {
          throw new UnauthorizedException('Token expirado');
        }
        if (errorInfo.name === 'JsonWebTokenError') {
          throw new UnauthorizedException('Token inválido');
        }
      }
      throw err || new UnauthorizedException('No autorizado');
    }

    return user;
  }
}
