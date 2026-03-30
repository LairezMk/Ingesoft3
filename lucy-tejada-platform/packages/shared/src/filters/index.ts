/**
 * ============================================
 * FILTROS DE EXCEPCIÓN - LUCY TEJADA
 * ============================================
 */

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponse, ApiError } from '@lucy-tejada/types';

/**
 * Filtro global para todas las excepciones HTTP
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpException');

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errors: ApiError[] = [];

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const resp = exceptionResponse as Record<string, unknown>;
      if (Array.isArray(resp.message)) {
        resp.message.forEach((msg: string) => {
          errors.push({
            code: 'VALIDATION_ERROR',
            message: msg,
          });
        });
      } else if (resp.message) {
        errors.push({
          code: resp.error as string || 'ERROR',
          message: resp.message as string,
        });
      }
    } else {
      errors.push({
        code: 'ERROR',
        message: exception.message,
      });
    }

    const errorResponse: ApiResponse = {
      success: false,
      message: this.getStatusMessage(status),
      errors,
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId: (request as unknown as { requestId?: string }).requestId || 'unknown',
    };

    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${JSON.stringify(errors)}`
    );

    response.status(status).json(errorResponse);
  }

  private getStatusMessage(status: number): string {
    const messages: Record<number, string> = {
      400: 'Solicitud inválida',
      401: 'No autorizado',
      403: 'Acceso denegado',
      404: 'Recurso no encontrado',
      409: 'Conflicto con el estado actual',
      422: 'Entidad no procesable',
      429: 'Demasiadas solicitudes',
      500: 'Error interno del servidor',
    };
    return messages[status] || 'Error';
  }
}

/**
 * Filtro global para excepciones no manejadas
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exception');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof Error ? exception.message : 'Error interno del servidor';

    const errorResponse: ApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      errors: [
        {
          code: 'INTERNAL_ERROR',
          message:
            process.env.NODE_ENV === 'development'
              ? message
              : 'Ha ocurrido un error inesperado',
        },
      ],
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId: (request as unknown as { requestId?: string }).requestId || 'unknown',
    };

    this.logger.error(
      `${request.method} ${request.url} - ${status}`,
      exception instanceof Error ? exception.stack : 'Unknown error'
    );

    response.status(status).json(errorResponse);
  }
}

/**
 * Filtro para errores de base de datos
 */
@Catch()
export class DatabaseExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('DatabaseException');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const error = exception as { code?: string; message?: string; detail?: string };

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error de base de datos';

    // Mapear códigos de error de PostgreSQL
    if (error.code === '23505') {
      status = HttpStatus.CONFLICT;
      message = 'Ya existe un registro con estos datos';
    } else if (error.code === '23503') {
      status = HttpStatus.BAD_REQUEST;
      message = 'Referencia a un registro que no existe';
    } else if (error.code === '23502') {
      status = HttpStatus.BAD_REQUEST;
      message = 'Faltan campos requeridos';
    }

    const errorResponse: ApiResponse = {
      success: false,
      message,
      errors: [
        {
          code: `DB_${error.code || 'ERROR'}`,
          message,
          details:
            process.env.NODE_ENV === 'development' ? error.detail : undefined,
        },
      ],
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId: (request as unknown as { requestId?: string }).requestId || 'unknown',
    };

    this.logger.error(
      `Database error: ${error.code} - ${error.message}`,
      error.detail
    );

    response.status(status).json(errorResponse);
  }
}
