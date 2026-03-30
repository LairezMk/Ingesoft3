/**
 * ============================================
 * DASHBOARD SERVICE - SERVICIOS DE DASHBOARD
 * ============================================
 */

import apiClient, { ApiResponse } from './api';

export interface DashboardStats {
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

export interface EnrollmentsByProgram {
  programId: string;
  programName: string;
  area: string;
  enrollments: number;
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
  period: string;
  count: number;
}

export interface AttendanceByArea {
  area: string;
  attendanceRate: number;
  totalSessions: number;
}

export const dashboardService = {
  /**
   * Obtener estadísticas generales
   */
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    const response = await apiClient.get<ApiResponse<DashboardStats>>('/dashboard/stats');
    return response.data;
  },

  /**
   * Obtener matrículas por programa
   */
  getEnrollmentsByProgram: async (): Promise<ApiResponse<EnrollmentsByProgram[]>> => {
    const response = await apiClient.get<ApiResponse<EnrollmentsByProgram[]>>(
      '/dashboard/enrollments-by-program'
    );
    return response.data;
  },

  /**
   * Obtener distribución geográfica
   */
  getGeographicDistribution: async (): Promise<ApiResponse<GeographicDistribution[]>> => {
    const response = await apiClient.get<ApiResponse<GeographicDistribution[]>>(
      '/dashboard/geographic-distribution'
    );
    return response.data;
  },

  /**
   * Obtener análisis de deserción
   */
  getDropoutAnalysis: async (year?: number): Promise<ApiResponse<DropoutAnalysis[]>> => {
    const params = year ? { year } : {};
    const response = await apiClient.get<ApiResponse<DropoutAnalysis[]>>(
      '/dashboard/dropout-analysis',
      { params }
    );
    return response.data;
  },

  /**
   * Obtener tendencia de matrículas
   */
  getEnrollmentTrend: async (months = 12): Promise<ApiResponse<EnrollmentTrend[]>> => {
    const response = await apiClient.get<ApiResponse<EnrollmentTrend[]>>(
      '/dashboard/enrollment-trend',
      { params: { months } }
    );
    return response.data;
  },

  /**
   * Obtener asistencia por área
   */
  getAttendanceByArea: async (): Promise<ApiResponse<AttendanceByArea[]>> => {
    const response = await apiClient.get<ApiResponse<AttendanceByArea[]>>(
      '/dashboard/attendance-by-area'
    );
    return response.data;
  },
};

export default dashboardService;
