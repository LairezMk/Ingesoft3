/**
 * ============================================
 * STUDENTS CONTROLLER
 * ============================================
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { StudentsService } from './students.service.js';
import {
  CreateStudentDto,
  UpdateStudentDto,
  StudentFiltersDto,
} from './dto/student.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard, Roles, CurrentUser, RequirePermissions } from '@lucy-tejada/shared';
import { UserRole, AuthenticatedUser, PaginationDto } from '@lucy-tejada/types';

@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  /**
   * POST /students
   * Crear nuevo estudiante
   */
  @Post()
  @Roles(UserRole.ADMIN, UserRole.AUXILIAR_ADMINISTRATIVO)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateStudentDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.studentsService.create(dto, user.id);
  }

  /**
   * GET /students
   * Listar estudiantes con paginación y filtros
   */
  @Get()
  @Roles(
    UserRole.ADMIN,
    UserRole.AUXILIAR_ADMINISTRATIVO,
    UserRole.DOCENTE
  )
  async findAll(
    @Query() pagination: PaginationDto,
    @Query() filters: StudentFiltersDto
  ) {
    return this.studentsService.findAll(pagination, filters);
  }

  /**
   * GET /students/statistics
   * Obtener estadísticas de estudiantes
   */
  @Get('statistics')
  @Roles(UserRole.ADMIN, UserRole.AUXILIAR_ADMINISTRATIVO)
  async getStatistics() {
    return this.studentsService.getStatistics();
  }

  /**
   * GET /students/code/:code
   * Buscar estudiante por código
   */
  @Get('code/:code')
  @Roles(
    UserRole.ADMIN,
    UserRole.AUXILIAR_ADMINISTRATIVO,
    UserRole.DOCENTE
  )
  async findByCode(@Param('code') code: string) {
    return this.studentsService.findByCode(code);
  }

  /**
   * GET /students/:id
   * Obtener estudiante por ID
   */
  @Get(':id')
  @Roles(
    UserRole.ADMIN,
    UserRole.AUXILIAR_ADMINISTRATIVO,
    UserRole.DOCENTE,
    UserRole.ESTUDIANTE
  )
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    // Si es estudiante, solo puede ver su propio perfil
    // Esta validación se haría más completa en un guard específico
    return this.studentsService.findOne(id);
  }

  /**
   * PATCH /students/:id
   * Actualizar estudiante
   */
  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.AUXILIAR_ADMINISTRATIVO)
  async update(@Param('id') id: string, @Body() dto: UpdateStudentDto) {
    return this.studentsService.update(id, dto);
  }

  /**
   * DELETE /students/:id
   * Eliminar estudiante
   */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.studentsService.remove(id);
  }
}
