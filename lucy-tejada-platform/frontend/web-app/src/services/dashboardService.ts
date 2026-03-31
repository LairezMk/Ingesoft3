/**
 * ============================================
 * DASHBOARD SERVICE - SERVICIOS DE DASHBOARD
 * ============================================
 */

import apiClient, { ApiResponse } from './api';
import { mockApi, MOCK_MODE } from './mockApi';

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

export const dashboardService = {
  /**
   * Obtener estadísticas generales
   */
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    if (MOCK_MODE) {
      return mockApi.getDashboardStats();
    }
    const response = await apiClient.get<ApiResponse<DashboardStats>>('/dashboard/stats');
    return response.data;
  },

  /**
   * Obtener matrículas por programa
   */
  getEnrollmentsByProgram: async (): Promise<ApiResponse<EnrollmentsByProgram[]>> => {
    if (MOCK_MODE) {
      const stats = await mockApi.getDashboardStats();
      return {
        success: true,
        message: 'Datos obtenidos',
        data: (stats.data as any).programDistribution,
        timestamp: new Date().toISOString(),
        path: '/mock',
        requestId: 'mock',
      };
    }
    const response = await apiClient.get<ApiResponse<EnrollmentsByProgram[]>>(
      '/dashboard/enrollments-by-program'
    );
    return response.data;
  },

  /**
   * Obtener distribución geográfica
   */
  getGeographicDistribution: async (): Promise<ApiResponse<GeographicDistribution[]>> => {
    if (MOCK_MODE) {
      return {
        success: true,
        message: 'Distribución obtenida',
        data: [
          { neighborhood: 'Centro', city: 'Pereira', count: 320, percentage: 25.7 },
          { neighborhood: 'Cuba', city: 'Pereira', count: 285, percentage: 22.8 },
          { neighborhood: 'El Poblado', city: 'Pereira', count: 198, percentage: 15.9 },
          { neighborhood: 'Otros', city: 'Pereira', count: 444, percentage: 35.6 },
        ],
        timestamp: new Date().toISOString(),
        path: '/mock',
        requestId: 'mock',
      };
    }
    const response = await apiClient.get<ApiResponse<GeographicDistribution[]>>(
      '/dashboard/geographic-distribution'
    );
    return response.data;
  },

  /**
   * Obtener análisis de deserción
   */
  getDropoutAnalysis: async (year?: number): Promise<ApiResponse<DropoutAnalysis[]>> => {
    if (MOCK_MODE) {
      return {
        success: true,
        message: 'Análisis obtenido',
        data: [
          { period: '2024-Q1', totalEnrollments: 950, withdrawals: 45, dropoutRate: 4.7 },
          { period: '2024-Q2', totalEnrollments: 1020, withdrawals: 38, dropoutRate: 3.7 },
          { period: '2024-Q3', totalEnrollments: 1100, withdrawals: 42, dropoutRate: 3.8 },
          { period: '2024-Q4', totalEnrollments: 1180, withdrawals: 35, dropoutRate: 3.0 },
        ],
        timestamp: new Date().toISOString(),
        path: '/mock',
        requestId: 'mock',
      };
    }
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
    if (MOCK_MODE) {
      const stats = await mockApi.getDashboardStats();
      return {
        success: true,
        message: 'Tendencia obtenida',
        data: (stats.data as any).enrollmentTrend,
        timestamp: new Date().toISOString(),
        path: '/mock',
        requestId: 'mock',
      };
    }
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
    if (MOCK_MODE) {
      return {
        success: true,
        message: 'Asistencia obtenida',
        data: [
          { area: 'Danza', attendanceRate: 92.5, totalSessions: 240 },
          { area: 'Música', attendanceRate: 88.3, totalSessions: 320 },
          { area: 'Teatro', attendanceRate: 85.7, totalSessions: 180 },
          { area: 'Artes Visuales', attendanceRate: 90.2, totalSessions: 160 },
        ],
        timestamp: new Date().toISOString(),
        path: '/mock',
        requestId: 'mock',
      };
    }
    const response = await apiClient.get<ApiResponse<AttendanceByArea[]>>(
      '/dashboard/attendance-by-area'
    );
    return response.data;
  },
};

export default dashboardService;
