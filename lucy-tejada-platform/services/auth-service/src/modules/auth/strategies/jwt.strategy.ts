/**
 * ============================================
 * JWT STRATEGY - ESTRATEGIA DE AUTENTICACIÓN
 * ============================================
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service.js';
import { JwtPayload, AuthenticatedUser } from '../../../common/types.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private authService: AuthService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    // Validar que la sesión exista y sea válida
    const session = await this.authService.validateSession(payload.sessionId);

    if (!session) {
      throw new UnauthorizedException('Sesión inválida o expirada');
    }

    // Verificar que el usuario exista y esté activo
    const user = await this.authService.getUserById(payload.sub);

    if (!user || !user.canLogin()) {
      throw new UnauthorizedException('Usuario no autorizado');
    }

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      sessionId: payload.sessionId,
    };
  }
}
