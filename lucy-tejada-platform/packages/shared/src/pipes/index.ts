/**
 * ============================================
 * PIPES DE VALIDACIÓN - LUCY TEJADA
 * ============================================
 */

import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

/**
 * Pipe de validación personalizado
 */
@Injectable()
export class ValidationPipe implements PipeTransform<unknown> {
  async transform(value: unknown, { metatype }: ArgumentMetadata): Promise<unknown> {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    const errors = await validate(object, {
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    });

    if (errors.length > 0) {
      const messages = errors.map((error) => {
        return Object.values(error.constraints || {}).join(', ');
      });

      throw new BadRequestException({
        message: messages,
        error: 'Validation Error',
      });
    }

    return object;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}

/**
 * Pipe para parsear UUID
 */
@Injectable()
export class ParseUUIDPipe implements PipeTransform<string> {
  private readonly uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  transform(value: string, metadata: ArgumentMetadata): string {
    if (!this.uuidRegex.test(value)) {
      throw new BadRequestException(
        `El parámetro ${metadata.data || 'id'} debe ser un UUID válido`
      );
    }
    return value.toLowerCase();
  }
}

/**
 * Pipe para parsear fechas
 */
@Injectable()
export class ParseDatePipe implements PipeTransform<string, Date> {
  transform(value: string, metadata: ArgumentMetadata): Date {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new BadRequestException(
        `El parámetro ${metadata.data || 'date'} debe ser una fecha válida`
      );
    }
    return date;
  }
}

/**
 * Pipe para parsear enteros positivos
 */
@Injectable()
export class ParsePositiveIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 1) {
      throw new BadRequestException(
        `El parámetro ${metadata.data || 'value'} debe ser un número entero positivo`
      );
    }
    return num;
  }
}

/**
 * Pipe para sanitizar strings
 */
@Injectable()
export class SanitizeStringPipe implements PipeTransform<string> {
  transform(value: string): string {
    if (typeof value !== 'string') return value;
    return value
      .trim()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }
}

/**
 * Pipe para parsear enums
 */
@Injectable()
export class ParseEnumPipe<T extends object> implements PipeTransform<string, T[keyof T]> {
  constructor(private readonly enumType: T) {}

  transform(value: string, metadata: ArgumentMetadata): T[keyof T] {
    const enumValues = Object.values(this.enumType);
    if (!enumValues.includes(value)) {
      throw new BadRequestException(
        `El parámetro ${metadata.data || 'value'} debe ser uno de: ${enumValues.join(', ')}`
      );
    }
    return value as T[keyof T];
  }
}
