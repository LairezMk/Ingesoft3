/**
 * ============================================
 * UI STORE - ZUSTAND
 * Gestión de estado de la interfaz
 * ============================================
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  darkMode: boolean;
  activeModal: string | null;
  notifications: Notification[];

  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapse: () => void;
  toggleDarkMode: () => void;
  setDarkMode: (dark: boolean) => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  timestamp: Date;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      sidebarCollapsed: false,
      darkMode: false,
      activeModal: null,
      notifications: [],

      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      toggleSidebarCollapse: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      toggleDarkMode: () =>
        set((state) => {
          const newDarkMode = !state.darkMode;
          if (newDarkMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          return { darkMode: newDarkMode };
        }),

      setDarkMode: (dark) => {
        if (dark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        set({ darkMode: dark });
      },

      openModal: (modalId) => set({ activeModal: modalId }),

      closeModal: () => set({ activeModal: null }),

      addNotification: (notification) =>
        set((state) => ({
          notifications: [...state.notifications, notification],
        })),

      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),

      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        darkMode: state.darkMode,
      }),
    }
  )
);
