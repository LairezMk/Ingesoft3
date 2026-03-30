/**
 * ============================================
 * STUDENTS SERVICE - GESTIÓN DE ESTUDIANTES
 * ============================================
 */

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { StudentProfile } from './entities/student-profile.entity.js';
import { PersonProfile } from './entities/person-profile.entity.js';
import {
  CreateStudentDto,
  UpdateStudentDto,
  StudentFiltersDto,
} from './dto/student.dto.js';
import { PaginationDto, PaginatedResponseDto } from '@lucy-tejada/types';

@Injectable()
export class StudentsService {
  private readonly logger = new Logger(StudentsService.name);

  constructor(
    @InjectRepository(StudentProfile)
    private readonly studentRepository: Repository<StudentProfile>,
    @InjectRepository(PersonProfile)
    private readonly personProfileRepository: Repository<PersonProfile>
  ) {}

  /**
   * Crear nuevo estudiante
   */
  async create(dto: CreateStudentDto, createdById: string): Promise<StudentProfile> {
    // Verificar si ya existe documento
    const existingProfile = await this.personProfileRepository.findOne({
      where: {
        documentType: dto.profile.documentType,
        documentNumber: dto.profile.documentNumber,
      },
    });

    if (existingProfile) {
      throw new BadRequestException(
        'Ya existe una persona con este documento de identidad'
      );
    }

    // Crear perfil de persona
    const personProfile = this.personProfileRepository.create({
      ...dto.profile,
      birthDate: new Date(dto.profile.birthDate),
    });
    const savedPersonProfile = await this.personProfileRepository.save(personProfile);

    // Crear perfil de estudiante
    const student = this.studentRepository.create({
      personProfileId: savedPersonProfile.id,
      hasDisability: dto.hasDisability ?? false,
      disabilityDescription: dto.disabilityDescription,
      requiresSpecialAttention: dto.requiresSpecialAttention ?? false,
      specialAttentionNotes: dto.specialAttentionNotes,
      guardianName: dto.guardianName,
      guardianPhone: dto.guardianPhone,
      guardianEmail: dto.guardianEmail,
      guardianRelation: dto.guardianRelation,
      consentFormSigned: dto.consentFormSigned,
      dataProcessingConsent: dto.dataProcessingConsent,
      imageUsageConsent: dto.imageUsageConsent ?? false,
    });

    const savedStudent = await this.studentRepository.save(student);

    this.logger.log(`Estudiante creado: ${savedStudent.studentCode}`);

    return this.findOne(savedStudent.id);
  }

  /**
   * Obtener todos los estudiantes con paginación y filtros
   */
  async findAll(
    pagination: PaginationDto,
    filters?: StudentFiltersDto
  ): Promise<PaginatedResponseDto<StudentProfile>> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * limit;

    const queryBuilder = this.studentRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.personProfile', 'profile')
      .where('student.isActive = :isActive', { isActive: true });

    // Aplicar filtros
    if (filters?.search) {
      queryBuilder.andWhere(
        `(profile.firstName ILIKE :search OR profile.lastName ILIKE :search
          OR profile.documentNumber ILIKE :search OR student.studentCode ILIKE :search)`,
        { search: `%${filters.search}%` }
      );
    }

    if (filters?.city) {
      queryBuilder.andWhere('profile.city = :city', { city: filters.city });
    }

    if (filters?.stratum) {
      queryBuilder.andWhere('profile.stratum = :stratum', { stratum: filters.stratum });
    }

    if (filters?.hasDisability !== undefined) {
      queryBuilder.andWhere('student.hasDisability = :hasDisability', {
        hasDisability: filters.hasDisability,
      });
    }

    if (filters?.isMinor !== undefined) {
      queryBuilder.andWhere('student.isMinor = :isMinor', {
        isMinor: filters.isMinor,
      });
    }

    // Ordenamiento
    const sortField = sortBy === 'name' ? 'profile.lastName' : `student.${sortBy}`;
    queryBuilder.orderBy(sortField, sortOrder.toUpperCase() as 'ASC' | 'DESC');

    // Paginación
    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Obtener estudiante por ID
   */
  async findOne(id: string): Promise<StudentProfile> {
    const student = await this.studentRepository.findOne({
      where: { id, isActive: true },
      relations: ['personProfile', 'enrollments', 'enrollments.group'],
    });

    if (!student) {
      throw new NotFoundException(`Estudiante con ID ${id} no encontrado`);
    }

    return student;
  }

  /**
   * Obtener estudiante por código
   */
  async findByCode(studentCode: string): Promise<StudentProfile> {
    const student = await this.studentRepository.findOne({
      where: { studentCode, isActive: true },
      relations: ['personProfile', 'enrollments'],
    });

    if (!student) {
      throw new NotFoundException(`Estudiante con código ${studentCode} no encontrado`);
    }

    return student;
  }

  /**
   * Actualizar estudiante
   */
  async update(id: string, dto: UpdateStudentDto): Promise<StudentProfile> {
    const student = await this.findOne(id);

    // Actualizar perfil de persona si se proporciona
    if (dto.profile) {
      await this.personProfileRepository.update(student.personProfileId, {
        ...dto.profile,
        birthDate: dto.profile.birthDate
          ? new Date(dto.profile.birthDate)
          : undefined,
      });
    }

    // Actualizar perfil de estudiante
    const updateData: Partial<StudentProfile> = {};
    if (dto.hasDisability !== undefined) updateData.hasDisability = dto.hasDisability;
    if (dto.disabilityDescription !== undefined)
      updateData.disabilityDescription = dto.disabilityDescription;
    if (dto.requiresSpecialAttention !== undefined)
      updateData.requiresSpecialAttention = dto.requiresSpecialAttention;
    if (dto.specialAttentionNotes !== undefined)
      updateData.specialAttentionNotes = dto.specialAttentionNotes;
    if (dto.guardianName !== undefined) updateData.guardianName = dto.guardianName;
    if (dto.guardianPhone !== undefined) updateData.guardianPhone = dto.guardianPhone;
    if (dto.guardianEmail !== undefined) updateData.guardianEmail = dto.guardianEmail;
    if (dto.guardianRelation !== undefined)
      updateData.guardianRelation = dto.guardianRelation;

    if (Object.keys(updateData).length > 0) {
      await this.studentRepository.update(id, updateData);
    }

    this.logger.log(`Estudiante actualizado: ${student.studentCode}`);

    return this.findOne(id);
  }

  /**
   * Eliminar estudiante (soft delete)
   */
  async remove(id: string): Promise<void> {
    const student = await this.findOne(id);

    await this.studentRepository.update(id, { isActive: false });
    await this.studentRepository.softDelete(id);

    this.logger.log(`Estudiante eliminado: ${student.studentCode}`);
  }

  /**
   * Obtener estadísticas de estudiantes
   */
  async getStatistics(): Promise<{
    total: number;
    byCity: { city: string; count: number }[];
    byStratum: { stratum: number; count: number }[];
    byGender: { gender: string; count: number }[];
    minors: number;
    withDisability: number;
  }> {
    const total = await this.studentRepository.count({
      where: { isActive: true },
    });

    const byCityRaw = await this.studentRepository
      .createQueryBuilder('student')
      .leftJoin('student.personProfile', 'profile')
      .select('profile.city', 'city')
      .addSelect('COUNT(*)', 'count')
      .where('student.isActive = :isActive', { isActive: true })
      .groupBy('profile.city')
      .getRawMany();

    const byStratumRaw = await this.studentRepository
      .createQueryBuilder('student')
      .leftJoin('student.personProfile', 'profile')
      .select('profile.stratum', 'stratum')
      .addSelect('COUNT(*)', 'count')
      .where('student.isActive = :isActive', { isActive: true })
      .andWhere('profile.stratum IS NOT NULL')
      .groupBy('profile.stratum')
      .getRawMany();

    const byGenderRaw = await this.studentRepository
      .createQueryBuilder('student')
      .leftJoin('student.personProfile', 'profile')
      .select('profile.gender', 'gender')
      .addSelect('COUNT(*)', 'count')
      .where('student.isActive = :isActive', { isActive: true })
      .groupBy('profile.gender')
      .getRawMany();

    const minors = await this.studentRepository.count({
      where: { isActive: true, isMinor: true },
    });

    const withDisability = await this.studentRepository.count({
      where: { isActive: true, hasDisability: true },
    });

    return {
      total,
      byCity: byCityRaw.map((r) => ({ city: r.city, count: parseInt(r.count) })),
      byStratum: byStratumRaw.map((r) => ({
        stratum: r.stratum,
        count: parseInt(r.count),
      })),
      byGender: byGenderRaw.map((r) => ({
        gender: r.gender,
        count: parseInt(r.count),
      })),
      minors,
      withDisability,
    };
  }
}
