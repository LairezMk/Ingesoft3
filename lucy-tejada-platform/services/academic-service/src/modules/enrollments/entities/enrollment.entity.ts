/**
 * ============================================
 * ENROLLMENT ENTITY - ENTIDAD DE MATRÍCULA
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
import { EnrollmentStatus, QualitativeGrade } from '@lucy-tejada/types';
import { StudentProfile } from '../../students/entities/student-profile.entity.js';
import { CourseGroup } from '../../groups/entities/course-group.entity.js';
import { AttendanceRecord } from '../../attendance/entities/attendance-record.entity.js';
import { QualitativeEvaluation } from '../../evaluations/entities/qualitative-evaluation.entity.js';

@Entity('enrollments')
@Index(['studentId', 'groupId'], { unique: true })
@Index(['studentId'])
@Index(['groupId'])
@Index(['status'])
@Index(['enrollmentDate'])
export class Enrollment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId!: string;

  @ManyToOne(() => StudentProfile, (student) => student.enrollments)
  @JoinColumn({ name: 'student_id' })
  student!: StudentProfile;

  @Column({ name: 'group_id', type: 'uuid' })
  groupId!: string;

  @ManyToOne(() => CourseGroup, (group) => group.enrollments)
  @JoinColumn({ name: 'group_id' })
  group!: CourseGroup;

  @Column({
    type: 'enum',
    enum: EnrollmentStatus,
    default: EnrollmentStatus.PENDING,
  })
  status!: EnrollmentStatus;

  @Column({ name: 'enrollment_date', type: 'date', default: () => 'CURRENT_DATE' })
  enrollmentDate!: Date;

  @Column({ name: 'withdrawal_date', type: 'date', nullable: true })
  withdrawalDate?: Date;

  @Column({ name: 'withdrawal_reason', type: 'text', nullable: true })
  withdrawalReason?: string;

  @Column({ name: 'completion_date', type: 'date', nullable: true })
  completionDate?: Date;

  @Column({
    name: 'final_grade',
    type: 'enum',
    enum: QualitativeGrade,
    nullable: true,
  })
  finalGrade?: QualitativeGrade;

  @Column({ type: 'text', nullable: true })
  observations?: string;

  @Column({ name: 'enrolled_by_id', type: 'uuid' })
  enrolledById!: string;

  @OneToMany(() => AttendanceRecord, (attendance) => attendance.enrollment)
  attendanceRecords!: AttendanceRecord[];

  @OneToMany(() => QualitativeEvaluation, (evaluation) => evaluation.enrollment)
  evaluations!: QualitativeEvaluation[];

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date;
}
