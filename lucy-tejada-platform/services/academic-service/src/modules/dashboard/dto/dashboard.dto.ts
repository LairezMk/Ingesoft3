/**
 * ============================================
 * DASHBOARD DTOs
 * ============================================
 */

import { ArtisticArea } from '@lucy-tejada/types';

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

export interface AttendanceByAreaDto {
  area: ArtisticArea;
  totalSessions: number;
  attendanceRate: number;
}

export interface EnrollmentTrendDto {
  period: string;
  count: number;
}
