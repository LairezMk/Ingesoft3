/**
 * ============================================
 * AUTH SERVICE - SERVICIOS DE AUTENTICACIÓN
 * ============================================
 */

import apiClient, { ApiResponse } from './api';

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    role: string;
    status: string;
  };
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const authService = {
  /**
   * Iniciar sesión
   */
  login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', data);
    return response.data;
  },

  /**
   * Cerrar sesión
   */
  logout: async (allDevices = false): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/auth/logout', { allDevices });
    return response.data;
  },

  /**
   * Obtener usuario actual
   */
  getCurrentUser: async (): Promise<ApiResponse<LoginResponse['user']>> => {
    const response = await apiClient.get<ApiResponse<LoginResponse['user']>>('/auth/me');
    return response.data;
  },

  /**
   * Renovar tokens
   */
  refreshTokens: async (refreshToken: string): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  },

  /**
   * Cambiar contraseña
   */
  changePassword: async (data: ChangePasswordRequest): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/auth/change-password', data);
    return response.data;
  },

  /**
   * Validar token
   */
  validateToken: async (): Promise<ApiResponse<{ valid: boolean }>> => {
    const response = await apiClient.get<ApiResponse<{ valid: boolean }>>('/auth/validate');
    return response.data;
  },
};

export default authService;
