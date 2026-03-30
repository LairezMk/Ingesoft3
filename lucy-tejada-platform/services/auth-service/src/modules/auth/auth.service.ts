/**
 * ============================================
 * AUTH SERVICE - LÓGICA DE AUTENTICACIÓN
 * ============================================
 */

import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { User } from '../users/entities/user.entity.js';
import { RefreshToken } from '../sessions/entities/refresh-token.entity.js';
import { UserSession } from '../sessions/entities/user-session.entity.js';
import { AuditLog } from './entities/audit-log.entity.js';
import {
  LoginDto,
  RefreshTokenDto,
  ChangePasswordDto,
  CreateUserDto,
} from './dto/auth.dto.js';
import { UserRole, UserStatus, AuditAction, JwtPayload } from '../../common/types.js';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    role: UserRole;
    status: UserStatus;
  };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly SALT_ROUNDS = 10;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(UserSession)
    private readonly sessionRepository: Repository<UserSession>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  /**
   * Autenticar usuario por email y contraseña
   */
  async login(
    dto: LoginDto,
    ipAddress: string,
    userAgent?: string
  ): Promise<AuthResponse> {
    const { email, password } = dto;

    // Buscar usuario
    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase(), isActive: true },
    });

    if (!user) {
      this.logger.warn(`Login fallido: usuario no encontrado - ${email}`);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar si cuenta está bloqueada
    if (user.isLocked()) {
      this.logger.warn(`Login fallido: cuenta bloqueada - ${email}`);
      throw new UnauthorizedException(
        'Cuenta bloqueada temporalmente. Intente más tarde.'
      );
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      await this.handleFailedLogin(user);
      this.logger.warn(`Login fallido: contraseña incorrecta - ${email}`);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar estado de la cuenta
    if (!user.canLogin()) {
      this.logger.warn(`Login fallido: cuenta inactiva - ${email}`);
      throw new UnauthorizedException(
        'Cuenta no activa. Contacte al administrador.'
      );
    }

    // Resetear intentos fallidos
    await this.resetFailedLoginAttempts(user);

    // Crear sesión
    const sessionId = uuidv4();
    const session = await this.createSession(user, sessionId, ipAddress, userAgent);

    // Generar tokens
    const tokens = await this.generateTokens(user, sessionId);

    // Guardar refresh token
    await this.saveRefreshToken(
      user.id,
      tokens.refreshToken,
      ipAddress,
      userAgent
    );

    // Actualizar último login
    await this.userRepository.update(user.id, {
      lastLoginAt: new Date(),
    });

    // Registrar auditoría
    await this.createAuditLog({
      userId: user.id,
      userName: user.email,
      userRole: user.role,
      action: AuditAction.LOGIN,
      entityType: 'User',
      entityId: user.id,
      tableName: 'users',
      ipAddress,
      userAgent,
      sessionId,
      description: `Usuario ${user.email} inició sesión`,
    });

    this.logger.log(`Login exitoso: ${email}`);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    };
  }

  /**
   * Renovar tokens usando refresh token
   */
  async refreshTokens(
    dto: RefreshTokenDto,
    ipAddress: string,
    userAgent?: string
  ): Promise<AuthResponse> {
    const { refreshToken } = dto;

    // Buscar refresh token
    const storedToken = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken, isActive: true },
      relations: ['user'],
    });

    if (!storedToken || !storedToken.isValid()) {
      throw new UnauthorizedException('Token de actualización inválido');
    }

    const user = storedToken.user;

    if (!user || !user.canLogin()) {
      throw new UnauthorizedException('Usuario no autorizado');
    }

    // Revocar token actual
    await this.refreshTokenRepository.update(storedToken.id, {
      revokedAt: new Date(),
    });

    // Crear nueva sesión
    const sessionId = uuidv4();
    await this.createSession(user, sessionId, ipAddress, userAgent);

    // Generar nuevos tokens
    const tokens = await this.generateTokens(user, sessionId);

    // Guardar nuevo refresh token
    await this.saveRefreshToken(
      user.id,
      tokens.refreshToken,
      ipAddress,
      userAgent
    );

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    };
  }

  /**
   * Cerrar sesión
   */
  async logout(
    userId: string,
    sessionId: string,
    allDevices: boolean = false,
    ipAddress: string,
    userAgent?: string
  ): Promise<void> {
    if (allDevices) {
      // Revocar todos los refresh tokens del usuario
      await this.refreshTokenRepository.update(
        { userId, isActive: true },
        { revokedAt: new Date(), isActive: false }
      );

      // Invalidar todas las sesiones
      await this.sessionRepository.update(
        { userId, isActive: true },
        { isValid: false, isActive: false }
      );
    } else {
      // Invalidar solo la sesión actual
      await this.sessionRepository.update(
        { sessionId },
        { isValid: false, isActive: false }
      );
    }

    // Registrar auditoría
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user) {
      await this.createAuditLog({
        userId,
        userName: user.email,
        userRole: user.role,
        action: AuditAction.LOGOUT,
        entityType: 'User',
        entityId: userId,
        tableName: 'users',
        ipAddress,
        userAgent,
        sessionId,
        description: `Usuario ${user.email} cerró sesión${allDevices ? ' en todos los dispositivos' : ''}`,
      });
    }

    this.logger.log(`Logout exitoso: userId=${userId}`);
  }

  /**
   * Cambiar contraseña
   */
  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
    ipAddress: string,
    userAgent?: string
  ): Promise<void> {
    const { currentPassword, newPassword, confirmPassword } = dto;

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // Verificar contraseña actual
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('La contraseña actual es incorrecta');
    }

    // Hashear nueva contraseña
    const newPasswordHash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

    // Actualizar contraseña
    await this.userRepository.update(userId, {
      passwordHash: newPasswordHash,
      mustChangePassword: false,
    });

    // Registrar auditoría
    await this.createAuditLog({
      userId,
      userName: user.email,
      userRole: user.role,
      action: AuditAction.UPDATE,
      entityType: 'User',
      entityId: userId,
      tableName: 'users',
      ipAddress,
      userAgent,
      changedFields: ['passwordHash'],
      description: `Usuario ${user.email} cambió su contraseña`,
    });

    this.logger.log(`Contraseña cambiada: userId=${userId}`);
  }

  /**
   * Crear nuevo usuario (solo admin)
   */
  async createUser(
    dto: CreateUserDto,
    createdById: string,
    ipAddress: string,
    userAgent?: string
  ): Promise<User> {
    const { email, password, role } = dto;

    // Verificar si email ya existe
    const existingUser = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new BadRequestException('El correo electrónico ya está registrado');
    }

    // Hashear contraseña
    const passwordHash = await bcrypt.hash(password, this.SALT_ROUNDS);

    // Crear usuario
    const user = this.userRepository.create({
      email: email.toLowerCase(),
      passwordHash,
      role,
      status: UserStatus.ACTIVE,
      mustChangePassword: true,
    });

    const savedUser = await this.userRepository.save(user);

    // Obtener datos del creador para auditoría
    const creator = await this.userRepository.findOne({ where: { id: createdById } });

    // Registrar auditoría
    await this.createAuditLog({
      userId: createdById,
      userName: creator?.email ?? 'system',
      userRole: creator?.role ?? UserRole.ADMIN,
      action: AuditAction.CREATE,
      entityType: 'User',
      entityId: savedUser.id,
      tableName: 'users',
      ipAddress,
      userAgent,
      newData: {
        id: savedUser.id,
        email: savedUser.email,
        role: savedUser.role,
        status: savedUser.status,
      },
      description: `Usuario ${savedUser.email} creado por ${creator?.email ?? 'system'}`,
    });

    this.logger.log(`Usuario creado: ${savedUser.email}`);

    return savedUser;
  }

  /**
   * Validar sesión activa
   */
  async validateSession(sessionId: string): Promise<UserSession | null> {
    const session = await this.sessionRepository.findOne({
      where: {
        sessionId,
        isActive: true,
        isValid: true,
        expiresAt: MoreThan(new Date()),
      },
    });

    if (session) {
      // Actualizar última actividad
      await this.sessionRepository.update(session.id, {
        lastActivityAt: new Date(),
      });
    }

    return session;
  }

  /**
   * Obtener usuario por ID
   */
  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id, isActive: true },
    });
  }

  // ============================================
  // MÉTODOS PRIVADOS
  // ============================================

  private async generateTokens(
    user: User,
    sessionId: string
  ): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      sessionId,
    };

    const jwtSecret = this.configService.get<string>('jwt.secret');
    const jwtExpiresIn = this.configService.get<string>('jwt.expiresIn') || '24h';
    const refreshSecret = this.configService.get<string>('jwt.refreshSecret');
    const refreshExpiresIn = this.configService.get<string>('jwt.refreshExpiresIn') || '7d';

    const accessToken = this.jwtService.sign(payload, {
      secret: jwtSecret,
      expiresIn: jwtExpiresIn,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshSecret,
      expiresIn: refreshExpiresIn,
    });

    // Calcular expiración en segundos
    const expiresIn = this.parseExpiresIn(jwtExpiresIn);

    return { accessToken, refreshToken, expiresIn };
  }

  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 86400; // default 24h

    const value = parseInt(match[1] ?? '0', 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        return 86400;
    }
  }

  private async saveRefreshToken(
    userId: string,
    token: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<RefreshToken> {
    const expiresIn = this.configService.get<string>('jwt.refreshExpiresIn') || '7d';
    const expiresInSeconds = this.parseExpiresIn(expiresIn);
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

    const refreshToken = this.refreshTokenRepository.create({
      userId,
      token,
      expiresAt,
      ipAddress,
      userAgent,
    });

    return this.refreshTokenRepository.save(refreshToken);
  }

  private async createSession(
    user: User,
    sessionId: string,
    ipAddress: string,
    userAgent?: string
  ): Promise<UserSession> {
    const sessionTimeoutMinutes = this.configService.get<number>('app.sessionTimeoutMinutes') || 60;
    const expiresAt = new Date(Date.now() + sessionTimeoutMinutes * 60 * 1000);

    const session = this.sessionRepository.create({
      userId: user.id,
      sessionId,
      ipAddress,
      userAgent,
      expiresAt,
    });

    return this.sessionRepository.save(session);
  }

  private async handleFailedLogin(user: User): Promise<void> {
    const maxAttempts = this.configService.get<number>('app.maxLoginAttempts') || 5;
    const lockoutMinutes = this.configService.get<number>('app.lockoutDurationMinutes') || 30;

    const newAttempts = user.failedLoginAttempts + 1;

    if (newAttempts >= maxAttempts) {
      await this.userRepository.update(user.id, {
        failedLoginAttempts: newAttempts,
        lockedUntil: new Date(Date.now() + lockoutMinutes * 60 * 1000),
      });
    } else {
      await this.userRepository.update(user.id, {
        failedLoginAttempts: newAttempts,
      });
    }
  }

  private async resetFailedLoginAttempts(user: User): Promise<void> {
    if (user.failedLoginAttempts > 0) {
      await this.userRepository.update(user.id, {
        failedLoginAttempts: 0,
        lockedUntil: undefined,
      });
    }
  }

  private async createAuditLog(data: Partial<AuditLog>): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create(data);
    return this.auditLogRepository.save(auditLog);
  }
}
