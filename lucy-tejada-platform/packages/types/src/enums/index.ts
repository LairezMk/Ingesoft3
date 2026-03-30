/**
 * ============================================
 * ENUMS - PLATAFORMA LUCY TEJADA
 * Definiciones de tipos enumerados del sistema
 * ============================================
 */

/**
 * Roles del sistema según documento de visión
 * Implementa RBAC (Role Based Access Control)
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  DOCENTE = 'DOCENTE',
  ESTUDIANTE = 'ESTUDIANTE',
  AUXILIAR_ADMINISTRATIVO = 'AUXILIAR_ADMINISTRATIVO',
  OFICINA_JURIDICA = 'OFICINA_JURIDICA',
  TECNICO_OPERATIVO = 'TECNICO_OPERATIVO',
  OPERARIO_LOGISTICO = 'OPERARIO_LOGISTICO',
}

/**
 * Estados de usuario
 */
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
}

/**
 * Tipos de documento de identidad en Colombia
 */
export enum DocumentType {
  CC = 'CC', // Cédula de Ciudadanía
  TI = 'TI', // Tarjeta de Identidad
  CE = 'CE', // Cédula de Extranjería
  PA = 'PA', // Pasaporte
  RC = 'RC', // Registro Civil
  NIT = 'NIT', // Número de Identificación Tributaria
}

/**
 * Géneros
 */
export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  PREFER_NOT_SAY = 'PREFER_NOT_SAY',
}

/**
 * Estratos socioeconómicos de Colombia
 */
export enum SocioeconomicStratum {
  STRATUM_1 = 1,
  STRATUM_2 = 2,
  STRATUM_3 = 3,
  STRATUM_4 = 4,
  STRATUM_5 = 5,
  STRATUM_6 = 6,
}

/**
 * Áreas de formación artística del Centro Cultural
 */
export enum ArtisticArea {
  DANZA = 'DANZA',
  MUSICA = 'MUSICA',
  TEATRO = 'TEATRO',
  ARTES_VISUALES = 'ARTES_VISUALES',
  ARTES_PLASTICAS = 'ARTES_PLASTICAS',
  LITERATURA = 'LITERATURA',
  AUDIOVISUAL = 'AUDIOVISUAL',
}

/**
 * Niveles de formación
 */
export enum FormationLevel {
  INICIACION = 'INICIACION',
  BASICO = 'BASICO',
  INTERMEDIO = 'INTERMEDIO',
  AVANZADO = 'AVANZADO',
  PROFESIONAL = 'PROFESIONAL',
}

/**
 * Estados de programa formativo
 */
export enum ProgramStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

/**
 * Estados de matrícula
 */
export enum EnrollmentStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  WITHDRAWN = 'WITHDRAWN',
  EXPELLED = 'EXPELLED',
  TRANSFERRED = 'TRANSFERRED',
}

/**
 * Estados de asistencia
 */
export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  EXCUSED = 'EXCUSED',
}

/**
 * Escala de evaluación cualitativa
 * Según estándares del Ministerio de Educación de Colombia
 */
export enum QualitativeGrade {
  SUPERIOR = 'SUPERIOR', // 4.6 - 5.0
  ALTO = 'ALTO', // 4.0 - 4.5
  BASICO = 'BASICO', // 3.0 - 3.9
  BAJO = 'BAJO', // 1.0 - 2.9
  NA = 'NA', // No Aplica
}

/**
 * Tipos de escenario cultural
 */
export enum VenueType {
  TEATRO = 'TEATRO',
  AUDITORIO = 'AUDITORIO',
  SALA_ENSAYO = 'SALA_ENSAYO',
  SALON_MULTIUSOS = 'SALON_MULTIUSOS',
  GALERIA = 'GALERIA',
  SALA_EXPOSICIONES = 'SALA_EXPOSICIONES',
  BIBLIOTECA = 'BIBLIOTECA',
  ESPACIO_ABIERTO = 'ESPACIO_ABIERTO',
}

/**
 * Estados de escenario
 */
export enum VenueStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  MAINTENANCE = 'MAINTENANCE',
  RESERVED = 'RESERVED',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE',
}

/**
 * Estados de reserva
 */
export enum ReservationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  IN_PROGRESS = 'IN_PROGRESS',
}

/**
 * Tipos de evento para reserva
 */
export enum EventType {
  CONCIERTO = 'CONCIERTO',
  OBRA_TEATRO = 'OBRA_TEATRO',
  EXPOSICION = 'EXPOSICION',
  CONFERENCIA = 'CONFERENCIA',
  TALLER = 'TALLER',
  ENSAYO = 'ENSAYO',
  CLASE = 'CLASE',
  REUNION = 'REUNION',
  CEREMONIA = 'CEREMONIA',
  FESTIVAL = 'FESTIVAL',
  EVENTO_PRIVADO = 'EVENTO_PRIVADO',
  OTRO = 'OTRO',
}

/**
 * Estados del workflow de contratos
 * Workflow: Auxiliar Administrativo → Oficina Jurídica → Secretaría
 */
export enum ContractStatus {
  DRAFT = 'DRAFT',
  PENDING_ADMIN_REVIEW = 'PENDING_ADMIN_REVIEW',
  PENDING_LEGAL_REVIEW = 'PENDING_LEGAL_REVIEW',
  PENDING_SECRETARY_APPROVAL = 'PENDING_SECRETARY_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
  COMPLETED = 'COMPLETED',
}

/**
 * Tipos de contrato
 */
export enum ContractType {
  ALQUILER_ESCENARIO = 'ALQUILER_ESCENARIO',
  COMODATO = 'COMODATO',
  CONVENIO = 'CONVENIO',
  PRESTACION_SERVICIOS = 'PRESTACION_SERVICIOS',
}

/**
 * Categorías de equipos técnicos
 */
export enum EquipmentCategory {
  SONIDO = 'SONIDO',
  ILUMINACION = 'ILUMINACION',
  VIDEO = 'VIDEO',
  SILLETERIA = 'SILLETERIA',
  ESCENOGRAFIA = 'ESCENOGRAFIA',
  INSTRUMENTOS = 'INSTRUMENTOS',
  MOBILIARIO = 'MOBILIARIO',
  HERRAMIENTAS = 'HERRAMIENTAS',
  OTRO = 'OTRO',
}

/**
 * Estados de equipos
 */
export enum EquipmentStatus {
  AVAILABLE = 'AVAILABLE',
  IN_USE = 'IN_USE',
  MAINTENANCE = 'MAINTENANCE',
  DAMAGED = 'DAMAGED',
  DISPOSED = 'DISPOSED',
  LOST = 'LOST',
}

/**
 * Tipos de mantenimiento
 */
export enum MaintenanceType {
  PREVENTIVO = 'PREVENTIVO',
  CORRECTIVO = 'CORRECTIVO',
  MEJORA = 'MEJORA',
  EMERGENCIA = 'EMERGENCIA',
}

/**
 * Estados de mantenimiento
 */
export enum MaintenanceStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  PENDING_PARTS = 'PENDING_PARTS',
}

/**
 * Prioridad de mantenimiento
 */
export enum MaintenancePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

/**
 * Tipos de notificación
 */
export enum NotificationType {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
  IN_APP = 'IN_APP',
}

/**
 * Estados de notificación
 */
export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED',
}

/**
 * Categorías de notificación
 */
export enum NotificationCategory {
  ACADEMIC = 'ACADEMIC',
  SCHEDULE_CHANGE = 'SCHEDULE_CHANGE',
  ATTENDANCE = 'ATTENDANCE',
  EVALUATION = 'EVALUATION',
  RESERVATION = 'RESERVATION',
  CONTRACT = 'CONTRACT',
  MAINTENANCE = 'MAINTENANCE',
  SYSTEM = 'SYSTEM',
}

/**
 * Tipos de acción para auditoría
 */
export enum AuditAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
}

/**
 * Días de la semana
 */
export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

/**
 * Formato de exportación de reportes
 */
export enum ReportFormat {
  PDF = 'PDF',
  EXCEL = 'EXCEL',
  CSV = 'CSV',
}

/**
 * Tipos de reporte
 */
export enum ReportType {
  ENROLLMENT_SUMMARY = 'ENROLLMENT_SUMMARY',
  ATTENDANCE_REPORT = 'ATTENDANCE_REPORT',
  GEOGRAPHIC_DISTRIBUTION = 'GEOGRAPHIC_DISTRIBUTION',
  DROPOUT_ANALYSIS = 'DROPOUT_ANALYSIS',
  VENUE_USAGE = 'VENUE_USAGE',
  CONTRACT_SUMMARY = 'CONTRACT_SUMMARY',
  EQUIPMENT_INVENTORY = 'EQUIPMENT_INVENTORY',
  MAINTENANCE_LOG = 'MAINTENANCE_LOG',
  FINANCIAL_SUMMARY = 'FINANCIAL_SUMMARY',
}
