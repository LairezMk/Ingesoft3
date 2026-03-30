/**
 * ============================================
 * TEACHER PROFILE ENTITY - PERFIL DE DOCENTE
 * ============================================
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { ArtisticArea } from '@lucy-tejada/types';
import { PersonProfile } from '../../students/entities/person-profile.entity.js';
import { CourseGroup } from '../../groups/entities/course-group.entity.js';

@Entity('teacher_profiles')
@Index(['teacherCode'], { unique: true })
@Index(['personProfileId'])
export class TeacherProfile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'person_profile_id', type: 'uuid' })
  personProfileId!: string;

  @OneToOne(() => PersonProfile, { eager: true })
  @JoinColumn({ name: 'person_profile_id' })
  personProfile!: PersonProfile;

  @Column({ name: 'teacher_code', length: 20, unique: true })
  teacherCode!: string;

  @Column({ name: 'professional_card', length: 50, nullable: true })
  professionalCard?: string;

  @Column({
    type: 'enum',
    enum: ArtisticArea,
    array: true,
    default: '{}',
  })
  specialty!: ArtisticArea[];

  @Column({ name: 'academic_degree', length: 200 })
  academicDegree!: string;

  @Column({ name: 'years_experience', default: 0 })
  yearsExperience!: number;

  @Column({ type: 'text', nullable: true })
  biography?: string;

  @Column({ name: 'curriculum_url', length: 500, nullable: true })
  curriculumUrl?: string;

  @Column({ name: 'hire_date', type: 'date' })
  hireDate!: Date;

  @Column({ name: 'contract_type', length: 50 })
  contractType!: string;

  @Column({ name: 'bank_name', length: 100, nullable: true })
  bankName?: string;

  @Column({ name: 'bank_account_number', length: 50, nullable: true })
  bankAccountNumber?: string;

  @Column({ name: 'bank_account_type', length: 20, nullable: true })
  bankAccountType?: string;

  @OneToMany(() => CourseGroup, (group) => group.teacher)
  groups!: CourseGroup[];

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date;
}
