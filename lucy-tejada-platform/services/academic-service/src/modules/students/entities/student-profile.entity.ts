/**
 * ============================================
 * STUDENT ENTITY - ENTIDAD DE ESTUDIANTE
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
import { PersonProfile } from './person-profile.entity.js';
import { Enrollment } from '../../enrollments/entities/enrollment.entity.js';

@Entity('student_profiles')
@Index(['studentCode'], { unique: true })
@Index(['personProfileId'])
export class StudentProfile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'person_profile_id', type: 'uuid' })
  personProfileId!: string;

  @OneToOne(() => PersonProfile, { eager: true })
  @JoinColumn({ name: 'person_profile_id' })
  personProfile!: PersonProfile;

  @Column({ name: 'student_code', length: 20, unique: true })
  studentCode!: string;

  @Column({ name: 'enrollment_date', type: 'date', default: () => 'CURRENT_DATE' })
  enrollmentDate!: Date;

  @Column({ name: 'has_disability', default: false })
  hasDisability!: boolean;

  @Column({ name: 'disability_description', type: 'text', nullable: true })
  disabilityDescription?: string;

  @Column({ name: 'requires_special_attention', default: false })
  requiresSpecialAttention!: boolean;

  @Column({ name: 'special_attention_notes', type: 'text', nullable: true })
  specialAttentionNotes?: string;

  @Column({ name: 'guardian_name', length: 200, nullable: true })
  guardianName?: string;

  @Column({ name: 'guardian_phone', length: 20, nullable: true })
  guardianPhone?: string;

  @Column({ name: 'guardian_email', type: 'citext', nullable: true })
  guardianEmail?: string;

  @Column({ name: 'guardian_relation', length: 50, nullable: true })
  guardianRelation?: string;

  @Column({ name: 'is_minor', default: false })
  isMinor!: boolean;

  @Column({ name: 'consent_form_signed', default: false })
  consentFormSigned!: boolean;

  @Column({ name: 'data_processing_consent', default: false })
  dataProcessingConsent!: boolean;

  @Column({ name: 'image_usage_consent', default: false })
  imageUsageConsent!: boolean;

  @OneToMany(() => Enrollment, (enrollment) => enrollment.student)
  enrollments!: Enrollment[];

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date;
}
