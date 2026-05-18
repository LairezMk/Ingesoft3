/**
 * ============================================
 * DASHBOARD SERVICE - SERVICIOS DE DASHBOARD
 * ============================================
 */

import { ApiResponse } from "./api";
import { storage } from "./mockApi";

export interface DashboardStats {
  totalStudents: number;
  activeStudents?: number;
  totalTeachers: number;
  activePrograms: number;
  totalEnrollments?: number;
  activeEnrollments?: number;
  attendanceRate?: number;
  upcomingReservations?: number;
  upcomingEvents?: number;
  pendingContracts?: number;
  maintenanceAlerts?: number;
}

export interface EnrollmentsByProgram {
  programId?: string;
  programName?: string;
  name?: string;
  area?: string;
  enrollments?: number;
  value?: number;
  percentage: number;
}

export interface GeographicDistribution {
  neighborhood: string;
  city: string;
  count: number;
  percentage: number;
}

export interface DropoutAnalysis {
  period: string;
  totalEnrollments: number;
  withdrawals: number;
  dropoutRate: number;
}

export interface EnrollmentTrend {
  period?: string;
  month?: string;
  count?: number;
  value?: number;
}

export interface AttendanceByArea {
  area: string;
  attendanceRate: number;
  totalSessions: number;
}

const createLocalResponse = <T>(data: T, message: string): ApiResponse<T> => ({
  success: true,
  message,
  data,
  timestamp: new Date().toISOString(),
  path: "/local/dashboard",
  requestId: `local-${Date.now()}`,
});

const round = (value: number, decimals = 1) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

const getLocalCollections = () => {
  const students = storage.get<any[]>("students") || [];
  const teachers = storage.get<any[]>("teachers") || [];
  const programs = storage.get<any[]>("programs") || [];
  const enrollments = storage.get<any[]>("enrollments") || [];
  const reservations = storage.get<any[]>("reservations") || [];
  const contracts = storage.get<any[]>("contracts") || [];
  const maintenance = storage.get<any[]>("maintenance_records") || [];

  return {
    students,
    teachers,
    programs,
    enrollments,
    reservations,
    contracts,
    maintenance,
  };
};

const calculateLocalStats = (): DashboardStats => {
  const {
    students,
    teachers,
    programs,
    enrollments,
    reservations,
    contracts,
    maintenance,
  } = getLocalCollections();

  const activeStudents = students.filter(
    (student) => student?.enrollmentStatus === "ACTIVE" || student?.status === "ACTIVE",
  ).length;
  const activePrograms = programs.filter(
    (program) => program?.status === "ACTIVE",
  ).length;
  const activeEnrollments = enrollments.filter(
    (enrollment) => enrollment?.status === "ACTIVE",
  ).length;
  const attendanceRate =
    enrollments.length > 0 ? round((activeEnrollments / enrollments.length) * 100) : 0;
  const upcomingReservations = reservations.filter(
    (reservation) => reservation?.status === "PENDING",
  ).length;
  const pendingContracts = contracts.filter(
    (contract) => contract?.status === "PENDING",
  ).length;
  const maintenanceAlerts = maintenance.filter(
    (record) => record?.status !== "COMPLETED",
  ).length;

  return {
    totalStudents: students.length,
    activeStudents,
    totalTeachers: teachers.length,
    activePrograms,
    totalEnrollments: enrollments.length,
    activeEnrollments,
    attendanceRate,
    upcomingReservations,
    pendingContracts,
    maintenanceAlerts,
  };
};

const calculateLocalEnrollmentsByProgram = (): EnrollmentsByProgram[] => {
  const { enrollments, programs } = getLocalCollections();
  if (enrollments.length === 0) return [];

  const programAreaMap = new Map<string, string>();
  programs.forEach((program) => {
    if (program?.name) {
      programAreaMap.set(
        program.name,
        String(program.area || "GENERAL").toUpperCase().replace(/\s+/g, "_"),
      );
    }
  });

  const counts = new Map<string, number>();
  enrollments.forEach((enrollment) => {
    const programName = String(enrollment?.programName || "Sin Programa");
    counts.set(programName, (counts.get(programName) || 0) + 1);
  });

  const total = enrollments.length;
  return [...counts.entries()]
    .map(([programName, value], index) => ({
      programId: String(index + 1),
      programName,
      area: programAreaMap.get(programName) || "GENERAL",
      enrollments: value,
      percentage: total > 0 ? round((value / total) * 100) : 0,
    }))
    .sort((a, b) => (b.enrollments || 0) - (a.enrollments || 0));
};

const calculateLocalGeographicDistribution = (): GeographicDistribution[] => {
  const { students } = getLocalCollections();
  if (students.length === 0) return [];

  const cityCounts = new Map<string, number>();
  students.forEach((student) => {
    const city = String(student?.city || "Sin ciudad");
    cityCounts.set(city, (cityCounts.get(city) || 0) + 1);
  });

  const total = students.length;
  return [...cityCounts.entries()].map(([city, count]) => ({
    neighborhood: city,
    city,
    count,
    percentage: total > 0 ? round((count / total) * 100) : 0,
  }));
};

const calculateLocalEnrollmentTrend = (months = 12): EnrollmentTrend[] => {
  const { enrollments } = getLocalCollections();
  const now = new Date();

  const bucketLabels: string[] = [];
  const bucketCounts = new Map<string, number>();
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    bucketLabels.push(label);
    bucketCounts.set(label, 0);
  }

  enrollments.forEach((enrollment) => {
    const rawDate = String(enrollment?.enrollmentDate || "");
    const date = new Date(rawDate);
    if (Number.isNaN(date.getTime())) return;
    const label = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (bucketCounts.has(label)) {
      bucketCounts.set(label, (bucketCounts.get(label) || 0) + 1);
    }
  });

  return bucketLabels.map((period) => ({
    period,
    count: bucketCounts.get(period) || 0,
  }));
};

const calculateLocalAttendanceByArea = (): AttendanceByArea[] => {
  const { enrollments, programs } = getLocalCollections();
  if (enrollments.length === 0) return [];

  const programAreaMap = new Map<string, string>();
  programs.forEach((program) => {
    if (program?.name) {
      programAreaMap.set(program.name, String(program.area || "General"));
    }
  });

  const areaAggregates = new Map<
    string,
    { total: number; active: number }
  >();

  enrollments.forEach((enrollment) => {
    const programName = String(enrollment?.programName || "");
    const area = programAreaMap.get(programName) || "General";
    const aggregate = areaAggregates.get(area) || { total: 0, active: 0 };
    aggregate.total += 1;
    if (enrollment?.status === "ACTIVE") {
      aggregate.active += 1;
    }
    areaAggregates.set(area, aggregate);
  });

  return [...areaAggregates.entries()].map(([area, aggregate]) => ({
    area,
    attendanceRate:
      aggregate.total > 0 ? round((aggregate.active / aggregate.total) * 100) : 0,
    totalSessions: aggregate.total * 4,
  }));
};

export const dashboardService = {
  /**
   * Obtener estadísticas generales
   */
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    return createLocalResponse(
      calculateLocalStats(),
      "Estadísticas obtenidas desde Firestore",
    );
  },

  /**
   * Obtener matrículas por programa
   */
  getEnrollmentsByProgram: async (): Promise<
    ApiResponse<EnrollmentsByProgram[]>
  > => {
    return createLocalResponse(
      calculateLocalEnrollmentsByProgram(),
      "Matrículas por programa obtenidas desde Firestore",
    );
  },

  /**
   * Obtener distribución geográfica
   */
  getGeographicDistribution: async (): Promise<
    ApiResponse<GeographicDistribution[]>
  > => {
    return createLocalResponse(
      calculateLocalGeographicDistribution(),
      "Distribución geográfica obtenida desde Firestore",
    );
  },

  /**
   * Obtener análisis de deserción
   */
  getDropoutAnalysis: async (
    year?: number,
  ): Promise<ApiResponse<DropoutAnalysis[]>> => {
    const enrollments = getLocalCollections().enrollments || [];
    const period = year ? `${year}` : `${new Date().getFullYear()}`;
    const totalEnrollments = enrollments.length;
    const withdrawals = enrollments.filter((item) => item?.status === "CANCELLED").length;
    const dropoutRate =
      totalEnrollments > 0 ? round((withdrawals / totalEnrollments) * 100) : 0;

    return createLocalResponse(
      [{ period, totalEnrollments, withdrawals, dropoutRate }],
      "Análisis de deserción obtenido desde Firestore",
    );
  },

  /**
   * Obtener tendencia de matrículas
   */
  getEnrollmentTrend: async (
    months = 12,
  ): Promise<ApiResponse<EnrollmentTrend[]>> => {
    return createLocalResponse(
      calculateLocalEnrollmentTrend(months),
      "Tendencia de matrículas obtenida desde Firestore",
    );
  },

  /**
   * Obtener asistencia por área
   */
  getAttendanceByArea: async (): Promise<ApiResponse<AttendanceByArea[]>> => {
    return createLocalResponse(
      calculateLocalAttendanceByArea(),
      "Asistencia por área obtenida desde Firestore",
    );
  },
};

export default dashboardService;
