/**
 * ============================================
 * ENTITIES - PLATAFORMA LUCY TEJADA
 * Definiciones de entidades del sistema
 * ============================================
 */

import {
  UserRole,
  UserStatus,
  DocumentType,
  Gender,
  SocioeconomicStratum,
  ArtisticArea,
  FormationLevel,
  ProgramStatus,
  EnrollmentStatus,
  AttendanceStatus,
  QualitativeGrade,
  VenueType,
  VenueStatus,
  ReservationStatus,
  EventType,
  ContractStatus,
  ContractType,
  EquipmentCategory,
  EquipmentStatus,
  MaintenanceType,
  MaintenanceStatus,
  MaintenancePriority,
  NotificationType,
  NotificationStatus,
  NotificationCategory,
  AuditAction,
  DayOfWeek,
} from '../enums/index.js';

/**
 * Base entity con campos comunes
 */
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  isActive: boolean;
}

/**
 * Usuario del sistema
 */
export interface User extends BaseEntity {
  email: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt?: Date | null;
  failedLoginAttempts: number;
  lockedUntil?: Date | null;
  mustChangePassword: boolean;
  profileId?: string | null;
}

/**
 * Perfil básico de persona
 */
export interface PersonProfile extends BaseEntity {
  userId?: string | null;
  documentType: DocumentType;
  documentNumber: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  secondLastName?: string | null;
  gender: Gender;
  birthDate: Date;
  phoneNumber?: string | null;
  mobileNumber?: string | null;
  address: string;
  neighborhood?: string | null;
  city: string;
  department: string;
  postalCode?: string | null;
  stratum?: SocioeconomicStratum | null;
  photoUrl?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  emergencyContactRelation?: string | null;
}

/**
 * Perfil de estudiante
 */
export interface StudentProfile extends BaseEntity {
  personProfileId: string;
  personProfile?: PersonProfile;
  studentCode: string;
  enrollmentDate: Date;
  hasDisability: boolean;
  disabilityDescription?: string | null;
  requiresSpecialAttention: boolean;
  specialAttentionNotes?: string | null;
  guardianName?: string | null;
  guardianPhone?: string | null;
  guardianEmail?: string | null;
  guardianRelation?: string | null;
  isMinor: boolean;
  consentFormSigned: boolean;
  dataProcessingConsent: boolean;
  imageUsageConsent: boolean;
}

/**
 * Perfil de docente
 */
export interface TeacherProfile extends BaseEntity {
  personProfileId: string;
  personProfile?: PersonProfile;
  teacherCode: string;
  professionalCard?: string | null;
  specialty: ArtisticArea[];
  academicDegree: string;
  yearsExperience: number;
  biography?: string | null;
  curriculumUrl?: string | null;
  hireDate: Date;
  contractType: string;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  bankAccountType?: string | null;
}

/**
 * Programa formativo
 */
export interface FormativeProgram extends BaseEntity {
  code: string;
  name: string;
  description: string;
  area: ArtisticArea;
  level: FormationLevel;
  status: ProgramStatus;
  durationWeeks: number;
  hoursPerWeek: number;
  totalHours: number;
  maxStudents: number;
  minAge?: number | null;
  maxAge?: number | null;
  prerequisites?: string | null;
  objectives: string[];
  competencies: string[];
  syllabus?: string | null;
  imageUrl?: string | null;
  coordinatorId?: string | null;
}

/**
 * Grupo/Clase de un programa
 */
export interface CourseGroup extends BaseEntity {
  programId: string;
  program?: FormativeProgram;
  teacherId: string;
  teacher?: TeacherProfile;
  groupCode: string;
  name: string;
  academicPeriod: string;
  startDate: Date;
  endDate: Date;
  maxStudents: number;
  currentStudents: number;
  venueId?: string | null;
  venue?: Venue;
  status: ProgramStatus;
}

/**
 * Horario de grupo
 */
export interface GroupSchedule extends BaseEntity {
  groupId: string;
  group?: CourseGroup;
  dayOfWeek: DayOfWeek;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  venueId?: string | null;
  venue?: Venue;
}

/**
 * Matrícula
 */
export interface Enrollment extends BaseEntity {
  studentId: string;
  student?: StudentProfile;
  groupId: string;
  group?: CourseGroup;
  status: EnrollmentStatus;
  enrollmentDate: Date;
  withdrawalDate?: Date | null;
  withdrawalReason?: string | null;
  completionDate?: Date | null;
  finalGrade?: QualitativeGrade | null;
  observations?: string | null;
  enrolledById: string;
}

/**
 * Registro de asistencia
 */
export interface AttendanceRecord extends BaseEntity {
  enrollmentId: string;
  enrollment?: Enrollment;
  sessionDate: Date;
  status: AttendanceStatus;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  observations?: string | null;
  recordedById: string;
  recordedByName?: string;
}

/**
 * Evaluación cualitativa
 */
export interface QualitativeEvaluation extends BaseEntity {
  enrollmentId: string;
  enrollment?: Enrollment;
  evaluationDate: Date;
  period: string;
  overallGrade: QualitativeGrade;
  technicalSkills: QualitativeGrade;
  artisticExpression: QualitativeGrade;
  commitment: QualitativeGrade;
  teamwork: QualitativeGrade;
  strengths: string;
  areasForImprovement: string;
  recommendations: string;
  teacherComments?: string | null;
  evaluatedById: string;
}

/**
 * Escenario/Espacio cultural
 */
export interface Venue extends BaseEntity {
  code: string;
  name: string;
  type: VenueType;
  status: VenueStatus;
  capacity: number;
  area: number; // metros cuadrados
  floor?: number | null;
  building?: string | null;
  description?: string | null;
  amenities: string[];
  technicalSpecs?: string | null;
  hourlyRate?: number | null;
  dailyRate?: number | null;
  imageUrls: string[];
  rules?: string | null;
  contactPerson?: string | null;
  contactPhone?: string | null;
}

/**
 * Reserva de escenario
 */
export interface VenueReservation extends BaseEntity {
  reservationCode: string;
  venueId: string;
  venue?: Venue;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string;
  organizationName?: string | null;
  eventType: EventType;
  eventName: string;
  eventDescription?: string | null;
  expectedAttendees: number;
  startDateTime: Date;
  endDateTime: Date;
  setupTime?: Date | null;
  teardownTime?: Date | null;
  status: ReservationStatus;
  requiresEquipment: boolean;
  equipmentNotes?: string | null;
  specialRequirements?: string | null;
  approvedById?: string | null;
  approvedAt?: Date | null;
  rejectionReason?: string | null;
  cancellationReason?: string | null;
  cancellationDate?: Date | null;
  totalCost?: number | null;
  isPaid: boolean;
  paymentReference?: string | null;
}

/**
 * Contrato de alquiler
 */
export interface RentalContract extends BaseEntity {
  contractNumber: string;
  reservationId?: string | null;
  reservation?: VenueReservation;
  contractType: ContractType;
  status: ContractStatus;

  // Datos del contratante
  contractorName: string;
  contractorDocumentType: DocumentType;
  contractorDocumentNumber: string;
  contractorAddress: string;
  contractorPhone: string;
  contractorEmail: string;
  legalRepresentative?: string | null;

  // Términos del contrato
  startDate: Date;
  endDate: Date;
  totalAmount: number;
  depositAmount?: number | null;
  paymentTerms: string;

  // Documentos
  contractDocumentUrl?: string | null;
  paymentProofUrl?: string | null;
  additionalDocuments: string[];

  // Workflow de aprobación
  createdById: string;
  adminReviewerId?: string | null;
  adminReviewedAt?: Date | null;
  adminComments?: string | null;
  legalReviewerId?: string | null;
  legalReviewedAt?: Date | null;
  legalComments?: string | null;
  secretaryApproverId?: string | null;
  secretaryApprovedAt?: Date | null;
  secretaryComments?: string | null;

  // Términos y condiciones
  terms: string;
  specialClauses?: string | null;
}

/**
 * Equipo técnico
 */
export interface Equipment extends BaseEntity {
  code: string;
  name: string;
  category: EquipmentCategory;
  brand?: string | null;
  model?: string | null;
  serialNumber?: string | null;
  status: EquipmentStatus;
  condition: string;
  purchaseDate?: Date | null;
  purchasePrice?: number | null;
  currentValue?: number | null;
  warrantyExpiration?: Date | null;
  locationId?: string | null;
  location?: Venue;
  assignedToId?: string | null;
  specifications?: string | null;
  imageUrls: string[];
  notes?: string | null;
}

/**
 * Registro de mantenimiento
 */
export interface MaintenanceRecord extends BaseEntity {
  ticketNumber: string;
  type: MaintenanceType;
  status: MaintenanceStatus;
  priority: MaintenancePriority;

  // Puede ser para equipo o escenario
  equipmentId?: string | null;
  equipment?: Equipment;
  venueId?: string | null;
  venue?: Venue;

  title: string;
  description: string;
  reportedById: string;
  reportedByName: string;
  reportedAt: Date;

  assignedToId?: string | null;
  assignedToName?: string | null;
  scheduledDate?: Date | null;
  startedAt?: Date | null;
  completedAt?: Date | null;

  diagnosis?: string | null;
  workPerformed?: string | null;
  partsCost?: number | null;
  laborCost?: number | null;
  totalCost?: number | null;

  // Fotos antes/después
  beforePhotoUrls: string[];
  afterPhotoUrls: string[];
  attachmentUrls: string[];

  notes?: string | null;
}

/**
 * Notificación
 */
export interface Notification extends BaseEntity {
  userId: string;
  type: NotificationType;
  category: NotificationCategory;
  status: NotificationStatus;
  title: string;
  message: string;
  data?: Record<string, unknown> | null;
  sentAt?: Date | null;
  readAt?: Date | null;
  expiresAt?: Date | null;
  actionUrl?: string | null;
}

/**
 * Log de auditoría
 */
export interface AuditLog extends BaseEntity {
  userId: string;
  userName: string;
  userRole: UserRole;
  action: AuditAction;
  entityType: string;
  entityId: string;
  tableName: string;
  previousData?: Record<string, unknown> | null;
  newData?: Record<string, unknown> | null;
  changedFields?: string[] | null;
  ipAddress: string;
  userAgent?: string | null;
  sessionId?: string | null;
  description: string;
}

/**
 * Token de refresh
 */
export interface RefreshToken extends BaseEntity {
  userId: string;
  token: string;
  expiresAt: Date;
  revokedAt?: Date | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/**
 * Sesión de usuario
 */
export interface UserSession extends BaseEntity {
  userId: string;
  sessionId: string;
  ipAddress: string;
  userAgent?: string | null;
  lastActivityAt: Date;
  expiresAt: Date;
  isValid: boolean;
}

/**
 * Configuración del sistema
 */
export interface SystemConfig extends BaseEntity {
  key: string;
  value: string;
  description?: string | null;
  isPublic: boolean;
  updatedById?: string | null;
}

/**
 * Archivo subido
 */
export interface UploadedFile extends BaseEntity {
  originalName: string;
  storedName: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
  entityType?: string | null;
  entityId?: string | null;
  uploadedById: string;
  isPublic: boolean;
  metadata?: Record<string, unknown> | null;
}
