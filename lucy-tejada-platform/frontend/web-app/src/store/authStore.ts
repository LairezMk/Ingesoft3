/**
 * ============================================
 * AUTH STORE - ZUSTAND
 * Gestión de estado de autenticación
 * ============================================
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { type AppRole, normalizeRole } from '@/utils/rbac';

export interface User {
  id: string;
  email: string;
  role: AppRole;
  profile?: {
    firstName: string;
    lastName: string;
    photoUrl?: string;
    identification?: string;
    phone?: string;
    city?: string;
    position?: string;
    bio?: string;
  };
}

export type UserProfile = NonNullable<User["profile"]>;

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) =>
        set({
          user: user
            ? {
                ...user,
                role: normalizeRole(user.role) ?? 'VISITANTE',
              }
            : null,
          isAuthenticated: !!user,
        }),

      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),

      login: (user, accessToken, refreshToken) =>
        set({
          user: {
            ...user,
            role: normalizeRole(user.role) ?? 'VISITANTE',
          },
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      setLoading: (isLoading) => set({ isLoading }),
      updateUserProfile: (profile) =>
        set((state) => {
          if (!state.user) return state;

          const currentProfile = state.user.profile ?? {
            firstName: "",
            lastName: "",
          };

          return {
            user: {
              ...state.user,
              profile: {
                ...currentProfile,
                ...profile,
              },
            },
          };
        }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
