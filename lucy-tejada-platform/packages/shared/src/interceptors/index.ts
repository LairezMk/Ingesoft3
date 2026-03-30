/**
 * ============================================
 * INTERCEPTORES - LUCY TEJADA
 * ============================================
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { ApiResponse } from '@lucy-tejada/types';
import { generateUUID } from '../utils/index.js';

/**
 * Interceptor para logging de requests
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip } = request;
    const userAgent = request.headers['user-agent'] || 'unknown';
    const userId = request.user?.id || 'anonymous';
    const requestId = generateUUID();

    request.requestId = requestId;
    const startTime = Date.now();

    this.logger.log(
      `[${requestId}] ${method} ${url} - User: ${userId} - IP: ${ip} - UA: ${userAgent}`
    );

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const duration = Date.now() - startTime;
          this.logger.log(
            `[${requestId}] ${method} ${url} - ${response.statusCode} - ${duration}ms`
          );
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logger.error(
            `[${requestId}] ${method} ${url} - ${error.status || 500} - ${duration}ms - ${error.message}`
          );
        },
      })
    );
  }
}

/**
 * Interceptor para transformar respuestas al formato estándar
 */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest();
    const requestId = request.requestId || generateUUID();
    const path = request.url;

    return next.handle().pipe(
      map((data) => ({
        success: true,
        message: 'Operación exitosa',
        data,
        timestamp: new Date().toISOString(),
        path,
        requestId,
      }))
    );
  }
}

/**
 * Interceptor para timeout de requests
 */
@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  constructor(private readonly timeout: number = 30000) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle();
    // Implementar timeout si es necesario
  }
}

/**
 * Interceptor para caché con Redis
 */
@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Cache');

  constructor(
    private readonly cacheService?: { get: (key: string) => Promise<unknown>; set: (key: string, value: unknown, ttl: number) => Promise<void> },
    private readonly ttl: number = 60
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Promise<Observable<unknown>> {
    if (!this.cacheService) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();

    // Solo cachear GET requests
    if (request.method !== 'GET') {
      return next.handle();
    }

    const cacheKey = `cache:${request.url}`;

    try {
      const cachedData = await this.cacheService.get(cacheKey);
      if (cachedData) {
        this.logger.debug(`Cache hit: ${cacheKey}`);
        return new Observable((observer) => {
          observer.next(cachedData);
          observer.complete();
        });
      }
    } catch {
      this.logger.warn(`Cache error for key: ${cacheKey}`);
    }

    return next.handle().pipe(
      tap(async (data) => {
        try {
          await this.cacheService?.set(cacheKey, data, this.ttl);
          this.logger.debug(`Cache set: ${cacheKey}`);
        } catch {
          this.logger.warn(`Failed to set cache for key: ${cacheKey}`);
        }
      })
    );
  }
}
