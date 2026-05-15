import { storage } from "./mockApi";

const DATASET_VERSION = "2026-05-real-v1";

const monthsAgo = (offset: number, day: number) => {
  const date = new Date();
  date.setMonth(date.getMonth() - offset, day);
  return date.toISOString();
};

const students = [
  {
    id: "std-001",
    documentType: "CC",
    documentNumber: "1088254101",
    firstName: "Valentina",
    lastName: "Cardona",
    email: "valentina.cardona@correo.com",
    phone: "3104567821",
    birthDate: "2007-08-14",
    gender: "FEMALE",
    city: "Pereira",
    address: "Cra 8 #21-34",
    enrollmentStatus: "ACTIVE",
    createdAt: monthsAgo(5, 12),
  },
  {
    id: "std-002",
    documentType: "TI",
    documentNumber: "1034567821",
    firstName: "Juan David",
    lastName: "Londoño",
    email: "juand.londono@correo.com",
    phone: "3126657812",
    birthDate: "2008-02-03",
    gender: "MALE",
    city: "Dosquebradas",
    address: "Mz 4 Cs 18",
    enrollmentStatus: "ACTIVE",
    createdAt: monthsAgo(4, 10),
  },
  {
    id: "std-003",
    documentType: "CC",
    documentNumber: "42156897",
    firstName: "Laura",
    lastName: "Restrepo",
    email: "laura.restrepo@correo.com",
    phone: "3007789452",
    birthDate: "2001-11-21",
    gender: "FEMALE",
    city: "Pereira",
    address: "Av Sur 45-17",
    enrollmentStatus: "ACTIVE",
    createdAt: monthsAgo(3, 6),
  },
  {
    id: "std-004",
    documentType: "CC",
    documentNumber: "1094893421",
    firstName: "Santiago",
    lastName: "Mejía",
    email: "santiago.mejia@correo.com",
    phone: "3159021134",
    birthDate: "2006-05-19",
    gender: "MALE",
    city: "Santa Rosa de Cabal",
    address: "Cl 11 #14-26",
    enrollmentStatus: "ACTIVE",
    createdAt: monthsAgo(2, 7),
  },
  {
    id: "std-005",
    documentType: "CC",
    documentNumber: "24780516",
    firstName: "Mariana",
    lastName: "Franco",
    email: "mariana.franco@correo.com",
    phone: "3142201187",
    birthDate: "1999-04-04",
    gender: "FEMALE",
    city: "Pereira",
    address: "Cl 24 #9-58",
    enrollmentStatus: "ACTIVE",
    createdAt: monthsAgo(1, 15),
  },
  {
    id: "std-006",
    documentType: "TI",
    documentNumber: "1056721890",
    firstName: "Nicolás",
    lastName: "Salazar",
    email: "nicolas.salazar@correo.com",
    phone: "3201189044",
    birthDate: "2009-09-09",
    gender: "MALE",
    city: "Pereira",
    address: "Brr Cuba Et 3",
    enrollmentStatus: "ACTIVE",
    createdAt: monthsAgo(0, 3),
  },
];

const teachers = [
  {
    id: "teacher-001",
    documentType: "CC",
    documentNumber: "42011876",
    firstName: "María Fernanda",
    lastName: "García",
    email: "maria.garcia@lucytejada.gov.co",
    phone: "3156742201",
    specialties: ["Danza"],
    yearsExperience: 11,
    status: "ACTIVE",
    createdAt: monthsAgo(8, 8),
  },
  {
    id: "teacher-002",
    documentType: "CC",
    documentNumber: "18544771",
    firstName: "Juan Esteban",
    lastName: "Pérez",
    email: "juan.perez@lucytejada.gov.co",
    phone: "3114400988",
    specialties: ["Música"],
    yearsExperience: 14,
    status: "ACTIVE",
    createdAt: monthsAgo(9, 10),
  },
  {
    id: "teacher-003",
    documentType: "CC",
    documentNumber: "31455882",
    firstName: "Ana Lucía",
    lastName: "López",
    email: "ana.lopez@lucytejada.gov.co",
    phone: "3178904412",
    specialties: ["Teatro"],
    yearsExperience: 9,
    status: "ACTIVE",
    createdAt: monthsAgo(6, 2),
  },
  {
    id: "teacher-004",
    documentType: "CC",
    documentNumber: "30221457",
    firstName: "Carlos Andrés",
    lastName: "Ramírez",
    email: "carlos.ramirez@lucytejada.gov.co",
    phone: "3009127765",
    specialties: ["Artes Visuales"],
    yearsExperience: 12,
    status: "ACTIVE",
    createdAt: monthsAgo(7, 19),
  },
];

const programs = [
  {
    id: "program-001",
    name: "Ballet Clásico Infantil",
    area: "Danza",
    level: "Básico",
    duration: 12,
    description: "Formación técnica inicial en ballet para niños y jóvenes.",
    status: "ACTIVE",
    maxStudents: 20,
    teacherId: "teacher-001",
    teacherName: "María Fernanda García",
    createdAt: monthsAgo(8, 12),
  },
  {
    id: "program-002",
    name: "Guitarra Popular",
    area: "Música",
    level: "Intermedio",
    duration: 10,
    description: "Lectura, técnica y repertorio de guitarra orientado a ensamble.",
    status: "ACTIVE",
    maxStudents: 18,
    teacherId: "teacher-002",
    teacherName: "Juan Esteban Pérez",
    createdAt: monthsAgo(7, 8),
  },
  {
    id: "program-003",
    name: "Laboratorio Escénico",
    area: "Teatro",
    level: "Avanzado",
    duration: 8,
    description: "Exploración de creación colectiva, voz y movimiento escénico.",
    status: "ACTIVE",
    maxStudents: 16,
    teacherId: "teacher-003",
    teacherName: "Ana Lucía López",
    createdAt: monthsAgo(6, 22),
  },
  {
    id: "program-004",
    name: "Pintura y Dibujo Contemporáneo",
    area: "Artes Visuales",
    level: "Básico",
    duration: 14,
    description: "Introducción a composición, color y técnicas mixtas.",
    status: "ACTIVE",
    maxStudents: 15,
    teacherId: "teacher-004",
    teacherName: "Carlos Andrés Ramírez",
    createdAt: monthsAgo(5, 4),
  },
];

const groups = [
  {
    id: "group-001",
    name: "Grupo Ballet A",
    programId: "program-001",
    programName: "Ballet Clásico Infantil",
    teacherId: "teacher-001",
    teacherName: "María Fernanda García",
    schedule: "Lun-Mié 3:00 PM - 5:00 PM",
    capacity: 20,
    enrolled: 6,
    status: "ACTIVE",
  },
  {
    id: "group-002",
    name: "Grupo Guitarra B",
    programId: "program-002",
    programName: "Guitarra Popular",
    teacherId: "teacher-002",
    teacherName: "Juan Esteban Pérez",
    schedule: "Mar-Jue 4:00 PM - 6:00 PM",
    capacity: 18,
    enrolled: 5,
    status: "ACTIVE",
  },
  {
    id: "group-003",
    name: "Grupo Teatro Noche",
    programId: "program-003",
    programName: "Laboratorio Escénico",
    teacherId: "teacher-003",
    teacherName: "Ana Lucía López",
    schedule: "Vie 2:00 PM - 5:00 PM",
    capacity: 16,
    enrolled: 4,
    status: "ACTIVE",
  },
  {
    id: "group-004",
    name: "Grupo Visuales Sábado",
    programId: "program-004",
    programName: "Pintura y Dibujo Contemporáneo",
    teacherId: "teacher-004",
    teacherName: "Carlos Andrés Ramírez",
    schedule: "Sáb 9:00 AM - 12:00 PM",
    capacity: 15,
    enrolled: 3,
    status: "ACTIVE",
  },
];

const enrollments = [
  {
    id: "enr-001",
    studentId: "std-001",
    studentName: "Valentina Cardona",
    groupId: "group-001",
    groupName: "Grupo Ballet A",
    programName: "Ballet Clásico Infantil",
    enrollmentDate: monthsAgo(5, 15).slice(0, 10),
    status: "ACTIVE",
    requestedByEmail: "valentina.cardona@correo.com",
  },
  {
    id: "enr-002",
    studentId: "std-002",
    studentName: "Juan David Londoño",
    groupId: "group-002",
    groupName: "Grupo Guitarra B",
    programName: "Guitarra Popular",
    enrollmentDate: monthsAgo(4, 11).slice(0, 10),
    status: "ACTIVE",
    requestedByEmail: "juand.londono@correo.com",
  },
  {
    id: "enr-003",
    studentId: "std-003",
    studentName: "Laura Restrepo",
    groupId: "group-003",
    groupName: "Grupo Teatro Noche",
    programName: "Laboratorio Escénico",
    enrollmentDate: monthsAgo(3, 8).slice(0, 10),
    status: "ACTIVE",
    requestedByEmail: "laura.restrepo@correo.com",
  },
  {
    id: "enr-004",
    studentId: "std-004",
    studentName: "Santiago Mejía",
    groupId: "group-001",
    groupName: "Grupo Ballet A",
    programName: "Ballet Clásico Infantil",
    enrollmentDate: monthsAgo(2, 9).slice(0, 10),
    status: "ACTIVE",
    requestedByEmail: "santiago.mejia@correo.com",
  },
  {
    id: "enr-005",
    studentId: "std-005",
    studentName: "Mariana Franco",
    groupId: "group-004",
    groupName: "Grupo Visuales Sábado",
    programName: "Pintura y Dibujo Contemporáneo",
    enrollmentDate: monthsAgo(1, 17).slice(0, 10),
    status: "ACTIVE",
    requestedByEmail: "mariana.franco@correo.com",
  },
  {
    id: "enr-006",
    studentId: "std-006",
    studentName: "Nicolás Salazar",
    groupId: "",
    groupName: "Pendiente de asignación",
    programName: "Guitarra Popular",
    enrollmentDate: monthsAgo(0, 6).slice(0, 10),
    status: "PENDING",
    requestedByEmail: "nicolas.salazar@correo.com",
  },
];

const venues = [
  {
    id: "venue-001",
    name: "Auditorio Principal Lucy Tejada",
    capacity: 320,
    type: "Teatro",
    status: "AVAILABLE",
    location: "Bloque A - Piso 1",
    description: "Escenario principal para conciertos, galas, teatro y actos institucionales.",
  },
  {
    id: "venue-002",
    name: "Sala de Danza Experimental",
    capacity: 45,
    type: "Danza",
    status: "AVAILABLE",
    location: "Bloque B - Piso 2",
    description: "Espacio con piso especializado y espejos para clases y ensayos coreográficos.",
  },
  {
    id: "venue-003",
    name: "Sala de Ensamble Musical",
    capacity: 30,
    type: "Música",
    status: "MAINTENANCE",
    location: "Bloque C - Piso 1",
    description: "Sala técnica equipada para ensambles, práctica instrumental y grabación básica.",
  },
  {
    id: "venue-004",
    name: "Galería Taller de Artes Visuales",
    capacity: 60,
    type: "Artes Visuales",
    status: "AVAILABLE",
    location: "Bloque D - Piso 1",
    description: "Espacio expositivo y de formación para talleres, montajes y muestras temporales.",
  },
];

const reservations = [
  {
    id: "res-001",
    venueId: "venue-001",
    venueName: "Auditorio Principal Lucy Tejada",
    venueType: "TEATRO",
    eventType: "Concierto",
    eventName: "Muestra Semestral de Música",
    date: monthsAgo(0, 20).slice(0, 10),
    startTime: "18:00",
    endTime: "20:30",
    status: "APPROVED",
    requestedBy: {
      name: "Coordinación Académica",
      email: "coordinacion@lucytejada.gov.co",
    },
  },
  {
    id: "res-002",
    venueId: "venue-002",
    venueName: "Sala de Danza Experimental",
    venueType: "DANZA",
    eventType: "Ensayo coreográfico",
    eventName: "Ensayo Grupo Ballet A",
    date: monthsAgo(0, 18).slice(0, 10),
    startTime: "15:00",
    endTime: "17:00",
    status: "APPROVED",
    requestedBy: {
      name: "María Fernanda García",
      email: "maria.garcia@lucytejada.gov.co",
    },
  },
  {
    id: "res-003",
    venueId: "venue-004",
    venueName: "Galería Taller de Artes Visuales",
    venueType: "ARTES_VISUALES",
    eventType: "Exposición artística",
    eventName: "Solicitud Exposición Colectiva",
    date: monthsAgo(0, 28).slice(0, 10),
    startTime: "09:00",
    endTime: "17:00",
    status: "PENDING",
    requestedBy: {
      name: "Fundación Cultural del Café",
      email: "contacto@fundacioncafe.org",
      phone: "3109982211",
      documentId: "901234567",
    },
  },
];

const maintenanceRecords = [
  {
    id: "mnt-001",
    venueId: "venue-003",
    venueName: "Sala de Ensamble Musical",
    type: "Preventivo",
    status: "IN_PROGRESS",
    scheduledDate: monthsAgo(0, 16).slice(0, 10),
    assignedTo: "Equipo Técnico",
  },
  {
    id: "mnt-002",
    venueId: "venue-001",
    venueName: "Auditorio Principal Lucy Tejada",
    type: "Correctivo",
    status: "PENDING",
    scheduledDate: monthsAgo(0, 25).slice(0, 10),
    assignedTo: "Infraestructura",
  },
];

const contracts = [
  {
    id: "ctr-001",
    contractor: "Asociación Cultural Pereira Viva",
    venueName: "Auditorio Principal Lucy Tejada",
    status: "PENDING",
    eventDate: monthsAgo(0, 22).slice(0, 10),
    amount: 2800000,
  },
  {
    id: "ctr-002",
    contractor: "Colectivo Escena Local",
    venueName: "Sala de Danza Experimental",
    status: "APPROVED",
    eventDate: monthsAgo(0, 29).slice(0, 10),
    amount: 950000,
  },
];

const attendanceRecords = [
  {
    studentName: "Valentina Cardona",
    area: "Danza",
    date: monthsAgo(0, 5),
    status: "PRESENT",
  },
  {
    studentName: "Santiago Mejía",
    area: "Danza",
    date: monthsAgo(0, 5),
    status: "PRESENT",
  },
  {
    studentName: "Juan David Londoño",
    area: "Música",
    date: monthsAgo(0, 6),
    status: "PRESENT",
  },
  {
    studentName: "Nicolás Salazar",
    area: "Música",
    date: monthsAgo(0, 6),
    status: "ABSENT",
  },
  {
    studentName: "Laura Restrepo",
    area: "Teatro",
    date: monthsAgo(0, 7),
    status: "PRESENT",
  },
  {
    studentName: "Mariana Franco",
    area: "Artes Visuales",
    date: monthsAgo(0, 8),
    status: "PRESENT",
  },
];

const evaluations = [
  {
    studentName: "Valentina Cardona",
    date: monthsAgo(0, 5),
    creativity: 4,
    technique: 5,
    participation: 5,
    progress: 4,
    average: 4.5,
  },
  {
    studentName: "Juan David Londoño",
    date: monthsAgo(0, 6),
    creativity: 4,
    technique: 4,
    participation: 4,
    progress: 5,
    average: 4.25,
  },
  {
    studentName: "Laura Restrepo",
    date: monthsAgo(0, 7),
    creativity: 5,
    technique: 4,
    participation: 5,
    progress: 5,
    average: 4.75,
  },
];

const isLegacyDemoStudents = (data: Array<Record<string, unknown>>) =>
  data.length > 0 &&
  data.every(
    (student) =>
      String(student.firstName || "").startsWith("Estudiante") ||
      String(student.email || "").includes("@example.com")
  );

const isLegacyDemoTeachers = (data: Array<Record<string, unknown>>) =>
  data.length > 0 &&
  data.every(
    (teacher) =>
      String(teacher.firstName || "").startsWith("Docente") &&
      String(teacher.lastName || "").startsWith("Apellido")
  );

const isLegacyDemoGroups = (data: Array<Record<string, unknown>>) =>
  data.length > 0 &&
  data.every((group) => ["Grupo A", "Grupo B", "Grupo C"].includes(String(group.name || "")));

export const institutionDataset = {
  students,
  teachers,
  programs,
  groups,
  enrollments,
  venues,
  reservations,
  maintenance_records: maintenanceRecords,
  contracts,
  attendance_records: attendanceRecords,
  evaluations,
};

export const ensureInstitutionData = () => {
  const currentVersion = storage.get<string>("dataset_version");
  const currentStudents = storage.get<Array<Record<string, unknown>>>("students") || [];
  const currentTeachers = storage.get<Array<Record<string, unknown>>>("teachers") || [];
  const currentGroups = storage.get<Array<Record<string, unknown>>>("groups") || [];

  const shouldRefresh =
    currentVersion !== DATASET_VERSION &&
    (
      currentStudents.length === 0 ||
      currentTeachers.length === 0 ||
      currentGroups.length === 0 ||
      isLegacyDemoStudents(currentStudents) ||
      isLegacyDemoTeachers(currentTeachers) ||
      isLegacyDemoGroups(currentGroups)
    );

  if (!shouldRefresh) {
    return;
  }

  Object.entries(institutionDataset).forEach(([key, value]) => {
    storage.set(key, value);
  });
  storage.set("dataset_version", DATASET_VERSION);
};

export const getInstitutionDatasetVersion = () => DATASET_VERSION;
