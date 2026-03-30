/**
 * ============================================
 * DASHBOARD CONTROLLER
 * ============================================
 */

import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard, Roles } from '@lucy-tejada/shared';
import { UserRole } from '@lucy-tejada/types';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * GET /dashboard/stats
   * Estadísticas generales
   */
  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.AUXILIAR_ADMINISTRATIVO)
  async getGeneralStats() {
    return this.dashboardService.getGeneralStats();
  }

  /**
   * GET /dashboard/enrollments-by-program
   * Matrículas por programa
   */
  @Get('enrollments-by-program')
  @Roles(UserRole.ADMIN, UserRole.AUXILIAR_ADMINISTRATIVO)
  async getEnrollmentsByProgram() {
    return this.dashboardService.getEnrollmentsByProgram();
  }

  /**
   * GET /dashboard/geographic-distribution
   * Distribución geográfica
   */
  @Get('geographic-distribution')
  @Roles(UserRole.ADMIN, UserRole.AUXILIAR_ADMINISTRATIVO)
  async getGeographicDistribution() {
    return this.dashboardService.getGeographicDistribution();
  }

  /**
   * GET /dashboard/dropout-analysis
   * Análisis de deserción
   */
  @Get('dropout-analysis')
  @Roles(UserRole.ADMIN, UserRole.AUXILIAR_ADMINISTRATIVO)
  async getDropoutAnalysis(@Query('year') year?: number) {
    return this.dashboardService.getDropoutAnalysis(year);
  }

  /**
   * GET /dashboard/enrollment-trend
   * Tendencia de matrículas
   */
  @Get('enrollment-trend')
  @Roles(UserRole.ADMIN, UserRole.AUXILIAR_ADMINISTRATIVO)
  async getEnrollmentTrend(@Query('months') months?: number) {
    return this.dashboardService.getEnrollmentTrend(months);
  }

  /**
   * GET /dashboard/attendance-by-area
   * Asistencia por área artística
   */
  @Get('attendance-by-area')
  @Roles(UserRole.ADMIN, UserRole.AUXILIAR_ADMINISTRATIVO, UserRole.DOCENTE)
  async getAttendanceByArea() {
    return this.dashboardService.getAttendanceByArea();
  }
}
