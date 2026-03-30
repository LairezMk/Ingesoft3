/**
 * ============================================
 * STUDENTS DTOs
 * ============================================
 */

import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsDate,
  IsNumber,
  Min,
  Max,
  MinLength,
  MaxLength,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { DocumentType, Gender, SocioeconomicStratum } from '@lucy-tejada/types';

export class CreatePersonProfileDto {
  @IsEnum(DocumentType)
  documentType!: DocumentType;

  @IsString()
  @MinLength(6)
  @MaxLength(20)
  documentNumber!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  firstName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  middleName?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  lastName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  secondLastName?: string;

  @IsEnum(Gender)
  gender!: Gender;

  @IsString()
  birthDate!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  mobileNumber?: string;

  @IsString()
  @MinLength(5)
  @MaxLength(255)
  address!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  neighborhood?: string;

  @IsString()
  @MaxLength(100)
  city!: string;

  @IsString()
  @MaxLength(100)
  department!: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  postalCode?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(6)
  stratum?: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  emergencyContactName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  emergencyContactPhone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  emergencyContactRelation?: string;
}

export class UpdatePersonProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  middleName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  secondLastName?: string;

  @IsOptional()
  @IsString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  mobileNumber?: string;

  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(255)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  neighborhood?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(6)
  stratum?: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  emergencyContactName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  emergencyContactPhone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  emergencyContactRelation?: string;
}

export class CreateStudentDto {
  @ValidateNested()
  @Type(() => CreatePersonProfileDto)
  profile!: CreatePersonProfileDto;

  @IsOptional()
  @IsBoolean()
  hasDisability?: boolean;

  @IsOptional()
  @IsString()
  disabilityDescription?: string;

  @IsOptional()
  @IsBoolean()
  requiresSpecialAttention?: boolean;

  @IsOptional()
  @IsString()
  specialAttentionNotes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  guardianName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  guardianPhone?: string;

  @IsOptional()
  @IsEmail()
  guardianEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  guardianRelation?: string;

  @IsBoolean()
  consentFormSigned!: boolean;

  @IsBoolean()
  dataProcessingConsent!: boolean;

  @IsOptional()
  @IsBoolean()
  imageUsageConsent?: boolean;
}

export class UpdateStudentDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdatePersonProfileDto)
  profile?: UpdatePersonProfileDto;

  @IsOptional()
  @IsBoolean()
  hasDisability?: boolean;

  @IsOptional()
  @IsString()
  disabilityDescription?: string;

  @IsOptional()
  @IsBoolean()
  requiresSpecialAttention?: boolean;

  @IsOptional()
  @IsString()
  specialAttentionNotes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  guardianName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  guardianPhone?: string;

  @IsOptional()
  @IsEmail()
  guardianEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  guardianRelation?: string;
}

export class StudentFiltersDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(6)
  stratum?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  hasDisability?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isMinor?: boolean;
}
