# ============================================

# PLATAFORMA DE GESTIÓN INSTITUCIONAL

# CENTRO CULTURAL LUCY TEJADA

# ============================================

## Descripción

Plataforma web integral para la gestión académica y administrativa del Centro Cultural Lucy Tejada de Pereira, Colombia. El sistema permite la administración de programas de formación artística en danza, música, teatro y artes visuales.

## Arquitectura

### Stack Tecnológico

**Backend:**

- Node.js 20+
- NestJS 10
- TypeScript 5.3
- PostgreSQL 15
- Redis 7
- TypeORM

**Frontend:**

- React 18
- Vite 5
- TypeScript 5.3
- TailwindCSS 3.4
- Zustand (state management)
- React Query (data fetching)
- Recharts (visualizaciones)
- Framer Motion (animaciones)

**Infraestructura:**

- Docker & Docker Compose
- Nginx (API Gateway)
- JWT Authentication
- RBAC (Role-Based Access Control)

### Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│                    React + Vite + TailwindCSS                   │
│                         (PWA Ready)                              │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       API GATEWAY                                │
│                         (Nginx)                                  │
│   - Rate Limiting   - CORS   - Load Balancing   - SSL           │
└──────┬──────────────────┬──────────────────┬────────────────────┘
       │                  │                  │
       ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Auth Service │  │  Academic    │  │Infrastructure│
│   (NestJS)   │  │   Service    │  │   Service    │
│              │  │   (NestJS)   │  │   (NestJS)   │
│ - JWT        │  │              │  │              │
│ - RBAC       │  │ - Students   │  │ - Venues     │
│ - Sessions   │  │ - Teachers   │  │ - Reservas   │
│ - Audit      │  │ - Programs   │  │ - Contracts  │
│              │  │ - Groups     │  │ - Equipment  │
│              │  │ - Attendance │  │ - Maintenance│
│              │  │ - Evaluations│  │              │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                  │
       └────────────────┬┴──────────────────┘
                        │
                        ▼
         ┌──────────────────────────────┐
         │        PostgreSQL            │
         │    (Base de Datos)           │
         └──────────────┬───────────────┘
                        │
                        ▼
         ┌──────────────────────────────┐
         │           Redis              │
         │     (Cache & Sessions)       │
         └──────────────────────────────┘
```

## Estructura del Proyecto

```
lucy-tejada-platform/
├── docker/                     # Configuración Docker
│   ├── docker-compose.yml
│   ├── init-db/               # Scripts de inicialización BD
│   └── nginx/                 # Configuración Nginx
├── docs/                      # Documentación
├── frontend/
│   └── web-app/              # Aplicación React
│       ├── src/
│       │   ├── assets/
│       │   ├── components/   # Componentes reutilizables
│       │   ├── features/     # Módulos por funcionalidad
│       │   ├── hooks/        # Custom hooks
│       │   ├── pages/        # Páginas/Vistas
│       │   ├── services/     # Servicios API
│       │   ├── store/        # Estado global (Zustand)
│       │   ├── styles/       # Estilos globales
│       │   └── utils/        # Utilidades
│       └── package.json
├── packages/
│   ├── shared/               # Utilidades compartidas
│   └── types/                # Tipos TypeScript compartidos
├── services/
│   ├── auth-service/         # Servicio de autenticación
│   ├── academic-service/     # Gestión académica
│   ├── infrastructure-service/  # Escenarios y bienes
│   ├── reports-service/      # Generación de reportes
│   └── notification-service/ # Notificaciones
└── package.json              # Configuración monorepo
```

## Módulos del Sistema

### Módulo 1: Gestión Académica

- Registro y gestión de estudiantes
- Gestión de docentes
- Programas formativos (Danza, Música, Teatro, Artes Visuales)
- Grupos y horarios
- Matrículas
- Control de asistencia
- Evaluaciones cualitativas
- Dashboards estadísticos
- Reportes (PDF/Excel)

### Módulo 2: Escenarios y Bienes Culturales

- Agenda digital de escenarios
- Sistema de reservas con validación de disponibilidad
- Workflow de aprobación de contratos
- Gestión de equipos técnicos
- Registro de mantenimiento con fotos
- Panel de operarios

## Roles del Sistema (RBAC)

| Rol                     | Permisos                                           |
| ----------------------- | -------------------------------------------------- |
| ADMIN                   | Acceso completo a todos los módulos                |
| DOCENTE                 | Gestión de asistencia y evaluaciones de sus grupos |
| ESTUDIANTE              | Consulta de su información académica               |
| AUXILIAR_ADMINISTRATIVO | Gestión de estudiantes, matrículas y reservas      |
| OFICINA_JURIDICA        | Revisión y aprobación de contratos                 |
| TECNICO_OPERATIVO       | Gestión de escenarios, equipos y mantenimiento     |
| OPERARIO_LOGISTICO      | Consulta de reservas y mantenimiento               |

## Instalación y Ejecución

### Requisitos

- Node.js 20+
- Docker y Docker Compose
- Git

### Desarrollo Local

```bash
# Clonar repositorio
git clone https://github.com/centro-cultural-lucy-tejada/plataforma-gestion.git
cd lucy-tejada-platform

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Iniciar servicios con Docker
npm run docker:up

# O desarrollo sin Docker
npm run dev
```

### Variables de Entorno

```env
# Ambiente
NODE_ENV=development

# Base de Datos
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=lucy_tejada_db
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# JWT
JWT_SECRET=your_jwt_secret_min_64_chars
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRES_IN=24h

# Frontend
VITE_API_URL=http://localhost:3000/api/v1
```

## Endpoints API Principales

### Autenticación

```
POST /api/v1/auth/login          # Iniciar sesión
POST /api/v1/auth/refresh        # Renovar tokens
POST /api/v1/auth/logout         # Cerrar sesión
POST /api/v1/auth/change-password # Cambiar contraseña
GET  /api/v1/auth/me             # Usuario actual
```

### Estudiantes

```
GET    /api/v1/students          # Listar estudiantes
POST   /api/v1/students          # Crear estudiante
GET    /api/v1/students/:id      # Obtener estudiante
PATCH  /api/v1/students/:id      # Actualizar estudiante
DELETE /api/v1/students/:id      # Eliminar estudiante
GET    /api/v1/students/statistics # Estadísticas
```

### Dashboard

```
GET /api/v1/dashboard/stats                  # Estadísticas generales
GET /api/v1/dashboard/enrollments-by-program # Matrículas por programa
GET /api/v1/dashboard/geographic-distribution # Distribución geográfica
GET /api/v1/dashboard/dropout-analysis       # Análisis de deserción
GET /api/v1/dashboard/enrollment-trend       # Tendencia de matrículas
GET /api/v1/dashboard/attendance-by-area     # Asistencia por área
```

## Seguridad

- Autenticación JWT con refresh tokens
- RBAC (Control de acceso basado en roles)
- Encriptación de datos sensibles (Ley 1581 de 2012)
- Rate limiting por IP
- Validación de entrada con class-validator
- Sanitización de datos
- Headers de seguridad (CORS, CSP, etc.)
- Auditoría completa de acciones

## Cumplimiento Normativo

El sistema cumple con:

- **Ley 1581 de 2012** - Protección de datos personales en Colombia
- Consentimiento informado para tratamiento de datos
- Autorización de uso de imagen
- Logs de auditoría con retención de 10 años

## Licencia

Sistema desarrollado para uso exclusivo del Centro Cultural Lucy Tejada - Alcaldía de Pereira.

---

**Centro Cultural Lucy Tejada**
Carrera 10 No. 16-60, Pereira, Risaralda
Tel: (606) 311 6121
contacto@lucytejada.gov.co
