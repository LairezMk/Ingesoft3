/**
 * ============================================
 * AUTH DTOs - DATA TRANSFER OBJECTS
 * ============================================
 */

import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  Matches,
  IsEnum,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { UserRole } from '../../../common/types.js';

/**
 * DTO para login
 */
export class LoginDto {
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password!: string;

  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}

/**
 * DTO para refresh token
 */
export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty({ message: 'El token de actualización es requerido' })
  refreshToken!: string;
}

/**
 * DTO para cambio de contraseña
 */
export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'La contraseña actual es requerida' })
  currentPassword!: string;

  @IsString()
  @MinLength(8, { message: 'La nueva contraseña debe tener al menos 8 caracteres' })
  @MaxLength(100, { message: 'La contraseña no puede exceder 100 caracteres' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    {
      message:
        'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial',
    }
  )
  newPassword!: string;

  @IsString()
  @IsNotEmpty({ message: 'La confirmación de contraseña es requerida' })
  confirmPassword!: string;
}

/**
 * DTO para solicitar recuperación de contraseña
 */
export class ForgotPasswordDto {
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email!: string;
}

/**
 * DTO para restablecer contraseña
 */
export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'El token es requerido' })
  token!: string;

  @IsString()
  @MinLength(8, { message: 'La nueva contraseña debe tener al menos 8 caracteres' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    {
      message:
        'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial',
    }
  )
  newPassword!: string;

  @IsString()
  @IsNotEmpty({ message: 'La confirmación de contraseña es requerida' })
  confirmPassword!: string;
}

/**
 * DTO para crear usuario
 */
export class CreateUserDto {
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email!: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    {
      message:
        'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial',
    }
  )
  password!: string;

  @IsEnum(UserRole, { message: 'El rol no es válido' })
  role!: UserRole;
}

/**
 * DTO para logout
 */
export class LogoutDto {
  @IsOptional()
  @IsBoolean()
  allDevices?: boolean;
}
