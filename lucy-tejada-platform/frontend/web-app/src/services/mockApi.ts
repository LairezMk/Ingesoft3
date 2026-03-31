/**
 * ============================================
 * MOCK API - Servicios simulados con localStorage
 * ============================================
 */

import { ApiResponse, PaginatedResponse } from "./api";

// Clave base para localStorage
const STORAGE_PREFIX = "lucy_tejada_";

// Helper para guardar en localStorage
export const storage = {
  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(STORAGE_PREFIX + key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch (error) {
      console.error("Error guardando en localStorage:", error);
    }
  },

  remove: (key: string): void => {
    localStorage.removeItem(STORAGE_PREFIX + key);
  },

  clear: (): void => {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(STORAGE_PREFIX))
      .forEach((key) => localStorage.removeItem(key));
  },
};

// Simular delay de red
const delay = (ms: number = 300) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Crear respuesta de API simulada
const createMockResponse = <T>(
  data: T,
  message: string = "Operación exitosa",
): ApiResponse<T> => ({
  success: true,
  message,
  data,
  timestamp: new Date().toISOString(),
  path: "/mock",
  requestId: Math.random().toString(36).substring(7),
});

// Crear respuesta paginada simulada
export const createPaginatedResponse = <T>(
  data: T[],
  page: number = 1,
  limit: number = 10,
): PaginatedResponse<T> => {
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedData = data.slice(start, end);

  return {
    data: paginatedData,
    meta: {
      total: data.length,
      page,
      limit,
      totalPages: Math.ceil(data.length / limit),
      hasNextPage: end < data.length,
      hasPreviousPage: page > 1,
    },
  };
};

// Mock API Client - Intercepta llamadas y usa localStorage
export class MockApiClient {
  // Mock de Auth
  async login(email: string, password: string) {
    await delay();

    // Usuario demo
    const mockUser = {
      id: "1",
      email,
      name: "Usuario Demo",
      role: "ADMIN",
      permissions: ["*"],
    };

    const mockTokens = {
      accessToken: "mock_access_token_" + Date.now(),
      refreshToken: "mock_refresh_token_" + Date.now(),
    };

    // Guardar usuario en localStorage
    storage.set("user", mockUser);
    storage.set("tokens", mockTokens);

    return createMockResponse(
      {
        user: mockUser,
        ...mockTokens,
      },
      "Inicio de sesión exitoso",
    );
  }

  async logout() {
    await delay(100);
    storage.remove("user");
    storage.remove("tokens");
    return createMockResponse(null, "Sesión cerrada");
  }

  async getCurrentUser() {
    await delay(100);
    const user = storage.get("user");
    return createMockResponse(user, "Usuario obtenido");
  }

  // Mock de Dashboard
  async getDashboardStats() {
    await delay();

    const mockStats = {
      totalStudents: 1247,
      activePrograms: 24,
      totalTeachers: 68,
      upcomingEvents: 12,
      enrollmentTrend: [
        { month: "Ene", value: 950 },
        { month: "Feb", value: 1020 },
        { month: "Mar", value: 1100 },
        { month: "Abr", value: 1180 },
        { month: "May", value: 1247 },
      ],
      programDistribution: [
        { name: "Danza", value: 385, percentage: 31 },
        { name: "Música", value: 448, percentage: 36 },
        { name: "Teatro", value: 262, percentage: 21 },
        { name: "Artes Visuales", value: 152, percentage: 12 },
      ],
    };

    return createMockResponse(mockStats, "Estadísticas obtenidas");
  }

  // Mock de Estudiantes
  async getStudents(page: number = 1, limit: number = 10) {
    await delay();

    let students = storage.get<any[]>("students") || [];

    // Si no hay estudiantes, crear datos demo
    if (students.length === 0) {
      students = Array.from({ length: 50 }, (_, i) => ({
        id: String(i + 1),
        documentType: "CC",
        documentNumber: String(1000000 + i),
        firstName: `Estudiante${i + 1}`,
        lastName: `Apellido${i + 1}`,
        email: `estudiante${i + 1}@example.com`,
        phone: `300${String(i).padStart(7, "0")}`,
        birthDate: "2005-01-01",
        gender: i % 2 === 0 ? "MALE" : "FEMALE",
        city: "Pereira",
        address: `Calle ${i + 1} #${i}-${i}`,
        enrollmentStatus: "ACTIVE",
        createdAt: new Date().toISOString(),
      }));
      storage.set("students", students);
    }

    const paginatedResponse = createPaginatedResponse(students, page, limit);
    return createMockResponse(paginatedResponse, "Estudiantes obtenidos");
  }

  async createStudent(data: any) {
    await delay();

    const students = storage.get<any[]>("students") || [];
    const newStudent = {
      id: String(students.length + 1),
      ...data,
      createdAt: new Date().toISOString(),
      enrollmentStatus: "ACTIVE",
    };

    students.push(newStudent);
    storage.set("students", students);

    return createMockResponse(newStudent, "Estudiante creado exitosamente");
  }

  async updateStudent(id: string, data: any) {
    await delay();

    const students = storage.get<any[]>("students") || [];
    const index = students.findIndex((s) => s.id === id);

    if (index === -1) {
      throw new Error("Estudiante no encontrado");
    }

    students[index] = {
      ...students[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    storage.set("students", students);

    return createMockResponse(students[index], "Estudiante actualizado");
  }

  async deleteStudent(id: string) {
    await delay();

    const students = storage.get<any[]>("students") || [];
    const filtered = students.filter((s) => s.id !== id);
    storage.set("students", students);

    return createMockResponse(null, "Estudiante eliminado");
  }
}

// Instancia única del mock client
export const mockApi = new MockApiClient();

// Variable de entorno para activar modo mock
export const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === "true";
