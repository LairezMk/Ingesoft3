-- ============================================
-- PLATAFORMA CENTRO CULTURAL LUCY TEJADA
-- Esquema de Base de Datos PostgreSQL
-- Version: 1.0.0
-- ============================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

-- ============================================
-- TIPOS ENUMERADOS
-- ============================================

-- Roles del sistema
CREATE TYPE user_role AS ENUM (
  'ADMIN',
  'DOCENTE',
  'ESTUDIANTE',
  'AUXILIAR_ADMINISTRATIVO',
  'OFICINA_JURIDICA',
  'TECNICO_OPERATIVO',
  'OPERARIO_LOGISTICO'
);

-- Estados de usuario
CREATE TYPE user_status AS ENUM (
  'ACTIVE',
  'INACTIVE',
  'SUSPENDED',
  'PENDING_VERIFICATION'
);

-- Tipos de documento
CREATE TYPE document_type AS ENUM (
  'CC',  -- Cédula de Ciudadanía
  'TI',  -- Tarjeta de Identidad
  'CE',  -- Cédula de Extranjería
  'PA',  -- Pasaporte
  'RC',  -- Registro Civil
  'NIT'  -- Número de Identificación Tributaria
);

-- Género
CREATE TYPE gender AS ENUM (
  'MALE',
  'FEMALE',
  'OTHER',
  'PREFER_NOT_SAY'
);

-- Áreas artísticas
CREATE TYPE artistic_area AS ENUM (
  'DANZA',
  'MUSICA',
  'TEATRO',
  'ARTES_VISUALES',
  'ARTES_PLASTICAS',
  'LITERATURA',
  'AUDIOVISUAL'
);

-- Niveles de formación
CREATE TYPE formation_level AS ENUM (
  'INICIACION',
  'BASICO',
  'INTERMEDIO',
  'AVANZADO',
  'PROFESIONAL'
);

-- Estados de programa
CREATE TYPE program_status AS ENUM (
  'ACTIVE',
  'INACTIVE',
  'SUSPENDED',
  'COMPLETED',
  'CANCELLED'
);

-- Estados de matrícula
CREATE TYPE enrollment_status AS ENUM (
  'PENDING',
  'ACTIVE',
  'COMPLETED',
  'WITHDRAWN',
  'EXPELLED',
  'TRANSFERRED'
);

-- Estados de asistencia
CREATE TYPE attendance_status AS ENUM (
  'PRESENT',
  'ABSENT',
  'LATE',
  'EXCUSED'
);

-- Evaluación cualitativa
CREATE TYPE qualitative_grade AS ENUM (
  'SUPERIOR',
  'ALTO',
  'BASICO',
  'BAJO',
  'NA'
);

-- Tipos de escenario
CREATE TYPE venue_type AS ENUM (
  'TEATRO',
  'AUDITORIO',
  'SALA_ENSAYO',
  'SALON_MULTIUSOS',
  'GALERIA',
  'SALA_EXPOSICIONES',
  'BIBLIOTECA',
  'ESPACIO_ABIERTO'
);

-- Estados de escenario
CREATE TYPE venue_status AS ENUM (
  'AVAILABLE',
  'OCCUPIED',
  'MAINTENANCE',
  'RESERVED',
  'OUT_OF_SERVICE'
);

-- Estados de reserva
CREATE TYPE reservation_status AS ENUM (
  'PENDING',
  'APPROVED',
  'REJECTED',
  'CANCELLED',
  'COMPLETED',
  'IN_PROGRESS'
);

-- Tipos de evento
CREATE TYPE event_type AS ENUM (
  'CONCIERTO',
  'OBRA_TEATRO',
  'EXPOSICION',
  'CONFERENCIA',
  'TALLER',
  'ENSAYO',
  'CLASE',
  'REUNION',
  'CEREMONIA',
  'FESTIVAL',
  'EVENTO_PRIVADO',
  'OTRO'
);

-- Estados de contrato
CREATE TYPE contract_status AS ENUM (
  'DRAFT',
  'PENDING_ADMIN_REVIEW',
  'PENDING_LEGAL_REVIEW',
  'PENDING_SECRETARY_APPROVAL',
  'APPROVED',
  'REJECTED',
  'CANCELLED',
  'EXPIRED',
  'COMPLETED'
);

-- Tipos de contrato
CREATE TYPE contract_type AS ENUM (
  'ALQUILER_ESCENARIO',
  'COMODATO',
  'CONVENIO',
  'PRESTACION_SERVICIOS'
);

-- Categorías de equipos
CREATE TYPE equipment_category AS ENUM (
  'SONIDO',
  'ILUMINACION',
  'VIDEO',
  'SILLETERIA',
  'ESCENOGRAFIA',
  'INSTRUMENTOS',
  'MOBILIARIO',
  'HERRAMIENTAS',
  'OTRO'
);

-- Estados de equipos
CREATE TYPE equipment_status AS ENUM (
  'AVAILABLE',
  'IN_USE',
  'MAINTENANCE',
  'DAMAGED',
  'DISPOSED',
  'LOST'
);

-- Tipos de mantenimiento
CREATE TYPE maintenance_type AS ENUM (
  'PREVENTIVO',
  'CORRECTIVO',
  'MEJORA',
  'EMERGENCIA'
);

-- Estados de mantenimiento
CREATE TYPE maintenance_status AS ENUM (
  'SCHEDULED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'PENDING_PARTS'
);

-- Prioridad de mantenimiento
CREATE TYPE maintenance_priority AS ENUM (
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL'
);

-- Tipos de notificación
CREATE TYPE notification_type AS ENUM (
  'EMAIL',
  'SMS',
  'PUSH',
  'IN_APP'
);

-- Estados de notificación
CREATE TYPE notification_status AS ENUM (
  'PENDING',
  'SENT',
  'DELIVERED',
  'READ',
  'FAILED'
);

-- Categorías de notificación
CREATE TYPE notification_category AS ENUM (
  'ACADEMIC',
  'SCHEDULE_CHANGE',
  'ATTENDANCE',
  'EVALUATION',
  'RESERVATION',
  'CONTRACT',
  'MAINTENANCE',
  'SYSTEM'
);

-- Acciones de auditoría
CREATE TYPE audit_action AS ENUM (
  'CREATE',
  'READ',
  'UPDATE',
  'DELETE',
  'LOGIN',
  'LOGOUT',
  'EXPORT',
  'IMPORT',
  'APPROVE',
  'REJECT'
);

-- Días de la semana
CREATE TYPE day_of_week AS ENUM (
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY'
);

-- ============================================
-- TABLAS PRINCIPALES
-- ============================================

-- Tabla de usuarios
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email CITEXT UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'ESTUDIANTE',
  status user_status NOT NULL DEFAULT 'PENDING_VERIFICATION',
  last_login_at TIMESTAMPTZ,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMPTZ,
  must_change_password BOOLEAN DEFAULT FALSE,
  profile_id UUID,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ,

  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NULL;

-- Tabla de perfiles de persona
CREATE TABLE person_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE SET NULL,
  document_type document_type NOT NULL,
  document_number VARCHAR(20) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  last_name VARCHAR(100) NOT NULL,
  second_last_name VARCHAR(100),
  gender gender NOT NULL,
  birth_date DATE NOT NULL,
  phone_number VARCHAR(20),
  mobile_number VARCHAR(20),
  address VARCHAR(255) NOT NULL,
  neighborhood VARCHAR(100),
  city VARCHAR(100) NOT NULL DEFAULT 'Pereira',
  department VARCHAR(100) NOT NULL DEFAULT 'Risaralda',
  postal_code VARCHAR(10),
  stratum SMALLINT CHECK (stratum BETWEEN 1 AND 6),
  photo_url VARCHAR(500),
  emergency_contact_name VARCHAR(200),
  emergency_contact_phone VARCHAR(20),
  emergency_contact_relation VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ,

  CONSTRAINT unique_document UNIQUE (document_type, document_number)
);

CREATE INDEX idx_person_profiles_document ON person_profiles(document_type, document_number);
CREATE INDEX idx_person_profiles_name ON person_profiles(last_name, first_name);
CREATE INDEX idx_person_profiles_city ON person_profiles(city);

-- Tabla de perfiles de estudiante
CREATE TABLE student_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  person_profile_id UUID NOT NULL REFERENCES person_profiles(id) ON DELETE CASCADE,
  student_code VARCHAR(20) UNIQUE NOT NULL,
  enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  has_disability BOOLEAN DEFAULT FALSE,
  disability_description TEXT,
  requires_special_attention BOOLEAN DEFAULT FALSE,
  special_attention_notes TEXT,
  guardian_name VARCHAR(200),
  guardian_phone VARCHAR(20),
  guardian_email CITEXT,
  guardian_relation VARCHAR(50),
  is_minor BOOLEAN DEFAULT FALSE,
  consent_form_signed BOOLEAN DEFAULT FALSE,
  data_processing_consent BOOLEAN DEFAULT FALSE,
  image_usage_consent BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_student_profiles_code ON student_profiles(student_code);
CREATE INDEX idx_student_profiles_person ON student_profiles(person_profile_id);

-- Tabla de perfiles de docente
CREATE TABLE teacher_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  person_profile_id UUID NOT NULL REFERENCES person_profiles(id) ON DELETE CASCADE,
  teacher_code VARCHAR(20) UNIQUE NOT NULL,
  professional_card VARCHAR(50),
  specialty artistic_area[] NOT NULL DEFAULT '{}',
  academic_degree VARCHAR(200) NOT NULL,
  years_experience INTEGER DEFAULT 0,
  biography TEXT,
  curriculum_url VARCHAR(500),
  hire_date DATE NOT NULL,
  contract_type VARCHAR(50) NOT NULL,
  bank_name VARCHAR(100),
  bank_account_number VARCHAR(50),
  bank_account_type VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_teacher_profiles_code ON teacher_profiles(teacher_code);
CREATE INDEX idx_teacher_profiles_person ON teacher_profiles(person_profile_id);
CREATE INDEX idx_teacher_profiles_specialty ON teacher_profiles USING GIN(specialty);

-- Tabla de programas formativos
CREATE TABLE formative_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  area artistic_area NOT NULL,
  level formation_level NOT NULL,
  status program_status NOT NULL DEFAULT 'ACTIVE',
  duration_weeks INTEGER NOT NULL,
  hours_per_week NUMERIC(4,1) NOT NULL,
  total_hours NUMERIC(6,1) GENERATED ALWAYS AS (duration_weeks * hours_per_week) STORED,
  max_students INTEGER NOT NULL DEFAULT 30,
  min_age INTEGER,
  max_age INTEGER,
  prerequisites TEXT,
  objectives TEXT[] NOT NULL DEFAULT '{}',
  competencies TEXT[] NOT NULL DEFAULT '{}',
  syllabus TEXT,
  image_url VARCHAR(500),
  coordinator_id UUID REFERENCES teacher_profiles(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_programs_area ON formative_programs(area);
CREATE INDEX idx_programs_level ON formative_programs(level);
CREATE INDEX idx_programs_status ON formative_programs(status);

-- Tabla de escenarios/espacios
CREATE TABLE venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  type venue_type NOT NULL,
  status venue_status NOT NULL DEFAULT 'AVAILABLE',
  capacity INTEGER NOT NULL,
  area NUMERIC(8,2) NOT NULL, -- metros cuadrados
  floor INTEGER,
  building VARCHAR(100),
  description TEXT,
  amenities TEXT[] DEFAULT '{}',
  technical_specs TEXT,
  hourly_rate NUMERIC(12,2),
  daily_rate NUMERIC(12,2),
  image_urls TEXT[] DEFAULT '{}',
  rules TEXT,
  contact_person VARCHAR(200),
  contact_phone VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_venues_type ON venues(type);
CREATE INDEX idx_venues_status ON venues(status);

-- Tabla de grupos/clases
CREATE TABLE course_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID NOT NULL REFERENCES formative_programs(id) ON DELETE RESTRICT,
  teacher_id UUID NOT NULL REFERENCES teacher_profiles(id) ON DELETE RESTRICT,
  group_code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  academic_period VARCHAR(20) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  max_students INTEGER NOT NULL DEFAULT 30,
  current_students INTEGER DEFAULT 0,
  venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
  status program_status NOT NULL DEFAULT 'ACTIVE',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ,

  CONSTRAINT valid_dates CHECK (end_date > start_date),
  CONSTRAINT valid_students CHECK (current_students <= max_students)
);

CREATE INDEX idx_groups_program ON course_groups(program_id);
CREATE INDEX idx_groups_teacher ON course_groups(teacher_id);
CREATE INDEX idx_groups_period ON course_groups(academic_period);
CREATE INDEX idx_groups_status ON course_groups(status);

-- Tabla de horarios de grupo
CREATE TABLE group_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES course_groups(id) ON DELETE CASCADE,
  day_of_week day_of_week NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ,

  CONSTRAINT valid_times CHECK (end_time > start_time),
  CONSTRAINT unique_schedule UNIQUE (group_id, day_of_week, start_time)
);

CREATE INDEX idx_schedules_group ON group_schedules(group_id);
CREATE INDEX idx_schedules_day ON group_schedules(day_of_week);

-- Tabla de matrículas
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE RESTRICT,
  group_id UUID NOT NULL REFERENCES course_groups(id) ON DELETE RESTRICT,
  status enrollment_status NOT NULL DEFAULT 'PENDING',
  enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  withdrawal_date DATE,
  withdrawal_reason TEXT,
  completion_date DATE,
  final_grade qualitative_grade,
  observations TEXT,
  enrolled_by_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ,

  CONSTRAINT unique_enrollment UNIQUE (student_id, group_id)
);

CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_group ON enrollments(group_id);
CREATE INDEX idx_enrollments_status ON enrollments(status);
CREATE INDEX idx_enrollments_date ON enrollments(enrollment_date);

-- Tabla de registros de asistencia
CREATE TABLE attendance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  status attendance_status NOT NULL,
  check_in_time TIME,
  check_out_time TIME,
  observations TEXT,
  recorded_by_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ,

  CONSTRAINT unique_attendance UNIQUE (enrollment_id, session_date)
);

CREATE INDEX idx_attendance_enrollment ON attendance_records(enrollment_id);
CREATE INDEX idx_attendance_date ON attendance_records(session_date);
CREATE INDEX idx_attendance_status ON attendance_records(status);

-- Tabla de evaluaciones cualitativas
CREATE TABLE qualitative_evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  evaluation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  period VARCHAR(50) NOT NULL,
  overall_grade qualitative_grade NOT NULL,
  technical_skills qualitative_grade NOT NULL,
  artistic_expression qualitative_grade NOT NULL,
  commitment qualitative_grade NOT NULL,
  teamwork qualitative_grade NOT NULL,
  strengths TEXT NOT NULL,
  areas_for_improvement TEXT NOT NULL,
  recommendations TEXT NOT NULL,
  teacher_comments TEXT,
  evaluated_by_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ,

  CONSTRAINT unique_evaluation UNIQUE (enrollment_id, period)
);

CREATE INDEX idx_evaluations_enrollment ON qualitative_evaluations(enrollment_id);
CREATE INDEX idx_evaluations_date ON qualitative_evaluations(evaluation_date);
CREATE INDEX idx_evaluations_period ON qualitative_evaluations(period);

-- Tabla de reservas de escenarios
CREATE TABLE venue_reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_code VARCHAR(20) UNIQUE NOT NULL,
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE RESTRICT,
  requester_id UUID REFERENCES users(id) ON DELETE SET NULL,
  requester_name VARCHAR(200) NOT NULL,
  requester_email CITEXT NOT NULL,
  requester_phone VARCHAR(20) NOT NULL,
  organization_name VARCHAR(200),
  event_type event_type NOT NULL,
  event_name VARCHAR(200) NOT NULL,
  event_description TEXT,
  expected_attendees INTEGER NOT NULL,
  start_date_time TIMESTAMPTZ NOT NULL,
  end_date_time TIMESTAMPTZ NOT NULL,
  setup_time TIMESTAMPTZ,
  teardown_time TIMESTAMPTZ,
  status reservation_status NOT NULL DEFAULT 'PENDING',
  requires_equipment BOOLEAN DEFAULT FALSE,
  equipment_notes TEXT,
  special_requirements TEXT,
  approved_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  cancellation_reason TEXT,
  cancellation_date TIMESTAMPTZ,
  total_cost NUMERIC(12,2),
  is_paid BOOLEAN DEFAULT FALSE,
  payment_reference VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ,

  CONSTRAINT valid_reservation_times CHECK (end_date_time > start_date_time)
);

CREATE INDEX idx_reservations_venue ON venue_reservations(venue_id);
CREATE INDEX idx_reservations_status ON venue_reservations(status);
CREATE INDEX idx_reservations_dates ON venue_reservations(start_date_time, end_date_time);
CREATE INDEX idx_reservations_code ON venue_reservations(reservation_code);

-- Tabla de contratos de alquiler
CREATE TABLE rental_contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_number VARCHAR(30) UNIQUE NOT NULL,
  reservation_id UUID REFERENCES venue_reservations(id) ON DELETE SET NULL,
  contract_type contract_type NOT NULL,
  status contract_status NOT NULL DEFAULT 'DRAFT',

  -- Datos del contratante
  contractor_name VARCHAR(200) NOT NULL,
  contractor_document_type document_type NOT NULL,
  contractor_document_number VARCHAR(20) NOT NULL,
  contractor_address VARCHAR(255) NOT NULL,
  contractor_phone VARCHAR(20) NOT NULL,
  contractor_email CITEXT NOT NULL,
  legal_representative VARCHAR(200),

  -- Términos del contrato
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_amount NUMERIC(14,2) NOT NULL,
  deposit_amount NUMERIC(14,2),
  payment_terms TEXT NOT NULL,

  -- Documentos
  contract_document_url VARCHAR(500),
  payment_proof_url VARCHAR(500),
  additional_documents TEXT[] DEFAULT '{}',

  -- Workflow de aprobación
  created_by_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  admin_reviewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  admin_reviewed_at TIMESTAMPTZ,
  admin_comments TEXT,
  legal_reviewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  legal_reviewed_at TIMESTAMPTZ,
  legal_comments TEXT,
  secretary_approver_id UUID REFERENCES users(id) ON DELETE SET NULL,
  secretary_approved_at TIMESTAMPTZ,
  secretary_comments TEXT,

  -- Términos y condiciones
  terms TEXT NOT NULL,
  special_clauses TEXT,

  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ,

  CONSTRAINT valid_contract_dates CHECK (end_date >= start_date)
);

CREATE INDEX idx_contracts_number ON rental_contracts(contract_number);
CREATE INDEX idx_contracts_status ON rental_contracts(status);
CREATE INDEX idx_contracts_reservation ON rental_contracts(reservation_id);

-- Tabla de equipos técnicos
CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(30) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  category equipment_category NOT NULL,
  brand VARCHAR(100),
  model VARCHAR(100),
  serial_number VARCHAR(100),
  status equipment_status NOT NULL DEFAULT 'AVAILABLE',
  condition VARCHAR(50) NOT NULL,
  purchase_date DATE,
  purchase_price NUMERIC(14,2),
  current_value NUMERIC(14,2),
  warranty_expiration DATE,
  location_id UUID REFERENCES venues(id) ON DELETE SET NULL,
  assigned_to_id UUID REFERENCES users(id) ON DELETE SET NULL,
  specifications TEXT,
  image_urls TEXT[] DEFAULT '{}',
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_equipment_code ON equipment(code);
CREATE INDEX idx_equipment_category ON equipment(category);
CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_equipment_location ON equipment(location_id);

-- Tabla de registros de mantenimiento
CREATE TABLE maintenance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_number VARCHAR(30) UNIQUE NOT NULL,
  type maintenance_type NOT NULL,
  status maintenance_status NOT NULL DEFAULT 'SCHEDULED',
  priority maintenance_priority NOT NULL DEFAULT 'MEDIUM',

  equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,

  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  reported_by_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  reported_by_name VARCHAR(200) NOT NULL,
  reported_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  assigned_to_id UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_to_name VARCHAR(200),
  scheduled_date DATE,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  diagnosis TEXT,
  work_performed TEXT,
  parts_cost NUMERIC(12,2),
  labor_cost NUMERIC(12,2),
  total_cost NUMERIC(12,2) GENERATED ALWAYS AS (COALESCE(parts_cost, 0) + COALESCE(labor_cost, 0)) STORED,

  before_photo_urls TEXT[] DEFAULT '{}',
  after_photo_urls TEXT[] DEFAULT '{}',
  attachment_urls TEXT[] DEFAULT '{}',

  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ,

  CONSTRAINT maintenance_target CHECK (
    (equipment_id IS NOT NULL AND venue_id IS NULL) OR
    (equipment_id IS NULL AND venue_id IS NOT NULL) OR
    (equipment_id IS NULL AND venue_id IS NULL)
  )
);

CREATE INDEX idx_maintenance_ticket ON maintenance_records(ticket_number);
CREATE INDEX idx_maintenance_type ON maintenance_records(type);
CREATE INDEX idx_maintenance_status ON maintenance_records(status);
CREATE INDEX idx_maintenance_priority ON maintenance_records(priority);
CREATE INDEX idx_maintenance_equipment ON maintenance_records(equipment_id);
CREATE INDEX idx_maintenance_venue ON maintenance_records(venue_id);

-- Tabla de notificaciones
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  category notification_category NOT NULL,
  status notification_status NOT NULL DEFAULT 'PENDING',
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  sent_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  action_url VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_category ON notifications(category);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- Tabla de logs de auditoría
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_name VARCHAR(200) NOT NULL,
  user_role user_role NOT NULL,
  action audit_action NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID NOT NULL,
  table_name VARCHAR(100) NOT NULL,
  previous_data JSONB,
  new_data JSONB,
  changed_fields TEXT[],
  ip_address INET NOT NULL,
  user_agent TEXT,
  session_id VARCHAR(100),
  description TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_table ON audit_logs(table_name);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);

-- Tabla de tokens de refresh
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  ip_address INET,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);

-- Tabla de sesiones de usuario
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id VARCHAR(100) UNIQUE NOT NULL,
  ip_address INET NOT NULL,
  user_agent TEXT,
  last_activity_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMPTZ NOT NULL,
  is_valid BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_sessions_session_id ON user_sessions(session_id);
CREATE INDEX idx_sessions_expires ON user_sessions(expires_at);

-- Tabla de configuración del sistema
CREATE TABLE system_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  updated_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_config_key ON system_config(key);

-- Tabla de archivos subidos
CREATE TABLE uploaded_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  original_name VARCHAR(255) NOT NULL,
  stored_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size BIGINT NOT NULL,
  path VARCHAR(500) NOT NULL,
  url VARCHAR(500) NOT NULL,
  entity_type VARCHAR(100),
  entity_id UUID,
  uploaded_by_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  is_public BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_files_entity ON uploaded_files(entity_type, entity_id);
CREATE INDEX idx_files_uploaded_by ON uploaded_files(uploaded_by_id);

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger de updated_at a todas las tablas
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN
    SELECT table_name
    FROM information_schema.columns
    WHERE column_name = 'updated_at'
    AND table_schema = 'public'
  LOOP
    EXECUTE format('
      CREATE TRIGGER update_%I_updated_at
      BEFORE UPDATE ON %I
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column()
    ', t, t);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Función para generar código de estudiante
CREATE OR REPLACE FUNCTION generate_student_code()
RETURNS TRIGGER AS $$
DECLARE
  year_part VARCHAR(4);
  seq_num INTEGER;
  new_code VARCHAR(20);
BEGIN
  year_part := TO_CHAR(CURRENT_DATE, 'YYYY');

  SELECT COALESCE(MAX(CAST(SUBSTRING(student_code FROM 4) AS INTEGER)), 0) + 1
  INTO seq_num
  FROM student_profiles
  WHERE student_code LIKE 'EST' || year_part || '%';

  new_code := 'EST' || year_part || LPAD(seq_num::TEXT, 5, '0');
  NEW.student_code := new_code;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_student_code_trigger
BEFORE INSERT ON student_profiles
FOR EACH ROW
WHEN (NEW.student_code IS NULL OR NEW.student_code = '')
EXECUTE FUNCTION generate_student_code();

-- Función para generar código de docente
CREATE OR REPLACE FUNCTION generate_teacher_code()
RETURNS TRIGGER AS $$
DECLARE
  year_part VARCHAR(4);
  seq_num INTEGER;
  new_code VARCHAR(20);
BEGIN
  year_part := TO_CHAR(CURRENT_DATE, 'YYYY');

  SELECT COALESCE(MAX(CAST(SUBSTRING(teacher_code FROM 4) AS INTEGER)), 0) + 1
  INTO seq_num
  FROM teacher_profiles
  WHERE teacher_code LIKE 'DOC' || year_part || '%';

  new_code := 'DOC' || year_part || LPAD(seq_num::TEXT, 4, '0');
  NEW.teacher_code := new_code;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_teacher_code_trigger
BEFORE INSERT ON teacher_profiles
FOR EACH ROW
WHEN (NEW.teacher_code IS NULL OR NEW.teacher_code = '')
EXECUTE FUNCTION generate_teacher_code();

-- Función para generar código de grupo
CREATE OR REPLACE FUNCTION generate_group_code()
RETURNS TRIGGER AS $$
DECLARE
  program_code VARCHAR(10);
  year_part VARCHAR(4);
  seq_num INTEGER;
  new_code VARCHAR(20);
BEGIN
  SELECT SUBSTRING(code FROM 1 FOR 3) INTO program_code
  FROM formative_programs WHERE id = NEW.program_id;

  year_part := SUBSTRING(NEW.academic_period FROM 1 FOR 4);

  SELECT COALESCE(MAX(CAST(SUBSTRING(group_code FROM -3) AS INTEGER)), 0) + 1
  INTO seq_num
  FROM course_groups
  WHERE group_code LIKE program_code || '-' || year_part || '%';

  new_code := program_code || '-' || year_part || '-' || LPAD(seq_num::TEXT, 3, '0');
  NEW.group_code := new_code;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_group_code_trigger
BEFORE INSERT ON course_groups
FOR EACH ROW
WHEN (NEW.group_code IS NULL OR NEW.group_code = '')
EXECUTE FUNCTION generate_group_code();

-- Función para generar código de reserva
CREATE OR REPLACE FUNCTION generate_reservation_code()
RETURNS TRIGGER AS $$
DECLARE
  date_part VARCHAR(8);
  seq_num INTEGER;
  new_code VARCHAR(20);
BEGIN
  date_part := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');

  SELECT COALESCE(MAX(CAST(SUBSTRING(reservation_code FROM -4) AS INTEGER)), 0) + 1
  INTO seq_num
  FROM venue_reservations
  WHERE reservation_code LIKE 'RES-' || date_part || '%';

  new_code := 'RES-' || date_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  NEW.reservation_code := new_code;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_reservation_code_trigger
BEFORE INSERT ON venue_reservations
FOR EACH ROW
WHEN (NEW.reservation_code IS NULL OR NEW.reservation_code = '')
EXECUTE FUNCTION generate_reservation_code();

-- Función para generar número de contrato
CREATE OR REPLACE FUNCTION generate_contract_number()
RETURNS TRIGGER AS $$
DECLARE
  year_part VARCHAR(4);
  seq_num INTEGER;
  new_code VARCHAR(30);
BEGIN
  year_part := TO_CHAR(CURRENT_DATE, 'YYYY');

  SELECT COALESCE(MAX(CAST(SUBSTRING(contract_number FROM -5) AS INTEGER)), 0) + 1
  INTO seq_num
  FROM rental_contracts
  WHERE contract_number LIKE 'CTR-' || year_part || '%';

  new_code := 'CTR-' || year_part || '-' || LPAD(seq_num::TEXT, 5, '0');
  NEW.contract_number := new_code;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_contract_number_trigger
BEFORE INSERT ON rental_contracts
FOR EACH ROW
WHEN (NEW.contract_number IS NULL OR NEW.contract_number = '')
EXECUTE FUNCTION generate_contract_number();

-- Función para generar número de ticket de mantenimiento
CREATE OR REPLACE FUNCTION generate_maintenance_ticket()
RETURNS TRIGGER AS $$
DECLARE
  date_part VARCHAR(8);
  seq_num INTEGER;
  new_code VARCHAR(30);
BEGIN
  date_part := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');

  SELECT COALESCE(MAX(CAST(SUBSTRING(ticket_number FROM -4) AS INTEGER)), 0) + 1
  INTO seq_num
  FROM maintenance_records
  WHERE ticket_number LIKE 'MNT-' || date_part || '%';

  new_code := 'MNT-' || date_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  NEW.ticket_number := new_code;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_maintenance_ticket_trigger
BEFORE INSERT ON maintenance_records
FOR EACH ROW
WHEN (NEW.ticket_number IS NULL OR NEW.ticket_number = '')
EXECUTE FUNCTION generate_maintenance_ticket();

-- Función para actualizar contador de estudiantes en grupo
CREATE OR REPLACE FUNCTION update_group_student_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'ACTIVE' THEN
    UPDATE course_groups
    SET current_students = current_students + 1
    WHERE id = NEW.group_id;
  ELSIF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND NEW.status != 'ACTIVE' AND OLD.status = 'ACTIVE') THEN
    UPDATE course_groups
    SET current_students = current_students - 1
    WHERE id = COALESCE(OLD.group_id, NEW.group_id);
  ELSIF TG_OP = 'UPDATE' AND NEW.status = 'ACTIVE' AND OLD.status != 'ACTIVE' THEN
    UPDATE course_groups
    SET current_students = current_students + 1
    WHERE id = NEW.group_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_group_count_trigger
AFTER INSERT OR UPDATE OR DELETE ON enrollments
FOR EACH ROW
EXECUTE FUNCTION update_group_student_count();

-- Función para verificar disponibilidad de escenario
CREATE OR REPLACE FUNCTION check_venue_availability()
RETURNS TRIGGER AS $$
DECLARE
  conflict_count INTEGER;
BEGIN
  IF NEW.status IN ('PENDING', 'APPROVED', 'IN_PROGRESS') THEN
    SELECT COUNT(*) INTO conflict_count
    FROM venue_reservations
    WHERE venue_id = NEW.venue_id
      AND id != NEW.id
      AND status IN ('APPROVED', 'IN_PROGRESS')
      AND (
        (NEW.start_date_time, NEW.end_date_time) OVERLAPS (start_date_time, end_date_time)
      );

    IF conflict_count > 0 THEN
      RAISE EXCEPTION 'El escenario no está disponible en el horario solicitado';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_venue_availability_trigger
BEFORE INSERT OR UPDATE ON venue_reservations
FOR EACH ROW
EXECUTE FUNCTION check_venue_availability();

-- Función para determinar si estudiante es menor de edad
CREATE OR REPLACE FUNCTION check_student_is_minor()
RETURNS TRIGGER AS $$
DECLARE
  birth_date DATE;
BEGIN
  SELECT pp.birth_date INTO birth_date
  FROM person_profiles pp
  WHERE pp.id = NEW.person_profile_id;

  NEW.is_minor := (DATE_PART('year', AGE(birth_date)) < 18);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_student_is_minor_trigger
BEFORE INSERT OR UPDATE ON student_profiles
FOR EACH ROW
EXECUTE FUNCTION check_student_is_minor();

-- ============================================
-- VISTAS
-- ============================================

-- Vista de estudiantes con información completa
CREATE OR REPLACE VIEW v_students_full AS
SELECT
  sp.id,
  sp.student_code,
  pp.document_type,
  pp.document_number,
  pp.first_name || ' ' || COALESCE(pp.middle_name || ' ', '') || pp.last_name || ' ' || COALESCE(pp.second_last_name, '') AS full_name,
  pp.first_name,
  pp.last_name,
  pp.gender,
  pp.birth_date,
  DATE_PART('year', AGE(pp.birth_date)) AS age,
  pp.mobile_number AS phone,
  u.email,
  pp.address,
  pp.neighborhood,
  pp.city,
  pp.stratum,
  sp.enrollment_date,
  sp.has_disability,
  sp.is_minor,
  sp.guardian_name,
  sp.guardian_phone,
  (SELECT COUNT(*) FROM enrollments e WHERE e.student_id = sp.id AND e.status = 'ACTIVE') AS active_enrollments,
  (SELECT COUNT(*) FROM enrollments e WHERE e.student_id = sp.id AND e.status = 'COMPLETED') AS completed_programs,
  sp.is_active,
  sp.created_at
FROM student_profiles sp
JOIN person_profiles pp ON sp.person_profile_id = pp.id
LEFT JOIN users u ON pp.user_id = u.id
WHERE sp.deleted_at IS NULL;

-- Vista de docentes con información completa
CREATE OR REPLACE VIEW v_teachers_full AS
SELECT
  tp.id,
  tp.teacher_code,
  pp.document_type,
  pp.document_number,
  pp.first_name || ' ' || COALESCE(pp.middle_name || ' ', '') || pp.last_name || ' ' || COALESCE(pp.second_last_name, '') AS full_name,
  pp.first_name,
  pp.last_name,
  pp.gender,
  pp.mobile_number AS phone,
  u.email,
  tp.specialty,
  tp.academic_degree,
  tp.years_experience,
  tp.hire_date,
  tp.contract_type,
  (SELECT COUNT(*) FROM course_groups cg WHERE cg.teacher_id = tp.id AND cg.status = 'ACTIVE') AS active_groups,
  (SELECT COUNT(DISTINCT e.student_id) FROM enrollments e
   JOIN course_groups cg ON e.group_id = cg.id
   WHERE cg.teacher_id = tp.id AND e.status = 'ACTIVE') AS total_students,
  tp.is_active,
  tp.created_at
FROM teacher_profiles tp
JOIN person_profiles pp ON tp.person_profile_id = pp.id
LEFT JOIN users u ON pp.user_id = u.id
WHERE tp.deleted_at IS NULL;

-- Vista de grupos con información completa
CREATE OR REPLACE VIEW v_groups_full AS
SELECT
  cg.id,
  cg.group_code,
  cg.name,
  fp.id AS program_id,
  fp.name AS program_name,
  fp.area,
  fp.level,
  tp.id AS teacher_id,
  pp.first_name || ' ' || pp.last_name AS teacher_name,
  cg.academic_period,
  cg.start_date,
  cg.end_date,
  cg.max_students,
  cg.current_students,
  cg.max_students - cg.current_students AS available_spots,
  v.id AS venue_id,
  v.name AS venue_name,
  cg.status,
  cg.is_active,
  cg.created_at
FROM course_groups cg
JOIN formative_programs fp ON cg.program_id = fp.id
JOIN teacher_profiles tp ON cg.teacher_id = tp.id
JOIN person_profiles pp ON tp.person_profile_id = pp.id
LEFT JOIN venues v ON cg.venue_id = v.id
WHERE cg.deleted_at IS NULL;

-- Vista de reservas con información completa
CREATE OR REPLACE VIEW v_reservations_full AS
SELECT
  vr.id,
  vr.reservation_code,
  v.id AS venue_id,
  v.name AS venue_name,
  v.type AS venue_type,
  vr.requester_name,
  vr.requester_email,
  vr.requester_phone,
  vr.organization_name,
  vr.event_type,
  vr.event_name,
  vr.expected_attendees,
  vr.start_date_time,
  vr.end_date_time,
  EXTRACT(EPOCH FROM (vr.end_date_time - vr.start_date_time)) / 3600 AS duration_hours,
  vr.status,
  vr.total_cost,
  vr.is_paid,
  vr.created_at,
  vr.approved_at,
  approver.email AS approved_by
FROM venue_reservations vr
JOIN venues v ON vr.venue_id = v.id
LEFT JOIN users approver ON vr.approved_by_id = approver.id
WHERE vr.deleted_at IS NULL;

-- Vista de estadísticas de matrícula por programa
CREATE OR REPLACE VIEW v_enrollment_stats_by_program AS
SELECT
  fp.id AS program_id,
  fp.code AS program_code,
  fp.name AS program_name,
  fp.area,
  fp.level,
  COUNT(DISTINCT e.student_id) AS total_students,
  COUNT(DISTINCT CASE WHEN e.status = 'ACTIVE' THEN e.student_id END) AS active_students,
  COUNT(DISTINCT CASE WHEN e.status = 'COMPLETED' THEN e.student_id END) AS completed_students,
  COUNT(DISTINCT CASE WHEN e.status = 'WITHDRAWN' THEN e.student_id END) AS withdrawn_students,
  ROUND(
    COUNT(DISTINCT CASE WHEN e.status = 'WITHDRAWN' THEN e.student_id END)::NUMERIC /
    NULLIF(COUNT(DISTINCT e.student_id), 0) * 100, 2
  ) AS dropout_rate
FROM formative_programs fp
LEFT JOIN course_groups cg ON fp.id = cg.program_id
LEFT JOIN enrollments e ON cg.id = e.group_id
WHERE fp.deleted_at IS NULL
GROUP BY fp.id, fp.code, fp.name, fp.area, fp.level;

-- Vista de asistencia por estudiante
CREATE OR REPLACE VIEW v_attendance_summary AS
SELECT
  e.id AS enrollment_id,
  sp.student_code,
  pp.first_name || ' ' || pp.last_name AS student_name,
  cg.group_code,
  cg.name AS group_name,
  COUNT(*) AS total_sessions,
  COUNT(CASE WHEN ar.status = 'PRESENT' THEN 1 END) AS present_count,
  COUNT(CASE WHEN ar.status = 'ABSENT' THEN 1 END) AS absent_count,
  COUNT(CASE WHEN ar.status = 'LATE' THEN 1 END) AS late_count,
  COUNT(CASE WHEN ar.status = 'EXCUSED' THEN 1 END) AS excused_count,
  ROUND(
    COUNT(CASE WHEN ar.status IN ('PRESENT', 'LATE') THEN 1 END)::NUMERIC /
    NULLIF(COUNT(*), 0) * 100, 2
  ) AS attendance_rate
FROM enrollments e
JOIN student_profiles sp ON e.student_id = sp.id
JOIN person_profiles pp ON sp.person_profile_id = pp.id
JOIN course_groups cg ON e.group_id = cg.id
LEFT JOIN attendance_records ar ON e.id = ar.enrollment_id
WHERE e.deleted_at IS NULL
GROUP BY e.id, sp.student_code, pp.first_name, pp.last_name, cg.group_code, cg.name;

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Usuario administrador inicial
COMMIT;
