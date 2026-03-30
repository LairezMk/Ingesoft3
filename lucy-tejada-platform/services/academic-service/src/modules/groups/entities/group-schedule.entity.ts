/**
 * ============================================
 * GROUP SCHEDULE ENTITY - HORARIO DE GRUPO
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
import { DayOfWeek } from '@lucy-tejada/types';
import { CourseGroup } from './course-group.entity.js';

@Entity('group_schedules')
@Index(['groupId'])
@Index(['dayOfWeek'])
export class GroupSchedule {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'group_id', type: 'uuid' })
  groupId!: string;

  @ManyToOne(() => CourseGroup, (group) => group.schedules)
  @JoinColumn({ name: 'group_id' })
  group!: CourseGroup;

  @Column({
    name: 'day_of_week',
    type: 'enum',
    enum: DayOfWeek,
  })
  dayOfWeek!: DayOfWeek;

  @Column({ name: 'start_time', type: 'time' })
  startTime!: string;

  @Column({ name: 'end_time', type: 'time' })
  endTime!: string;

  @Column({ name: 'venue_id', type: 'uuid', nullable: true })
  venueId?: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date;
}
