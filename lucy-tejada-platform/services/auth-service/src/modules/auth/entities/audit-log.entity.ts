/**
 * ============================================
 * AUDIT LOG ENTITY
 * ============================================
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { UserRole, AuditAction } from '../../../common/types.js';

@Entity('audit_logs')
@Index(['userId'])
@Index(['action'])
@Index(['entityType', 'entityId'])
@Index(['tableName'])
@Index(['createdAt'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId?: string;

  @Column({ name: 'user_name', length: 200 })
  userName!: string;

  @Column({
    name: 'user_role',
    type: 'enum',
    enum: UserRole,
  })
  userRole!: UserRole;

  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  action!: AuditAction;

  @Column({ name: 'entity_type', length: 100 })
  entityType!: string;

  @Column({ name: 'entity_id', type: 'uuid' })
  entityId!: string;

  @Column({ name: 'table_name', length: 100 })
  tableName!: string;

  @Column({ name: 'previous_data', type: 'jsonb', nullable: true })
  previousData?: Record<string, unknown>;

  @Column({ name: 'new_data', type: 'jsonb', nullable: true })
  newData?: Record<string, unknown>;

  @Column({ name: 'changed_fields', type: 'text', array: true, nullable: true })
  changedFields?: string[];

  @Column({ name: 'ip_address', type: 'inet' })
  ipAddress!: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent?: string;

  @Column({ name: 'session_id', length: 100, nullable: true })
  sessionId?: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
