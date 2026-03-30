/**
 * ============================================
 * TIPOS LOCALES - AUTH SERVICE
 * ============================================
 */

// Enums
export enum UserRole {
  ADMIN = 'ADMIN',
  DOCENTE = 'DOCENTE',
  ESTUDIANTE = 'ESTUDIANTE',
  AUXILIAR_ADMINISTRATIVO = 'AUXILIAR_ADMINISTRATIVO',
  OFICINA_JURIDICA = 'OFICINA_JURIDICA',
  TECNICO_OPERATIVO = 'TECNICO_OPERATIVO',
  OPERARIO_LOGISTICO = 'OPERARIO_LOGISTICO',
}

export enum UserStatus {
  PENDING = 'PENDING',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export enum AuditAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  EXPORT = 'EXPORT',
}

export enum DocumentType {
  CC = 'CC',
  TI = 'TI',
  CE = 'CE',
  PASSPORT = 'PASSPORT',
  PEP = 'PEP',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  NOT_SPECIFIED = 'NOT_SPECIFIED',
}

// Interfaces
export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  sessionId: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  sessionId: string;
}
