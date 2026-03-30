/**
 * ============================================
 * ACADEMIC SERVICE - MAIN MODULE
 * ============================================
 */

import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import {
  HttpExceptionFilter,
  AllExceptionsFilter,
  LoggingInterceptor,
  TransformInterceptor,
  RequestIdMiddleware,
  SecurityHeadersMiddleware,
} from '@lucy-tejada/shared';

// Entities
import { PersonProfile } from './modules/students/entities/person-profile.entity.js';
import { StudentProfile } from './modules/students/entities/student-profile.entity.js';
import { TeacherProfile } from './modules/teachers/entities/teacher-profile.entity.js';
import { FormativeProgram } from './modules/programs/entities/formative-program.entity.js';
import { CourseGroup } from './modules/groups/entities/course-group.entity.js';
import { GroupSchedule } from './modules/groups/entities/group-schedule.entity.js';
import { Enrollment } from './modules/enrollments/entities/enrollment.entity.js';
import { AttendanceRecord } from './modules/attendance/entities/attendance-record.entity.js';
import { QualitativeEvaluation } from './modules/evaluations/entities/qualitative-evaluation.entity.js';

// Services
import { StudentsService } from './modules/students/students.service.js';
import { DashboardService } from './modules/dashboard/dashboard.service.js';

// Controllers
import { StudentsController } from './modules/students/students.controller.js';
import { DashboardController } from './modules/dashboard/dashboard.controller.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST', 'localhost'),
        port: configService.get<number>('DATABASE_PORT', 5432),
        database: configService.get<string>('DATABASE_NAME', 'lucy_tejada_db'),
        username: configService.get<string>('DATABASE_USER', 'postgres'),
        password: configService.get<string>('DATABASE_PASSWORD', ''),
        ssl: configService.get<boolean>('DATABASE_SSL', false),
        synchronize: false,
        logging: configService.get<string>('NODE_ENV') === 'development',
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),

    TypeOrmModule.forFeature([
      PersonProfile,
      StudentProfile,
      TeacherProfile,
      FormativeProgram,
      CourseGroup,
      GroupSchedule,
      Enrollment,
      AttendanceRecord,
      QualitativeEvaluation,
    ]),

    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '24h'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [StudentsController, DashboardController],
  providers: [
    StudentsService,
    DashboardService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestIdMiddleware, SecurityHeadersMiddleware)
      .forRoutes('*');
  }
}
