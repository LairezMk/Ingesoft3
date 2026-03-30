/**
 * ============================================
 * FILTROS DE EXCEPCIONES - AUTH SERVICE
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
import { Response, Request } from 'express';

interface ErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  error?: string;
  timestamp: string;
  path: string;
  requestId?: string;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const message =
      typeof exceptionResponse === 'object' && 'message' in exceptionResponse
        ? (exceptionResponse as { message: string | string[] }).message
        : exception.message;

    const errorResponse: ErrorResponse = {
      success: false,
      statusCode: status,
      message: Array.isArray(message) ? message[0] : message,
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId: request.headers['x-request-id'] as string,
    };

    this.logger.warn(
      `HTTP ${status} - ${request.method} ${request.url} - ${errorResponse.message}`
    );

    response.status(status).json(errorResponse);
  }
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof Error ? exception.message : 'Error interno del servidor';

    const errorResponse: ErrorResponse = {
      success: false,
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId: request.headers['x-request-id'] as string,
    };

    this.logger.error(
      `Error - ${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : undefined
    );

    response.status(status).json(errorResponse);
  }
}
