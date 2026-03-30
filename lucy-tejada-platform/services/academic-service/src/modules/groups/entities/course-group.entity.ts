/**
 * ============================================
 * COURSE GROUP ENTITY - ENTIDAD DE GRUPO
 * ============================================
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { ProgramStatus } from '@lucy-tejada/types';
import { FormativeProgram } from '../../programs/entities/formative-program.entity.js';
import { TeacherProfile } from '../../teachers/entities/teacher-profile.entity.js';
import { Enrollment } from '../../enrollments/entities/enrollment.entity.js';
import { GroupSchedule } from './group-schedule.entity.js';

@Entity('course_groups')
@Index(['groupCode'], { unique: true })
@Index(['programId'])
@Index(['teacherId'])
@Index(['academicPeriod'])
@Index(['status'])
export class CourseGroup {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'program_id', type: 'uuid' })
  programId!: string;

  @ManyToOne(() => FormativeProgram, (program) => program.groups)
  @JoinColumn({ name: 'program_id' })
  program!: FormativeProgram;

  @Column({ name: 'teacher_id', type: 'uuid' })
  teacherId!: string;

  @ManyToOne(() => TeacherProfile, (teacher) => teacher.groups)
  @JoinColumn({ name: 'teacher_id' })
  teacher!: TeacherProfile;

  @Column({ name: 'group_code', length: 20, unique: true })
  groupCode!: string;

  @Column({ length: 200 })
  name!: string;

  @Column({ name: 'academic_period', length: 20 })
  academicPeriod!: string;

  @Column({ name: 'start_date', type: 'date' })
  startDate!: Date;

  @Column({ name: 'end_date', type: 'date' })
  endDate!: Date;

  @Column({ name: 'max_students', default: 30 })
  maxStudents!: number;

  @Column({ name: 'current_students', default: 0 })
  currentStudents!: number;

  @Column({ name: 'venue_id', type: 'uuid', nullable: true })
  venueId?: string;

  @Column({
    type: 'enum',
    enum: ProgramStatus,
    default: ProgramStatus.ACTIVE,
  })
  status!: ProgramStatus;

  @OneToMany(() => Enrollment, (enrollment) => enrollment.group)
  enrollments!: Enrollment[];

  @OneToMany(() => GroupSchedule, (schedule) => schedule.group)
  schedules!: GroupSchedule[];

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date;

  get availableSpots(): number {
    return this.maxStudents - this.currentStudents;
  }

  hasAvailableSpots(): boolean {
    return this.currentStudents < this.maxStudents;
  }
}
