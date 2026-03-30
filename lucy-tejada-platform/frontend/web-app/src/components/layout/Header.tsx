/**
 * ============================================
 * HEADER COMPONENT
 * ============================================
 */

import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  BellIcon,
  SunIcon,
  MoonIcon,
} from '@heroicons/react/24/outline';

export const Header: React.FC = () => {
  const { darkMode, toggleDarkMode, setSidebarOpen } = useUIStore();
  const { user } = useAuthStore();

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
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-800 text-dark-500"
          >
            <BellIcon className="w-6 h-6" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </motion.button>

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
            <div className="avatar-md cursor-pointer hover:ring-2 hover:ring-primary-500 transition-all">
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
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-medium text-dark-900 dark:text-white">
                {user?.profile?.firstName} {user?.profile?.lastName}
              </p>
              <p className="text-xs text-dark-500 dark:text-dark-400">
                {user?.role === 'ADMIN' ? 'Administrador' :
                 user?.role === 'DOCENTE' ? 'Docente' :
                 user?.role === 'ESTUDIANTE' ? 'Estudiante' :
                 user?.role}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
