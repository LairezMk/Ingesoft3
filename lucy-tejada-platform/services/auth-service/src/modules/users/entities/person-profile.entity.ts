/**
 * ============================================
 * PERSON PROFILE ENTITY
 * ============================================
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { DocumentType, Gender } from '../../../common/types.js';

@Entity('person_profiles')
@Index(['documentType', 'documentNumber'], { unique: true })
@Index(['lastName', 'firstName'])
export class PersonProfile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId?: string;

  @Column({
    name: 'document_type',
    type: 'enum',
    enum: DocumentType,
  })
  documentType!: DocumentType;

  @Column({ name: 'document_number', length: 20 })
  documentNumber!: string;

  @Column({ name: 'first_name', length: 100 })
  firstName!: string;

  @Column({ name: 'middle_name', length: 100, nullable: true })
  middleName?: string;

  @Column({ name: 'last_name', length: 100 })
  lastName!: string;

  @Column({ name: 'second_last_name', length: 100, nullable: true })
  secondLastName?: string;

  @Column({
    type: 'enum',
    enum: Gender,
  })
  gender!: Gender;

  @Column({ name: 'birth_date', type: 'date' })
  birthDate!: Date;

  @Column({ name: 'phone_number', length: 20, nullable: true })
  phoneNumber?: string;

  @Column({ name: 'mobile_number', length: 20, nullable: true })
  mobileNumber?: string;

  @Column({ length: 255 })
  address!: string;

  @Column({ length: 100, nullable: true })
  neighborhood?: string;

  @Column({ length: 100, default: 'Pereira' })
  city!: string;

  @Column({ length: 100, default: 'Risaralda' })
  department!: string;

  @Column({ name: 'postal_code', length: 10, nullable: true })
  postalCode?: string;

  @Column({ type: 'smallint', nullable: true })
  stratum?: number;

  @Column({ name: 'photo_url', length: 500, nullable: true })
  photoUrl?: string;

  @Column({ name: 'emergency_contact_name', length: 200, nullable: true })
  emergencyContactName?: string;

  @Column({ name: 'emergency_contact_phone', length: 20, nullable: true })
  emergencyContactPhone?: string;

  @Column({ name: 'emergency_contact_relation', length: 50, nullable: true })
  emergencyContactRelation?: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date;

  /**
   * Obtiene el nombre completo
   */
  getFullName(): string {
    const parts = [
      this.firstName,
      this.middleName,
      this.lastName,
      this.secondLastName,
    ].filter((p) => p && p.trim().length > 0);
    return parts.join(' ');
  }

  /**
   * Calcula la edad
   */
  getAge(): number {
    const today = new Date();
    let age = today.getFullYear() - this.birthDate.getFullYear();
    const monthDiff = today.getMonth() - this.birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < this.birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }
}
