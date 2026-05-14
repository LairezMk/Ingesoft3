/**
 * ============================================
 * AUTH SERVICE - SERVICIOS DE AUTENTICACIÓN
 * ============================================
 */

import apiClient, { ApiResponse } from "./api";
import { mockApi, MOCK_MODE } from "./mockApi";

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

export const authService = {
  /**
   * Iniciar sesión
   */
  login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    if (MOCK_MODE) {
      return mockApi.login(data.email, data.password);
    }
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      "/auth/login",
      data,
    );
    return response.data;
  },

  /**
   * Cerrar sesión
   */
  logout: async (allDevices = false): Promise<ApiResponse> => {
    if (MOCK_MODE) {
      return mockApi.logout();
    }
    const response = await apiClient.post<ApiResponse>("/auth/logout", {
      allDevices,
    });
    return response.data;
  },

  /**
   * Obtener usuario actual
   */
  getCurrentUser: async (): Promise<ApiResponse<LoginResponse["user"]>> => {
    if (MOCK_MODE) {
      const response = await mockApi.getCurrentUser();
      return response as unknown as ApiResponse<LoginResponse['user']>;
    }
    const response =
      await apiClient.get<ApiResponse<LoginResponse["user"]>>("/auth/me");
    return response.data;
  },

  /**
   * Renovar tokens
   */
  refreshTokens: async (
    refreshToken: string,
  ): Promise<ApiResponse<LoginResponse>> => {
    if (MOCK_MODE) {
      // En modo mock, simplemente devolvemos los tokens actuales
      const user = await mockApi.getCurrentUser();
      return {
        success: true,
        message: "Token renovado",
        data: {
          accessToken: "mock_access_token_" + Date.now(),
          refreshToken: "mock_refresh_token_" + Date.now(),
          user: user.data as any,
        },
        timestamp: new Date().toISOString(),
        path: "/mock",
        requestId: "mock",
      };
    }
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      "/auth/refresh",
      {
        refreshToken,
      },
    );
    return response.data;
  },

  /**
   * Cambiar contraseña
   */
  changePassword: async (data: ChangePasswordRequest): Promise<ApiResponse> => {
    if (MOCK_MODE) {
      return {
        success: true,
        message: "Contraseña cambiada exitosamente (mock)",
        timestamp: new Date().toISOString(),
        path: "/mock",
        requestId: "mock",
      };
    }
    const response = await apiClient.post<ApiResponse>(
      "/auth/change-password",
      data,
    );
    return response.data;
  },

  /**
   * Validar token
   */
  validateToken: async (): Promise<ApiResponse<{ valid: boolean }>> => {
    if (MOCK_MODE) {
      return {
        success: true,
        message: "Token válido",
        data: { valid: true },
        timestamp: new Date().toISOString(),
        path: "/mock",
        requestId: "mock",
      };
    }
    const response =
      await apiClient.get<ApiResponse<{ valid: boolean }>>("/auth/validate");
    return response.data;
  },
};

export default authService;
