/**
 * ============================================
 * FORMATIVE PROGRAM ENTITY - PROGRAMA FORMATIVO
 * ============================================
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { ArtisticArea, FormationLevel, ProgramStatus } from '@lucy-tejada/types';
import { CourseGroup } from '../../groups/entities/course-group.entity.js';

@Entity('formative_programs')
@Index(['code'], { unique: true })
@Index(['area'])
@Index(['level'])
@Index(['status'])
export class FormativeProgram {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 20, unique: true })
  code!: string;

  @Column({ length: 200 })
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'enum', enum: ArtisticArea })
  area!: ArtisticArea;

  @Column({ type: 'enum', enum: FormationLevel })
  level!: FormationLevel;

  @Column({
    type: 'enum',
    enum: ProgramStatus,
    default: ProgramStatus.ACTIVE,
  })
  status!: ProgramStatus;

  @Column({ name: 'duration_weeks' })
  durationWeeks!: number;

  @Column({ name: 'hours_per_week', type: 'numeric', precision: 4, scale: 1 })
  hoursPerWeek!: number;

  @Column({ name: 'max_students', default: 30 })
  maxStudents!: number;

  @Column({ name: 'min_age', nullable: true })
  minAge?: number;

  @Column({ name: 'max_age', nullable: true })
  maxAge?: number;

  @Column({ type: 'text', nullable: true })
  prerequisites?: string;

  @Column({ type: 'text', array: true, default: '{}' })
  objectives!: string[];

  @Column({ type: 'text', array: true, default: '{}' })
  competencies!: string[];

  @Column({ type: 'text', nullable: true })
  syllabus?: string;

  @Column({ name: 'image_url', length: 500, nullable: true })
  imageUrl?: string;

  @Column({ name: 'coordinator_id', type: 'uuid', nullable: true })
  coordinatorId?: string;

  @OneToMany(() => CourseGroup, (group) => group.program)
  groups!: CourseGroup[];

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date;

  get totalHours(): number {
    return this.durationWeeks * this.hoursPerWeek;
  }
}
