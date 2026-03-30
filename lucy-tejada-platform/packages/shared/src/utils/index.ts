/**
 * ============================================
 * UTILIDADES - LUCY TEJADA
 * ============================================
 */

import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

const SALT_ROUNDS = 10;
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';

/**
 * Hash de contraseña usando bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Verificar contraseña contra hash
 */
export const verifyPassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

/**
 * Generar token aleatorio seguro
 */
export const generateSecureToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Generar UUID v4
 */
export const generateUUID = (): string => {
  return crypto.randomUUID();
};

/**
 * Encriptar datos sensibles (Ley 1581 de 2012)
 */
export const encryptData = (
  data: string,
  encryptionKey: string
): { encrypted: string; iv: string; authTag: string } => {
  const key = crypto.scryptSync(encryptionKey, 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);

  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');

  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag,
  };
};

/**
 * Desencriptar datos
 */
export const decryptData = (
  encryptedData: string,
  encryptionKey: string,
  iv: string,
  authTag: string
): string => {
  const key = crypto.scryptSync(encryptionKey, 'salt', 32);
  const decipher = crypto.createDecipheriv(
    ENCRYPTION_ALGORITHM,
    key,
    Buffer.from(iv, 'hex')
  );
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));

  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};

/**
 * Sanitizar string para prevenir XSS
 */
export const sanitizeString = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Validar formato de email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email);
};

/**
 * Validar cédula colombiana (básico)
 */
export const isValidCedulaColombia = (cedula: string): boolean => {
  const cleanCedula = cedula.replace(/\D/g, '');
  return cleanCedula.length >= 6 && cleanCedula.length <= 10;
};

/**
 * Formatear número de teléfono colombiano
 */
export const formatPhoneColombia = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

/**
 * Calcular edad a partir de fecha de nacimiento
 */
export const calculateAge = (birthDate: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

/**
 * Formatear nombre completo
 */
export const formatFullName = (
  firstName: string,
  middleName: string | null | undefined,
  lastName: string,
  secondLastName: string | null | undefined
): string => {
  const parts = [firstName, middleName, lastName, secondLastName].filter(
    (part) => part && part.trim().length > 0
  );
  return parts.join(' ');
};

/**
 * Generar slug URL-friendly
 */
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

/**
 * Truncar texto con ellipsis
 */
export const truncateText = (
  text: string,
  maxLength: number,
  suffix: string = '...'
): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Parsear período académico (ej: "2024-1" -> { year: 2024, semester: 1 })
 */
export const parseAcademicPeriod = (
  period: string
): { year: number; semester: number } => {
  const parts = period.split('-');
  return {
    year: parseInt(parts[0] ?? '0', 10),
    semester: parseInt(parts[1] ?? '0', 10),
  };
};

/**
 * Generar período académico actual
 */
export const getCurrentAcademicPeriod = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const semester = now.getMonth() < 6 ? 1 : 2;
  return `${year}-${semester}`;
};

/**
 * Formatear moneda colombiana
 */
export const formatCurrencyCOP = (amount: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Formatear fecha en español
 */
export const formatDateSpanish = (
  date: Date,
  options?: Intl.DateTimeFormatOptions
): string => {
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  }).format(date);
};

/**
 * Delay promise
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Retry con exponential backoff
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await sleep(delay);
      }
    }
  }

  throw lastError;
};

/**
 * Chunk array en partes más pequeñas
 */
export const chunkArray = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

/**
 * Eliminar duplicados de array por key
 */
export const uniqueByKey = <T>(array: T[], key: keyof T): T[] => {
  const map = new Map<unknown, T>();
  array.forEach((item) => {
    map.set(item[key], item);
  });
  return Array.from(map.values());
};

/**
 * Deep clone de objeto
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Verificar si objeto está vacío
 */
export const isEmpty = (obj: unknown): boolean => {
  if (obj === null || obj === undefined) return true;
  if (typeof obj === 'string') return obj.trim().length === 0;
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
};
