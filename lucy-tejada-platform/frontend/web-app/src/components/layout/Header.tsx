/**
 * ============================================
 * HEADER COMPONENT
 * ============================================
 */

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { getRoleLabel, normalizeRole } from '@/utils/rbac';
import { markAllRead, markRead } from '@/services/notificationService';
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  BellIcon,
  SunIcon,
  MoonIcon,
} from '@heroicons/react/24/outline';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode, setSidebarOpen, notifications, markAllNotificationsRead, markNotificationRead } = useUIStore();
  const { user } = useAuthStore();
  const roleLabel = user ? getRoleLabel(user.role) : 'Visitante';
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const handleMarkAllRead = () => {
    const role = normalizeRole(user?.role) ?? 'VISITANTE';
    markAllRead(role, user?.email ?? null);
    markAllNotificationsRead();
  };

  const handleMarkRead = (id: string) => {
    markRead(id, user?.email ?? null);
    markNotificationRead(id);
  };

  return (
    <header className="sticky top-0 z-30 glass border-b border-dark-200/50 dark:border-dark-700/50">
      <div className="flex items-center justify-between h-16 px-4 md:px-6 lg:px-8">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-800 text-dark-500 lg:hidden"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>

          {/* Search */}
          <div className="hidden md:flex items-center">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input
                type="text"
                placeholder="Buscar estudiantes, programas..."
                className={clsx(
                  'w-72 lg:w-96 pl-10 pr-4 py-2 rounded-xl',
                  'bg-dark-100 dark:bg-dark-800',
                  'border border-transparent',
                  'text-dark-900 dark:text-dark-100',
                  'placeholder:text-dark-400 dark:placeholder:text-dark-500',
                  'focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
                  'transition-all duration-200'
                )}
              />
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Search Icon (Mobile) */}
          <button className="p-2 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-800 text-dark-500 md:hidden">
            <MagnifyingGlassIcon className="w-6 h-6" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setNotificationsOpen((v) => !v)}
              className="relative p-2 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-800 text-dark-500"
              aria-label="Notificaciones"
              title="Notificaciones"
            >
              <BellIcon className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1.5 text-[10px] font-bold rounded-full bg-red-500 text-white flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </motion.button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-[360px] max-w-[92vw] rounded-2xl border border-dark-200/70 dark:border-dark-700 bg-white dark:bg-dark-800 shadow-xl overflow-hidden z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-dark-200 dark:border-dark-700">
                  <p className="font-semibold text-dark-900 dark:text-dark-50">Notificaciones</p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="text-xs font-semibold text-primary-600 hover:text-primary-500"
                    >
                      Marcar todo como leído
                    </button>
                    <button
                      type="button"
                      onClick={() => setNotificationsOpen(false)}
                      className="text-xs font-semibold text-dark-500 hover:text-dark-700 dark:hover:text-dark-200"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>

                <div className="max-h-[420px] overflow-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-sm text-dark-500">No tienes notificaciones.</div>
                  ) : (
                    <ul className="divide-y divide-dark-200 dark:divide-dark-700">
                      {notifications.slice(0, 20).map((n) => (
                        <li key={n.id} className={clsx('p-4 hover:bg-dark-50 dark:hover:bg-dark-700/40', !n.read && 'bg-primary-50/60 dark:bg-primary-900/10')}>
                          <button
                            type="button"
                            className="w-full text-left"
                            onClick={() => {
                              handleMarkRead(n.id);
                              if (n.link) navigate(n.link);
                            }}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className={clsx('font-semibold truncate', n.read ? 'text-dark-900 dark:text-dark-100' : 'text-primary-700 dark:text-primary-200')}>
                                  {n.title}
                                </p>
                                {n.message && <p className="mt-1 text-sm text-dark-600 dark:text-dark-300 line-clamp-2">{n.message}</p>}
                                <p className="mt-1 text-xs text-dark-400">{new Date(n.timestamp).toLocaleString('es-CO')}</p>
                              </div>
                              {!n.read && <span className="mt-1 h-2 w-2 rounded-full bg-primary-500" />}
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Dark Mode Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleDarkMode}
            className="p-2 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-800 text-dark-500"
          >
            {darkMode ? (
              <SunIcon className="w-6 h-6" />
            ) : (
              <MoonIcon className="w-6 h-6" />
            )}
          </motion.button>

          {/* User Menu */}
          <div className="hidden sm:flex items-center gap-3 pl-3 ml-2 border-l border-dark-200 dark:border-dark-700">
            <button
              type="button"
              onClick={() => navigate(user ? '/profile' : '/login')}
              className="avatar-md cursor-pointer hover:ring-2 hover:ring-primary-500 transition-all"
              title={user ? 'Ver perfil' : 'Iniciar sesión'}
            >
              {user?.profile?.photoUrl ? (
                <img
                  src={user.profile.photoUrl}
                  alt={user.profile.firstName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>
                  {user?.profile?.firstName?.[0] || user?.email[0].toUpperCase()}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate(user ? '/profile' : '/login')}
              className="hidden lg:block text-left hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              title={user ? 'Editar perfil' : 'Iniciar sesión'}
            >
              <p className="text-sm font-medium text-dark-900 dark:text-white">
              {user?.profile?.firstName
                  ? `${user.profile.firstName} ${user.profile?.lastName ?? ''}`.trim()
                  : user?.email ?? 'Acceso público'}
              </p>
              <p className="text-xs text-dark-500 dark:text-dark-400">
                {roleLabel}
              </p>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
