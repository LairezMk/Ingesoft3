/**
 * ============================================
 * AUTH CONTROLLER - ENDPOINTS DE AUTENTICACIÓN
 * ============================================
 */

import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Req,
  Headers,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService, AuthResponse } from './auth.service.js';
import {
  LoginDto,
  RefreshTokenDto,
  ChangePasswordDto,
  CreateUserDto,
  LogoutDto,
} from './dto/auth.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { RolesGuard, Public, Roles, CurrentUser, UserRole, AuthenticatedUser } from '../../common/index.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/login
   * Iniciar sesión con email y contraseña
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Headers('user-agent') userAgent?: string
  ): Promise<AuthResponse> {
    const ipAddress = this.getClientIP(req);
    return this.authService.login(dto, ipAddress, userAgent);
  }

  /**
   * POST /auth/refresh
   * Renovar tokens usando refresh token
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @Body() dto: RefreshTokenDto,
    @Req() req: Request,
    @Headers('user-agent') userAgent?: string
  ): Promise<AuthResponse> {
    const ipAddress = this.getClientIP(req);
    return this.authService.refreshTokens(dto, ipAddress, userAgent);
  }

  /**
   * POST /auth/logout
   * Cerrar sesión
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: LogoutDto,
    @Req() req: Request,
    @Headers('user-agent') userAgent?: string
  ): Promise<{ message: string }> {
    const ipAddress = this.getClientIP(req);
    await this.authService.logout(
      user.id,
      user.sessionId,
      dto.allDevices ?? false,
      ipAddress,
      userAgent
    );
    return { message: 'Sesión cerrada exitosamente' };
  }

  /**
   * POST /auth/change-password
   * Cambiar contraseña del usuario actual
   */
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ChangePasswordDto,
    @Req() req: Request,
    @Headers('user-agent') userAgent?: string
  ): Promise<{ message: string }> {
    const ipAddress = this.getClientIP(req);
    await this.authService.changePassword(user.id, dto, ipAddress, userAgent);
    return { message: 'Contraseña actualizada exitosamente' };
  }

  /**
   * GET /auth/me
   * Obtener información del usuario actual
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getCurrentUser(
    @CurrentUser() user: AuthenticatedUser
  ): Promise<{ id: string; email: string; role: UserRole }> {
    const fullUser = await this.authService.getUserById(user.id);
    if (!fullUser) {
      throw new Error('Usuario no encontrado');
    }
    return {
      id: fullUser.id,
      email: fullUser.email,
      role: fullUser.role,
    };
  }

  /**
   * POST /auth/users
   * Crear nuevo usuario (solo administradores)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('users')
  @HttpCode(HttpStatus.CREATED)
  async createUser(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateUserDto,
    @Req() req: Request,
    @Headers('user-agent') userAgent?: string
  ): Promise<{ id: string; email: string; role: UserRole; message: string }> {
    const ipAddress = this.getClientIP(req);
    const newUser = await this.authService.createUser(
      dto,
      user.id,
      ipAddress,
      userAgent
    );
    return {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      message: 'Usuario creado exitosamente',
    };
  }

  /**
   * GET /auth/validate
   * Validar token actual
   */
  @UseGuards(JwtAuthGuard)
  @Get('validate')
  async validateToken(
    @CurrentUser() user: AuthenticatedUser
  ): Promise<{ valid: boolean; user: AuthenticatedUser }> {
    return { valid: true, user };
  }

  /**
   * Obtener IP del cliente
   */
  private getClientIP(req: Request): string {
    return (
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      (req.headers['x-real-ip'] as string) ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      '127.0.0.1'
    );
  }
}
