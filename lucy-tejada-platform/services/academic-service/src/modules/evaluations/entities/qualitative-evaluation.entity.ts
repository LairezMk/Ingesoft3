/**
 * ============================================
 * QUALITATIVE EVALUATION ENTITY - EVALUACIÓN
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
import { QualitativeGrade } from '@lucy-tejada/types';
import { Enrollment } from '../../enrollments/entities/enrollment.entity.js';

@Entity('qualitative_evaluations')
@Index(['enrollmentId', 'period'], { unique: true })
@Index(['enrollmentId'])
@Index(['evaluationDate'])
@Index(['period'])
export class QualitativeEvaluation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'enrollment_id', type: 'uuid' })
  enrollmentId!: string;

  @ManyToOne(() => Enrollment, (enrollment) => enrollment.evaluations)
  @JoinColumn({ name: 'enrollment_id' })
  enrollment!: Enrollment;

  @Column({ name: 'evaluation_date', type: 'date', default: () => 'CURRENT_DATE' })
  evaluationDate!: Date;

  @Column({ length: 50 })
  period!: string;

  @Column({
    name: 'overall_grade',
    type: 'enum',
    enum: QualitativeGrade,
  })
  overallGrade!: QualitativeGrade;

  @Column({
    name: 'technical_skills',
    type: 'enum',
    enum: QualitativeGrade,
  })
  technicalSkills!: QualitativeGrade;

  @Column({
    name: 'artistic_expression',
    type: 'enum',
    enum: QualitativeGrade,
  })
  artisticExpression!: QualitativeGrade;

  @Column({
    type: 'enum',
    enum: QualitativeGrade,
  })
  commitment!: QualitativeGrade;

  @Column({
    type: 'enum',
    enum: QualitativeGrade,
  })
  teamwork!: QualitativeGrade;

  @Column({ type: 'text' })
  strengths!: string;

  @Column({ name: 'areas_for_improvement', type: 'text' })
  areasForImprovement!: string;

  @Column({ type: 'text' })
  recommendations!: string;

  @Column({ name: 'teacher_comments', type: 'text', nullable: true })
  teacherComments?: string;

  @Column({ name: 'evaluated_by_id', type: 'uuid' })
  evaluatedById!: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date;
}
