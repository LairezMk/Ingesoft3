/**
 * ============================================
 * USER SESSION ENTITY
 * ============================================
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';

@Entity('user_sessions')
@Index(['sessionId'], { unique: true })
@Index(['userId'])
@Index(['expiresAt'])
export class UserSession {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'session_id', length: 100, unique: true })
  sessionId!: string;

  @Column({ name: 'ip_address', type: 'inet' })
  ipAddress!: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent?: string;

  @Column({ name: 'last_activity_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  lastActivityAt!: Date;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt!: Date;

  @Column({ name: 'is_valid', default: true })
  isValid!: boolean;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  /**
   * Verifica si la sesión está expirada
   */
  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  /**
   * Verifica si la sesión es válida para uso
   */
  canUse(): boolean {
    return this.isActive && this.isValid && !this.isExpired();
  }
}
