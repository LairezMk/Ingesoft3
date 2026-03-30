/**
 * ============================================
 * ATTENDANCE RECORD ENTITY - REGISTRO DE ASISTENCIA
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
  JoinColumn,
  Index,
} from 'typeorm';
import { AttendanceStatus } from '@lucy-tejada/types';
import { Enrollment } from '../../enrollments/entities/enrollment.entity.js';

@Entity('attendance_records')
@Index(['enrollmentId', 'sessionDate'], { unique: true })
@Index(['enrollmentId'])
@Index(['sessionDate'])
@Index(['status'])
export class AttendanceRecord {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'enrollment_id', type: 'uuid' })
  enrollmentId!: string;

  @ManyToOne(() => Enrollment, (enrollment) => enrollment.attendanceRecords)
  @JoinColumn({ name: 'enrollment_id' })
  enrollment!: Enrollment;

  @Column({ name: 'session_date', type: 'date' })
  sessionDate!: Date;

  @Column({ type: 'enum', enum: AttendanceStatus })
  status!: AttendanceStatus;

  @Column({ name: 'check_in_time', type: 'time', nullable: true })
  checkInTime?: string;

  @Column({ name: 'check_out_time', type: 'time', nullable: true })
  checkOutTime?: string;

  @Column({ type: 'text', nullable: true })
  observations?: string;

  @Column({ name: 'recorded_by_id', type: 'uuid' })
  recordedById!: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date;
}
