/**
 * ============================================
 * DTOs - PLATAFORMA LUCY TEJADA
 * Data Transfer Objects para API REST
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
  ReservationStatus,
  EventType,
  ContractStatus,
  ContractType,
  EquipmentCategory,
  EquipmentStatus,
  MaintenanceType,
  MaintenancePriority,
  DayOfWeek,
  ReportFormat,
  ReportType,
} from '../enums/index.js';

// ============================================
// AUTH DTOs
// ============================================

export interface LoginDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserResponseDto;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserResponseDto {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  profile?: PersonProfileResponseDto;
  lastLoginAt?: string;
}

// ============================================
// USER DTOs
// ============================================

export interface CreateUserDto {
  email: string;
  password: string;
  role: UserRole;
  profile?: CreatePersonProfileDto;
}

export interface UpdateUserDto {
  email?: string;
  role?: UserRole;
  status?: UserStatus;
}

// ============================================
// PERSON PROFILE DTOs
// ============================================

export interface CreatePersonProfileDto {
  documentType: DocumentType;
  documentNumber: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  secondLastName?: string;
  gender: Gender;
  birthDate: string;
  phoneNumber?: string;
  mobileNumber?: string;
  address: string;
  neighborhood?: string;
  city: string;
  department: string;
  postalCode?: string;
  stratum?: SocioeconomicStratum;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
}

export interface UpdatePersonProfileDto extends Partial<CreatePersonProfileDto> {}

export interface PersonProfileResponseDto {
  id: string;
  documentType: DocumentType;
  documentNumber: string;
  fullName: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  secondLastName?: string;
  gender: Gender;
  birthDate: string;
  age: number;
  phoneNumber?: string;
  mobileNumber?: string;
  address: string;
  neighborhood?: string;
  city: string;
  department: string;
  stratum?: SocioeconomicStratum;
  photoUrl?: string;
}

// ============================================
// STUDENT DTOs
// ============================================

export interface CreateStudentDto {
  profile: CreatePersonProfileDto;
  hasDisability?: boolean;
  disabilityDescription?: string;
  requiresSpecialAttention?: boolean;
  specialAttentionNotes?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  guardianRelation?: string;
  consentFormSigned: boolean;
  dataProcessingConsent: boolean;
  imageUsageConsent?: boolean;
}

export interface UpdateStudentDto {
  profile?: UpdatePersonProfileDto;
  hasDisability?: boolean;
  disabilityDescription?: string;
  requiresSpecialAttention?: boolean;
  specialAttentionNotes?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  guardianRelation?: string;
}

export interface StudentResponseDto {
  id: string;
  studentCode: string;
  profile: PersonProfileResponseDto;
  enrollmentDate: string;
  hasDisability: boolean;
  disabilityDescription?: string;
  requiresSpecialAttention: boolean;
  isMinor: boolean;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  activeEnrollments: number;
  completedPrograms: number;
}

export interface StudentListDto {
  id: string;
  studentCode: string;
  fullName: string;
  documentNumber: string;
  email?: string;
  phone?: string;
  enrollmentDate: string;
  activeEnrollments: number;
  status: string;
}

// ============================================
// TEACHER DTOs
// ============================================

export interface CreateTeacherDto {
  profile: CreatePersonProfileDto;
  specialty: ArtisticArea[];
  academicDegree: string;
  yearsExperience: number;
  biography?: string;
  hireDate: string;
  contractType: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountType?: string;
}

export interface UpdateTeacherDto {
  profile?: UpdatePersonProfileDto;
  specialty?: ArtisticArea[];
  academicDegree?: string;
  yearsExperience?: number;
  biography?: string;
  contractType?: string;
}

export interface TeacherResponseDto {
  id: string;
  teacherCode: string;
  profile: PersonProfileResponseDto;
  specialty: ArtisticArea[];
  academicDegree: string;
  yearsExperience: number;
  biography?: string;
  hireDate: string;
  contractType: string;
  assignedGroups: number;
  totalStudents: number;
}

// ============================================
// PROGRAM DTOs
// ============================================

export interface CreateProgramDto {
  code: string;
  name: string;
  description: string;
  area: ArtisticArea;
  level: FormationLevel;
  durationWeeks: number;
  hoursPerWeek: number;
  maxStudents: number;
  minAge?: number;
  maxAge?: number;
  prerequisites?: string;
  objectives: string[];
  competencies: string[];
}

export interface UpdateProgramDto extends Partial<CreateProgramDto> {
  status?: ProgramStatus;
}

export interface ProgramResponseDto {
  id: string;
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
  minAge?: number;
  maxAge?: number;
  objectives: string[];
  competencies: string[];
  activeGroups: number;
  totalEnrollments: number;
  imageUrl?: string;
}

// ============================================
// GROUP DTOs
// ============================================

export interface CreateGroupDto {
  programId: string;
  teacherId: string;
  name: string;
  academicPeriod: string;
  startDate: string;
  endDate: string;
  maxStudents: number;
  venueId?: string;
  schedules: CreateGroupScheduleDto[];
}

export interface CreateGroupScheduleDto {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  venueId?: string;
}

export interface UpdateGroupDto {
  teacherId?: string;
  name?: string;
  maxStudents?: number;
  venueId?: string;
  status?: ProgramStatus;
}

export interface GroupResponseDto {
  id: string;
  groupCode: string;
  name: string;
  program: {
    id: string;
    name: string;
    area: ArtisticArea;
    level: FormationLevel;
  };
  teacher: {
    id: string;
    fullName: string;
    photoUrl?: string;
  };
  academicPeriod: string;
  startDate: string;
  endDate: string;
  maxStudents: number;
  currentStudents: number;
  availableSpots: number;
  venue?: {
    id: string;
    name: string;
  };
  schedules: GroupScheduleResponseDto[];
  status: ProgramStatus;
}

export interface GroupScheduleResponseDto {
  id: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  venue?: {
    id: string;
    name: string;
  };
}

// ============================================
// ENROLLMENT DTOs
// ============================================

export interface CreateEnrollmentDto {
  studentId: string;
  groupId: string;
  observations?: string;
}

export interface UpdateEnrollmentDto {
  status?: EnrollmentStatus;
  withdrawalReason?: string;
  observations?: string;
}

export interface EnrollmentResponseDto {
  id: string;
  student: StudentListDto;
  group: GroupResponseDto;
  status: EnrollmentStatus;
  enrollmentDate: string;
  withdrawalDate?: string;
  completionDate?: string;
  finalGrade?: QualitativeGrade;
  attendanceRate: number;
  observations?: string;
}

// ============================================
// ATTENDANCE DTOs
// ============================================

export interface CreateAttendanceDto {
  enrollmentId: string;
  sessionDate: string;
  status: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  observations?: string;
}

export interface BulkAttendanceDto {
  groupId: string;
  sessionDate: string;
  records: {
    enrollmentId: string;
    status: AttendanceStatus;
    observations?: string;
  }[];
}

export interface AttendanceResponseDto {
  id: string;
  student: {
    id: string;
    studentCode: string;
    fullName: string;
  };
  sessionDate: string;
  status: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  observations?: string;
  recordedBy: string;
  recordedAt: string;
}

export interface AttendanceSummaryDto {
  enrollmentId: string;
  studentName: string;
  totalSessions: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendanceRate: number;
}

// ============================================
// EVALUATION DTOs
// ============================================

export interface CreateEvaluationDto {
  enrollmentId: string;
  period: string;
  overallGrade: QualitativeGrade;
  technicalSkills: QualitativeGrade;
  artisticExpression: QualitativeGrade;
  commitment: QualitativeGrade;
  teamwork: QualitativeGrade;
  strengths: string;
  areasForImprovement: string;
  recommendations: string;
  teacherComments?: string;
}

export interface UpdateEvaluationDto extends Partial<CreateEvaluationDto> {}

export interface EvaluationResponseDto {
  id: string;
  enrollment: {
    id: string;
    student: StudentListDto;
    group: {
      id: string;
      name: string;
      programName: string;
    };
  };
  evaluationDate: string;
  period: string;
  overallGrade: QualitativeGrade;
  technicalSkills: QualitativeGrade;
  artisticExpression: QualitativeGrade;
  commitment: QualitativeGrade;
  teamwork: QualitativeGrade;
  strengths: string;
  areasForImprovement: string;
  recommendations: string;
  teacherComments?: string;
  evaluatedBy: string;
}

// ============================================
// VENUE DTOs
// ============================================

export interface CreateVenueDto {
  code: string;
  name: string;
  type: VenueType;
  capacity: number;
  area: number;
  floor?: number;
  building?: string;
  description?: string;
  amenities: string[];
  technicalSpecs?: string;
  hourlyRate?: number;
  dailyRate?: number;
  rules?: string;
  contactPerson?: string;
  contactPhone?: string;
}

export interface UpdateVenueDto extends Partial<CreateVenueDto> {
  status?: VenueType;
}

export interface VenueResponseDto {
  id: string;
  code: string;
  name: string;
  type: VenueType;
  status: string;
  capacity: number;
  area: number;
  floor?: number;
  building?: string;
  description?: string;
  amenities: string[];
  technicalSpecs?: string;
  hourlyRate?: number;
  dailyRate?: number;
  imageUrls: string[];
  rules?: string;
  isAvailable: boolean;
  upcomingReservations: number;
}

export interface VenueAvailabilityDto {
  venueId: string;
  date: string;
  slots: {
    startTime: string;
    endTime: string;
    isAvailable: boolean;
    reservationId?: string;
  }[];
}

// ============================================
// RESERVATION DTOs
// ============================================

export interface CreateReservationDto {
  venueId: string;
  eventType: EventType;
  eventName: string;
  eventDescription?: string;
  expectedAttendees: number;
  startDateTime: string;
  endDateTime: string;
  setupTime?: string;
  teardownTime?: string;
  requiresEquipment: boolean;
  equipmentNotes?: string;
  specialRequirements?: string;
  organizationName?: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string;
}

export interface UpdateReservationDto {
  eventName?: string;
  eventDescription?: string;
  expectedAttendees?: number;
  specialRequirements?: string;
}

export interface ApproveReservationDto {
  approved: boolean;
  comments?: string;
  rejectionReason?: string;
}

export interface ReservationResponseDto {
  id: string;
  reservationCode: string;
  venue: VenueResponseDto;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string;
  organizationName?: string;
  eventType: EventType;
  eventName: string;
  eventDescription?: string;
  expectedAttendees: number;
  startDateTime: string;
  endDateTime: string;
  duration: number;
  status: ReservationStatus;
  totalCost?: number;
  isPaid: boolean;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
}

// ============================================
// CONTRACT DTOs
// ============================================

export interface CreateContractDto {
  reservationId?: string;
  contractType: ContractType;
  contractorName: string;
  contractorDocumentType: DocumentType;
  contractorDocumentNumber: string;
  contractorAddress: string;
  contractorPhone: string;
  contractorEmail: string;
  legalRepresentative?: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  depositAmount?: number;
  paymentTerms: string;
  terms: string;
  specialClauses?: string;
}

export interface ContractReviewDto {
  approved: boolean;
  comments: string;
}

export interface ContractResponseDto {
  id: string;
  contractNumber: string;
  contractType: ContractType;
  status: ContractStatus;
  reservation?: ReservationResponseDto;
  contractorName: string;
  contractorDocument: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  depositAmount?: number;
  paymentTerms: string;
  workflowStage: string;
  createdAt: string;
  createdBy: string;
  adminReviewedAt?: string;
  adminReviewer?: string;
  legalReviewedAt?: string;
  legalReviewer?: string;
  secretaryApprovedAt?: string;
  secretaryApprover?: string;
}

// ============================================
// EQUIPMENT DTOs
// ============================================

export interface CreateEquipmentDto {
  code: string;
  name: string;
  category: EquipmentCategory;
  brand?: string;
  model?: string;
  serialNumber?: string;
  condition: string;
  purchaseDate?: string;
  purchasePrice?: number;
  warrantyExpiration?: string;
  locationId?: string;
  specifications?: string;
  notes?: string;
}

export interface UpdateEquipmentDto extends Partial<CreateEquipmentDto> {
  status?: EquipmentStatus;
  currentValue?: number;
  assignedToId?: string;
}

export interface EquipmentResponseDto {
  id: string;
  code: string;
  name: string;
  category: EquipmentCategory;
  brand?: string;
  model?: string;
  serialNumber?: string;
  status: EquipmentStatus;
  condition: string;
  location?: {
    id: string;
    name: string;
  };
  assignedTo?: {
    id: string;
    name: string;
  };
  purchaseDate?: string;
  purchasePrice?: number;
  currentValue?: number;
  warrantyExpiration?: string;
  imageUrls: string[];
}

// ============================================
// MAINTENANCE DTOs
// ============================================

export interface CreateMaintenanceDto {
  type: MaintenanceType;
  priority: MaintenancePriority;
  equipmentId?: string;
  venueId?: string;
  title: string;
  description: string;
  scheduledDate?: string;
}

export interface UpdateMaintenanceDto {
  status?: string;
  assignedToId?: string;
  diagnosis?: string;
  workPerformed?: string;
  partsCost?: number;
  laborCost?: number;
  notes?: string;
}

export interface MaintenanceResponseDto {
  id: string;
  ticketNumber: string;
  type: MaintenanceType;
  status: string;
  priority: MaintenancePriority;
  equipment?: EquipmentResponseDto;
  venue?: VenueResponseDto;
  title: string;
  description: string;
  reportedBy: string;
  reportedAt: string;
  assignedTo?: string;
  scheduledDate?: string;
  completedAt?: string;
  totalCost?: number;
  beforePhotoUrls: string[];
  afterPhotoUrls: string[];
}

// ============================================
// REPORT DTOs
// ============================================

export interface GenerateReportDto {
  reportType: ReportType;
  format: ReportFormat;
  startDate?: string;
  endDate?: string;
  filters?: Record<string, unknown>;
}

export interface ReportResponseDto {
  id: string;
  type: ReportType;
  format: ReportFormat;
  fileName: string;
  fileUrl: string;
  generatedAt: string;
  generatedBy: string;
  parameters: Record<string, unknown>;
}

// ============================================
// DASHBOARD DTOs
// ============================================

export interface DashboardStatsDto {
  totalStudents: number;
  activeStudents: number;
  totalTeachers: number;
  activePrograms: number;
  totalEnrollments: number;
  activeEnrollments: number;
  attendanceRate: number;
  upcomingReservations: number;
  pendingContracts: number;
  maintenanceAlerts: number;
}

export interface EnrollmentsByProgramDto {
  programId: string;
  programName: string;
  area: ArtisticArea;
  enrollments: number;
  percentage: number;
}

export interface GeographicDistributionDto {
  neighborhood: string;
  city: string;
  count: number;
  percentage: number;
}

export interface DropoutAnalysisDto {
  period: string;
  totalEnrollments: number;
  withdrawals: number;
  dropoutRate: number;
  reasons: {
    reason: string;
    count: number;
    percentage: number;
  }[];
}

export interface VenueUsageStatsDto {
  venueId: string;
  venueName: string;
  totalReservations: number;
  totalHours: number;
  occupancyRate: number;
  revenue: number;
}

// ============================================
// PAGINATION & FILTERING
// ============================================

export interface PaginationDto {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponseDto<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface SearchFiltersDto {
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  area?: ArtisticArea;
  level?: FormationLevel;
  [key: string]: unknown;
}

// ============================================
// NOTIFICATION DTOs
// ============================================

export interface SendNotificationDto {
  userId: string;
  type: string;
  category: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  actionUrl?: string;
}

export interface NotificationResponseDto {
  id: string;
  type: string;
  category: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  actionUrl?: string;
  read: boolean;
  createdAt: string;
  readAt?: string;
}

// ============================================
// FILE UPLOAD DTOs
// ============================================

export interface FileUploadResponseDto {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: string;
}
