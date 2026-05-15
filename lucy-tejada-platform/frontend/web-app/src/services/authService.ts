/**
 * ============================================
 * AUTH SERVICE - SERVICIOS DE AUTENTICACIÓN
 * ============================================
 */

import { FirebaseError } from 'firebase/app';
import {
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  type User as FirebaseUser,
} from 'firebase/auth';
import { ApiResponse } from './api';
import { firebaseAuth } from './firebase';

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
  user: {
    id: string;
    email: string;
    name?: string;
    role: string;
    status?: string;
    permissions?: string[];
  };
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const adminEmails = new Set(
  (import.meta.env.VITE_ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
);

const getRoleForEmail = (email?: string | null) =>
  email && adminEmails.has(email.toLowerCase()) ? 'ADMIN' : 'VISITANTE';

const toLoginUser = (user: FirebaseUser): LoginResponse['user'] => ({
  id: user.uid,
  email: user.email ?? '',
  name: user.displayName ?? undefined,
  role: getRoleForEmail(user.email),
});

const buildBaseResponse = (path: string) => ({
  timestamp: new Date().toISOString(),
  path,
  requestId: 'firebase',
});

const getFirebaseErrorMessage = (error: unknown) => {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/user-not-found':
        return 'El usuario no existe.';
      case 'auth/wrong-password':
        return 'La contraseña es incorrecta.';
      case 'auth/invalid-credential':
        return 'Credenciales inválidas.';
      case 'auth/too-many-requests':
        return 'Demasiados intentos. Intenta de nuevo en unos minutos.';
      case 'auth/invalid-email':
        return 'El correo es inválido.';
      default:
        return error.message || 'Ha ocurrido un error inesperado.';
    }
  }

  return 'Ha ocurrido un error inesperado.';
};

export const authService = {
  /**
   * Iniciar sesión
   */
  login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    try {
      const credential = await signInWithEmailAndPassword(
        firebaseAuth,
        data.email,
        data.password
      );
      const accessToken = await credential.user.getIdToken();

      return {
        success: true,
        message: 'Inicio de sesión exitoso',
        data: {
          accessToken,
          refreshToken: credential.user.refreshToken,
          user: toLoginUser(credential.user),
        },
        ...buildBaseResponse('/auth/login'),
      };
    } catch (error) {
      return {
        success: false,
        message: getFirebaseErrorMessage(error),
        ...buildBaseResponse('/auth/login'),
      };
    }
  },

  /**
   * Cerrar sesión
   */
  logout: async (_allDevices = false): Promise<ApiResponse> => {
    try {
      await signOut(firebaseAuth);
      return {
        success: true,
        message: 'Sesión cerrada',
        ...buildBaseResponse('/auth/logout'),
      };
    } catch (error) {
      return {
        success: false,
        message: getFirebaseErrorMessage(error),
        ...buildBaseResponse('/auth/logout'),
      };
    }
  },

  /**
   * Obtener usuario actual
   */
  getCurrentUser: async (): Promise<ApiResponse<LoginResponse["user"]>> => {
    const currentUser = firebaseAuth.currentUser;
    if (!currentUser) {
      return {
        success: false,
        message: 'No hay usuario autenticado.',
        ...buildBaseResponse('/auth/me'),
      };
    }

    return {
      success: true,
      message: 'Usuario obtenido',
      data: toLoginUser(currentUser),
      ...buildBaseResponse('/auth/me'),
    };
  },

  /**
   * Renovar tokens
   */
  refreshTokens: async (
    refreshToken: string,
  ): Promise<ApiResponse<LoginResponse>> => {
    const currentUser = firebaseAuth.currentUser;
    if (!currentUser) {
      return {
        success: false,
        message: 'No hay usuario autenticado.',
        ...buildBaseResponse('/auth/refresh'),
      };
    }

    try {
      const accessToken = await currentUser.getIdToken(true);
      return {
        success: true,
        message: 'Token renovado',
        data: {
          accessToken,
          refreshToken: currentUser.refreshToken || refreshToken,
          user: toLoginUser(currentUser),
        },
        ...buildBaseResponse('/auth/refresh'),
      };
    } catch (error) {
      return {
        success: false,
        message: getFirebaseErrorMessage(error),
        ...buildBaseResponse('/auth/refresh'),
      };
    }
  },

  /**
   * Cambiar contraseña
   */
  changePassword: async (data: ChangePasswordRequest): Promise<ApiResponse> => {
    if (!firebaseAuth.currentUser) {
      return {
        success: false,
        message: 'No hay usuario autenticado.',
        ...buildBaseResponse('/auth/change-password'),
      };
    }

    if (data.newPassword !== data.confirmPassword) {
      return {
        success: false,
        message: 'Las contraseñas no coinciden.',
        ...buildBaseResponse('/auth/change-password'),
      };
    }

    try {
      await updatePassword(firebaseAuth.currentUser, data.newPassword);
      return {
        success: true,
        message: 'Contraseña cambiada exitosamente',
        ...buildBaseResponse('/auth/change-password'),
      };
    } catch (error) {
      return {
        success: false,
        message: getFirebaseErrorMessage(error),
        ...buildBaseResponse('/auth/change-password'),
      };
    }
  },

  /**
   * Validar token
   */
  validateToken: async (): Promise<ApiResponse<{ valid: boolean }>> => {
    const valid = Boolean(firebaseAuth.currentUser);
    return {
      success: true,
      message: valid ? 'Token válido' : 'Token inválido',
      data: { valid },
      ...buildBaseResponse('/auth/validate'),
    };
  },
};

export default authService;
