/**
 * ============================================
 * UI STORE - ZUSTAND
 * Gestión de estado de la interfaz
 * ============================================
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ThemeName = 'lucy' | 'ocean' | 'sunset' | 'forest';

const applyDarkClass = (dark: boolean) => {
  if (dark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

const applyThemeAttribute = (theme: ThemeName) => {
  document.documentElement.setAttribute('data-theme', theme);
};

export interface AppNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  timestamp: string; // ISO
  link?: string;
  read?: boolean;
}

interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  darkMode: boolean;
  theme: ThemeName;
  activeModal: string | null;
  notifications: AppNotification[];

  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapse: () => void;
  toggleDarkMode: () => void;
  setDarkMode: (dark: boolean) => void;
  setTheme: (theme: ThemeName) => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  addNotification: (notification: AppNotification) => void;
  setNotifications: (notifications: AppNotification[]) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  markAllNotificationsRead: () => void;
  markNotificationRead: (id: string) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      sidebarCollapsed: false,
      darkMode: false,
      theme: 'lucy',
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
          applyDarkClass(newDarkMode);
          return { darkMode: newDarkMode };
        }),

      setDarkMode: (dark) => {
        applyDarkClass(dark);
        set({ darkMode: dark });
      },

      setTheme: (theme) => {
        applyThemeAttribute(theme);
        set({ theme });
      },

      openModal: (modalId) => set({ activeModal: modalId }),

      closeModal: () => set({ activeModal: null }),

      addNotification: (notification) =>
        set((state) => ({
          notifications: [notification, ...state.notifications].slice(0, 100),
        })),

      setNotifications: (notifications) => set({ notifications }),

      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),

      clearNotifications: () => set({ notifications: [] }),

      markAllNotificationsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),

      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),
    }),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        darkMode: state.darkMode,
        theme: state.theme,
      }),
    }
  )
);
