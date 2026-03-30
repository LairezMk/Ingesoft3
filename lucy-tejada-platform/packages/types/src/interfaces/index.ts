/**
 * ============================================
 * INTERFACES - PLATAFORMA LUCY TEJADA
 * Interfaces de servicio y utilidades
 * ============================================
 */

import { UserRole } from '../enums/index.js';

/**
 * Payload del JWT Token
 */
export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  sessionId: string;
  iat?: number;
  exp?: number;
}

/**
 * Usuario autenticado en el request
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  sessionId: string;
}

/**
 * Configuración de permisos RBAC
 */
export interface RBACPermission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete' | 'manage')[];
}

/**
 * Configuración de rol
 */
export interface RoleConfig {
  role: UserRole;
  permissions: RBACPermission[];
  inherits?: UserRole[];
}

/**
 * Respuesta de API estándar
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: ApiError[];
  timestamp: string;
  path: string;
  requestId: string;
}

/**
 * Error de API
 */
export interface ApiError {
  code: string;
  message: string;
  field?: string;
  details?: unknown;
}

/**
 * Opciones de paginación
 */
export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Resultado paginado
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Filtros de búsqueda base
 */
export interface BaseSearchFilters {
  search?: string;
  isActive?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
}

/**
 * Contexto de auditoría
 */
export interface AuditContext {
  userId: string;
  userName: string;
  userRole: UserRole;
  ipAddress: string;
  userAgent?: string;
  sessionId?: string;
}

/**
 * Configuración de email
 */
export interface EmailConfig {
  to: string | string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  template: string;
  data: Record<string, unknown>;
  attachments?: EmailAttachment[];
}

/**
 * Adjunto de email
 */
export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType: string;
}

/**
 * Configuración de upload de archivos
 */
export interface FileUploadConfig {
  maxSize: number;
  allowedMimeTypes: string[];
  destination: string;
  generateUniqueName: boolean;
}

/**
 * Resultado de upload
 */
export interface FileUploadResult {
  originalName: string;
  storedName: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
}

/**
 * Configuración de caché
 */
export interface CacheConfig {
  ttl: number;
  prefix: string;
  serialize?: boolean;
}

/**
 * Opciones de generación de reporte
 */
export interface ReportOptions {
  title: string;
  subtitle?: string;
  author: string;
  orientation?: 'portrait' | 'landscape';
  pageSize?: 'A4' | 'letter' | 'legal';
  includeTimestamp?: boolean;
  includePageNumbers?: boolean;
  headerLogo?: string;
  footerText?: string;
}

/**
 * Sección de reporte
 */
export interface ReportSection {
  title: string;
  type: 'table' | 'chart' | 'text' | 'image';
  data: unknown;
  options?: Record<string, unknown>;
}

/**
 * Evento de WebSocket
 */
export interface WebSocketEvent {
  event: string;
  room?: string;
  data: unknown;
  timestamp: Date;
}

/**
 * Mensaje de cola
 */
export interface QueueMessage {
  id: string;
  type: string;
  payload: unknown;
  priority: number;
  attempts: number;
  maxAttempts: number;
  delay?: number;
  scheduledFor?: Date;
}

/**
 * Configuración de health check
 */
export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: Date;
  services: {
    name: string;
    status: 'up' | 'down' | 'degraded';
    responseTime?: number;
    details?: Record<string, unknown>;
  }[];
}

/**
 * Métricas del sistema
 */
export interface SystemMetrics {
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
    cores: number;
  };
  requests: {
    total: number;
    successful: number;
    failed: number;
    averageResponseTime: number;
  };
  database: {
    activeConnections: number;
    poolSize: number;
    queryCount: number;
  };
  cache: {
    hits: number;
    misses: number;
    hitRate: number;
  };
}

/**
 * Constantes de permisos RBAC
 */
export const RBAC_PERMISSIONS: Record<UserRole, RBACPermission[]> = {
  [UserRole.ADMIN]: [
    { resource: '*', actions: ['manage'] },
  ],
  [UserRole.DOCENTE]: [
    { resource: 'students', actions: ['read'] },
    { resource: 'enrollments', actions: ['read'] },
    { resource: 'attendance', actions: ['create', 'read', 'update'] },
    { resource: 'evaluations', actions: ['create', 'read', 'update'] },
    { resource: 'groups', actions: ['read'] },
    { resource: 'programs', actions: ['read'] },
    { resource: 'venues', actions: ['read'] },
  ],
  [UserRole.ESTUDIANTE]: [
    { resource: 'profile', actions: ['read', 'update'] },
    { resource: 'enrollments', actions: ['read'] },
    { resource: 'attendance', actions: ['read'] },
    { resource: 'evaluations', actions: ['read'] },
    { resource: 'programs', actions: ['read'] },
    { resource: 'groups', actions: ['read'] },
  ],
  [UserRole.AUXILIAR_ADMINISTRATIVO]: [
    { resource: 'students', actions: ['create', 'read', 'update'] },
    { resource: 'teachers', actions: ['create', 'read', 'update'] },
    { resource: 'enrollments', actions: ['create', 'read', 'update'] },
    { resource: 'programs', actions: ['read'] },
    { resource: 'groups', actions: ['read'] },
    { resource: 'venues', actions: ['read'] },
    { resource: 'reservations', actions: ['create', 'read', 'update'] },
    { resource: 'contracts', actions: ['create', 'read', 'update'] },
    { resource: 'reports', actions: ['read', 'create'] },
  ],
  [UserRole.OFICINA_JURIDICA]: [
    { resource: 'contracts', actions: ['read', 'update'] },
    { resource: 'reservations', actions: ['read'] },
    { resource: 'reports', actions: ['read'] },
  ],
  [UserRole.TECNICO_OPERATIVO]: [
    { resource: 'venues', actions: ['read', 'update'] },
    { resource: 'equipment', actions: ['create', 'read', 'update'] },
    { resource: 'maintenance', actions: ['create', 'read', 'update'] },
    { resource: 'reservations', actions: ['read'] },
  ],
  [UserRole.OPERARIO_LOGISTICO]: [
    { resource: 'venues', actions: ['read'] },
    { resource: 'equipment', actions: ['read', 'update'] },
    { resource: 'maintenance', actions: ['read', 'update'] },
    { resource: 'reservations', actions: ['read'] },
  ],
};
