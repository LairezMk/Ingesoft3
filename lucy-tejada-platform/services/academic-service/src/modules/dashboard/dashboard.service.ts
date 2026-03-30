/**
 * ============================================
 * DASHBOARD SERVICE - ESTADÍSTICAS
 * ============================================
 */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { StudentProfile } from '../students/entities/student-profile.entity.js';
import { TeacherProfile } from '../teachers/entities/teacher-profile.entity.js';
import { FormativeProgram } from '../programs/entities/formative-program.entity.js';
import { CourseGroup } from '../groups/entities/course-group.entity.js';
import { Enrollment } from '../enrollments/entities/enrollment.entity.js';
import { AttendanceRecord } from '../attendance/entities/attendance-record.entity.js';
import {
  DashboardStatsDto,
  EnrollmentsByProgramDto,
  GeographicDistributionDto,
  DropoutAnalysisDto,
} from './dto/dashboard.dto.js';
import { EnrollmentStatus, AttendanceStatus, ProgramStatus } from '@lucy-tejada/types';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    @InjectRepository(StudentProfile)
    private readonly studentRepository: Repository<StudentProfile>,
    @InjectRepository(TeacherProfile)
    private readonly teacherRepository: Repository<TeacherProfile>,
    @InjectRepository(FormativeProgram)
    private readonly programRepository: Repository<FormativeProgram>,
    @InjectRepository(CourseGroup)
    private readonly groupRepository: Repository<CourseGroup>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(AttendanceRecord)
    private readonly attendanceRepository: Repository<AttendanceRecord>
  ) {}

  /**
   * Obtener estadísticas generales del dashboard
   */
  async getGeneralStats(): Promise<DashboardStatsDto> {
    const [
      totalStudents,
      activeStudents,
      totalTeachers,
      activePrograms,
      totalEnrollments,
      activeEnrollments,
    ] = await Promise.all([
      this.studentRepository.count({ where: { isActive: true } }),
      this.enrollmentRepository
        .createQueryBuilder('e')
        .select('COUNT(DISTINCT e.studentId)', 'count')
        .where('e.status = :status', { status: EnrollmentStatus.ACTIVE })
        .getRawOne()
        .then((r) => parseInt(r?.count || '0')),
      this.teacherRepository.count({ where: { isActive: true } }),
      this.programRepository.count({
        where: { isActive: true, status: ProgramStatus.ACTIVE },
      }),
      this.enrollmentRepository.count({ where: { isActive: true } }),
      this.enrollmentRepository.count({
        where: { isActive: true, status: EnrollmentStatus.ACTIVE },
      }),
    ]);

    // Calcular tasa de asistencia promedio
    const attendanceStats = await this.attendanceRepository
      .createQueryBuilder('a')
      .select('COUNT(*)', 'total')
      .addSelect(
        `SUM(CASE WHEN a.status IN ('PRESENT', 'LATE') THEN 1 ELSE 0 END)`,
        'present'
      )
      .where('a.isActive = :isActive', { isActive: true })
      .getRawOne();

    const attendanceRate =
      attendanceStats?.total > 0
        ? Math.round((attendanceStats.present / attendanceStats.total) * 100)
        : 0;

    return {
      totalStudents,
      activeStudents,
      totalTeachers,
      activePrograms,
      totalEnrollments,
      activeEnrollments,
      attendanceRate,
      upcomingReservations: 0, // Se obtendría del Infrastructure Service
      pendingContracts: 0, // Se obtendría del Infrastructure Service
      maintenanceAlerts: 0, // Se obtendría del Infrastructure Service
    };
  }

  /**
   * Obtener matrículas por programa
   */
  async getEnrollmentsByProgram(): Promise<EnrollmentsByProgramDto[]> {
    const results = await this.enrollmentRepository
      .createQueryBuilder('e')
      .leftJoin('e.group', 'g')
      .leftJoin('g.program', 'p')
      .select('p.id', 'programId')
      .addSelect('p.name', 'programName')
      .addSelect('p.area', 'area')
      .addSelect('COUNT(DISTINCT e.studentId)', 'enrollments')
      .where('e.isActive = :isActive', { isActive: true })
      .andWhere('e.status = :status', { status: EnrollmentStatus.ACTIVE })
      .groupBy('p.id')
      .addGroupBy('p.name')
      .addGroupBy('p.area')
      .orderBy('enrollments', 'DESC')
      .getRawMany();

    const total = results.reduce((sum, r) => sum + parseInt(r.enrollments), 0);

    return results.map((r) => ({
      programId: r.programId,
      programName: r.programName,
      area: r.area,
      enrollments: parseInt(r.enrollments),
      percentage: total > 0 ? Math.round((parseInt(r.enrollments) / total) * 100) : 0,
    }));
  }

  /**
   * Obtener distribución geográfica de estudiantes
   */
  async getGeographicDistribution(): Promise<GeographicDistributionDto[]> {
    const results = await this.studentRepository
      .createQueryBuilder('s')
      .leftJoin('s.personProfile', 'p')
      .select('p.neighborhood', 'neighborhood')
      .addSelect('p.city', 'city')
      .addSelect('COUNT(*)', 'count')
      .where('s.isActive = :isActive', { isActive: true })
      .groupBy('p.neighborhood')
      .addGroupBy('p.city')
      .orderBy('count', 'DESC')
      .limit(20)
      .getRawMany();

    const total = results.reduce((sum, r) => sum + parseInt(r.count), 0);

    return results.map((r) => ({
      neighborhood: r.neighborhood || 'Sin especificar',
      city: r.city,
      count: parseInt(r.count),
      percentage: total > 0 ? Math.round((parseInt(r.count) / total) * 100) : 0,
    }));
  }

  /**
   * Análisis de deserción
   */
  async getDropoutAnalysis(year?: number): Promise<DropoutAnalysisDto[]> {
    const targetYear = year || new Date().getFullYear();

    const results = await this.enrollmentRepository
      .createQueryBuilder('e')
      .select(`TO_CHAR(e.enrollmentDate, 'YYYY-MM')`, 'period')
      .addSelect('COUNT(*)', 'totalEnrollments')
      .addSelect(
        `SUM(CASE WHEN e.status = 'WITHDRAWN' THEN 1 ELSE 0 END)`,
        'withdrawals'
      )
      .where(`EXTRACT(YEAR FROM e.enrollmentDate) = :year`, { year: targetYear })
      .groupBy(`TO_CHAR(e.enrollmentDate, 'YYYY-MM')`)
      .orderBy('period', 'ASC')
      .getRawMany();

    return results.map((r) => ({
      period: r.period,
      totalEnrollments: parseInt(r.totalEnrollments),
      withdrawals: parseInt(r.withdrawals),
      dropoutRate:
        parseInt(r.totalEnrollments) > 0
          ? Math.round((parseInt(r.withdrawals) / parseInt(r.totalEnrollments)) * 100)
          : 0,
      reasons: [], // Se puede expandir para incluir análisis de razones
    }));
  }

  /**
   * Obtener tendencia de matrículas
   */
  async getEnrollmentTrend(
    months: number = 12
  ): Promise<{ period: string; count: number }[]> {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const results = await this.enrollmentRepository
      .createQueryBuilder('e')
      .select(`TO_CHAR(e.enrollmentDate, 'YYYY-MM')`, 'period')
      .addSelect('COUNT(*)', 'count')
      .where('e.enrollmentDate >= :startDate', { startDate })
      .groupBy(`TO_CHAR(e.enrollmentDate, 'YYYY-MM')`)
      .orderBy('period', 'ASC')
      .getRawMany();

    return results.map((r) => ({
      period: r.period,
      count: parseInt(r.count),
    }));
  }

  /**
   * Obtener asistencia por área artística
   */
  async getAttendanceByArea(): Promise<
    { area: string; attendanceRate: number; totalSessions: number }[]
  > {
    const results = await this.attendanceRepository
      .createQueryBuilder('a')
      .leftJoin('a.enrollment', 'e')
      .leftJoin('e.group', 'g')
      .leftJoin('g.program', 'p')
      .select('p.area', 'area')
      .addSelect('COUNT(*)', 'totalSessions')
      .addSelect(
        `SUM(CASE WHEN a.status IN ('PRESENT', 'LATE') THEN 1 ELSE 0 END)`,
        'presentCount'
      )
      .where('a.isActive = :isActive', { isActive: true })
      .groupBy('p.area')
      .getRawMany();

    return results.map((r) => ({
      area: r.area,
      totalSessions: parseInt(r.totalSessions),
      attendanceRate:
        parseInt(r.totalSessions) > 0
          ? Math.round((parseInt(r.presentCount) / parseInt(r.totalSessions)) * 100)
          : 0,
    }));
  }
}
