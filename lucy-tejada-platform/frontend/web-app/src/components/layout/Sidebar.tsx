/**
 * ============================================
 * SIDEBAR COMPONENT
 * ============================================
 */

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { type AppRole, hasRoleAccess } from '@/utils/rbac';
import logoImage from '@/assets/images/logo.png';
import {
  HomeIcon,
  UserGroupIcon,
  AcademicCapIcon,
  BookOpenIcon,
  CalendarIcon,
  ClipboardDocumentCheckIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  WrenchScrewdriverIcon,
  CogIcon,
  UserCircleIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: AppRole[];
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, roles: ['ADMIN', 'DOCENTE', 'ESTUDIANTE'] },
  { name: 'Estudiantes', href: '/students', icon: UserGroupIcon, roles: ['ADMIN', 'DOCENTE'] },
  { name: 'Docentes', href: '/teachers', icon: AcademicCapIcon, roles: ['ADMIN'] },
  { name: 'Programas', href: '/programs', icon: BookOpenIcon, roles: ['ADMIN', 'DOCENTE', 'ESTUDIANTE', 'VISITANTE'] },
  { name: 'Grupos', href: '/groups', icon: CalendarIcon, roles: ['ADMIN', 'DOCENTE'] },
  { name: 'Matrículas', href: '/enrollments', icon: ClipboardDocumentCheckIcon, roles: ['ADMIN', 'DOCENTE', 'ESTUDIANTE'] },
  { name: 'Asistencia', href: '/attendance', icon: CalendarDaysIcon, roles: ['ADMIN', 'DOCENTE', 'ESTUDIANTE'] },
  { name: 'Evaluaciones', href: '/evaluations', icon: ChartBarIcon, roles: ['ADMIN', 'DOCENTE', 'ESTUDIANTE'] },
  { name: 'Escenarios', href: '/venues', icon: BuildingOfficeIcon, roles: ['ADMIN', 'DOCENTE', 'ESTUDIANTE', 'VISITANTE'] },
  { name: 'Reservas', href: '/reservations', icon: CalendarDaysIcon, roles: ['ADMIN', 'DOCENTE', 'ESTUDIANTE', 'VISITANTE'] },
  { name: 'Contratos', href: '/contracts', icon: DocumentTextIcon, roles: ['ADMIN'] },
  { name: 'Mantenimiento', href: '/maintenance', icon: WrenchScrewdriverIcon, roles: ['ADMIN'] },
  { name: 'Reportes', href: '/reports', icon: ChartBarIcon, roles: ['ADMIN', 'DOCENTE', 'ESTUDIANTE'] },
  { name: 'Perfil', href: '/profile', icon: UserCircleIcon, roles: ['ADMIN', 'DOCENTE', 'ESTUDIANTE', 'VISITANTE'] },
  { name: 'Configuración', href: '/settings', icon: CogIcon, roles: ['ADMIN', 'DOCENTE', 'ESTUDIANTE', 'VISITANTE'] },
];

const publicNavigation = new Set(['/programs', '/venues', '/reservations']);

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { sidebarOpen, sidebarCollapsed, setSidebarOpen, toggleSidebarCollapse } = useUIStore();
  const { user, logout } = useAuthStore();
  const effectiveRole: AppRole = user?.role ?? 'VISITANTE';

  const handleLogout = () => {
    if (user) {
      logout();
    }
    navigate('/login');
  };

  const filteredNavigation = navigation.filter(
    (item) =>
      (!item.roles || hasRoleAccess(effectiveRole, item.roles)) &&
      (user ? true : publicNavigation.has(item.href))
  );

  return (
    <motion.aside
      initial={false}
      animate={{
        width: sidebarCollapsed ? 80 : 256,
        x: sidebarOpen ? 0 : -256,
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={clsx(
        'fixed top-0 left-0 z-40 h-screen',
        'bg-white dark:bg-dark-800',
        'border-r border-dark-200 dark:border-dark-700',
        'flex flex-col',
        'lg:translate-x-0'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-dark-200 dark:border-dark-700">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-white ring-1 ring-dark-200 dark:bg-dark-700 dark:ring-dark-600 flex items-center justify-center overflow-hidden shrink-0">
            <img
              src={logoImage}
              alt="Logo Centro Cultural Lucy Tejada"
              className="w-7 h-7 object-contain"
            />
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col">
              <span className="font-display font-semibold text-dark-900 dark:text-white">
                Lucy Tejada
              </span>
              <span className="text-xs text-dark-500 dark:text-dark-400">
                Centro Cultural
              </span>
            </div>
          )}
        </motion.div>

        <button
          onClick={toggleSidebarCollapse}
          className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 text-dark-500 hidden lg:block"
        >
          {sidebarCollapsed ? (
            <Bars3Icon className="w-5 h-5" />
          ) : (
            <XMarkIcon className="w-5 h-5" />
          )}
        </button>

        <button
          onClick={() => setSidebarOpen(false)}
          className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 text-dark-500 lg:hidden"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-1">
        {filteredNavigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl',
                'transition-all duration-200',
                'group',
                isActive
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-medium'
                  : 'text-dark-600 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-700'
              )
            }
            onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
          >
            <item.icon
              className={clsx(
                'w-5 h-5 flex-shrink-0',
                'transition-transform group-hover:scale-110'
              )}
            />
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="truncate"
              >
                {item.name}
              </motion.span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-3 border-t border-dark-200 dark:border-dark-700">
        {!sidebarCollapsed && user && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2 min-w-0">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="avatar-md shrink-0 hover:ring-2 hover:ring-primary-500 transition-all"
              title="Ir a perfil"
            >
              {user.profile?.photoUrl ? (
                <img
                  src={user.profile.photoUrl}
                  alt={user.profile.firstName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>
                  {user.profile?.firstName?.[0] || user.email[0].toUpperCase()}
                </span>
              )}
            </button>
            <div className="flex-1 min-w-0 overflow-hidden">
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="block w-full overflow-hidden text-ellipsis whitespace-nowrap text-left text-sm font-medium text-dark-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                title="Editar perfil"
              >
                {user.profile?.firstName
                  ? `${user.profile.firstName} ${user.profile?.lastName ?? ''}`.trim()
                  : user.email}
              </button>
              <p className="block w-full overflow-hidden text-ellipsis whitespace-nowrap text-xs text-dark-500 dark:text-dark-400">
                {user.email}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className={clsx(
            'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl',
            user
              ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
              : 'text-primary-700 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20',
            'transition-colors'
          )}
        >
          <ArrowLeftOnRectangleIcon className="w-5 h-5" />
          {!sidebarCollapsed && <span>{user ? 'Cerrar sesión' : 'Iniciar sesión'}</span>}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
