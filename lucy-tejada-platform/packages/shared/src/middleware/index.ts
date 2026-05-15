/**
 * ============================================
 * MIDDLEWARE - LUCY TEJADA
 * ============================================
 */

import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { generateUUID } from '../utils/index.js';

/**
 * Middleware para agregar Request ID
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    const requestId =
      (req.headers['x-request-id'] as string) || generateUUID();
    (req as unknown as { requestId: string }).requestId = requestId;
    next();
  }
}

/**
 * Middleware para logging de requests
 */
@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('Request');

  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();
    const { method, originalUrl, ip } = req;
    const userAgent = req.headers['user-agent'] || 'unknown';

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const { statusCode } = res;

      if (statusCode >= 400) {
        this.logger.warn(
          `${method} ${originalUrl} ${statusCode} - ${duration}ms - ${ip} - ${userAgent}`
        );
      } else {
        this.logger.log(
          `${method} ${originalUrl} ${statusCode} - ${duration}ms`
        );
      }
    });

    next();
  }
}

/**
 * Middleware para validación de Content-Type
 */
@Injectable()
export class ContentTypeMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    if (
      ['POST', 'PUT', 'PATCH'].includes(req.method) &&
      req.headers['content-type'] &&
      !req.headers['content-type'].includes('application/json') &&
      !req.headers['content-type'].includes('multipart/form-data')
    ) {
      res.status(415).json({
        success: false,
        message: 'Tipo de contenido no soportado',
        errors: [
          {
            code: 'UNSUPPORTED_MEDIA_TYPE',
            message: 'Content-Type debe ser application/json o multipart/form-data',
          },
        ],
      });
      return;
    }
    next();
  }
}

/**
 * Middleware para headers de seguridad
 */
@Injectable()
export class SecurityHeadersMiddleware implements NestMiddleware {
  use(_req: Request, res: Response, next: NextFunction): void {
    // Prevenir clickjacking
    res.setHeader('X-Frame-Options', 'DENY');

    // Prevenir MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Habilitar XSS filter del navegador
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Política de referrer
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Content Security Policy básica
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'"
    );

    // Strict Transport Security (para HTTPS)
    if (process.env.NODE_ENV === 'production') {
      res.setHeader(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains'
      );
    }

    next();
  }
}

/**
 * Middleware para compresión de respuestas
 */
@Injectable()
export class CompressionMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    // La compresión real se maneja mejor con el middleware de compression
    // Este es un placeholder para la configuración
    next();
  }
}
