/**
 * ============================================
 * USER ENTITY - ENTIDAD DE USUARIO
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
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { UserRole, UserStatus } from '../../../common/types.js';
import { PersonProfile } from './person-profile.entity.js';

@Entity('users')
@Index(['email'], { unique: true })
@Index(['role'])
@Index(['status'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'citext', unique: true })
  email!: string;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.ESTUDIANTE,
  })
  role!: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING_VERIFICATION,
  })
  status!: UserStatus;

  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  lastLoginAt?: Date;

  @Column({ name: 'failed_login_attempts', default: 0 })
  failedLoginAttempts!: number;

  @Column({ name: 'locked_until', type: 'timestamptz', nullable: true })
  lockedUntil?: Date;

  @Column({ name: 'must_change_password', default: false })
  mustChangePassword!: boolean;

  @Column({ name: 'profile_id', type: 'uuid', nullable: true })
  profileId?: string;

  @OneToOne(() => PersonProfile, { nullable: true, eager: false })
  @JoinColumn({ name: 'profile_id' })
  profile?: PersonProfile;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date;

  /**
   * Verifica si la cuenta está bloqueada
   */
  isLocked(): boolean {
    if (!this.lockedUntil) return false;
    return new Date() < this.lockedUntil;
  }

  /**
   * Verifica si la cuenta puede hacer login
   */
  canLogin(): boolean {
    return (
      this.isActive &&
      this.status === UserStatus.ACTIVE &&
      !this.isLocked()
    );
  }
}
