/**
 * ============================================
 * APP ROUTER
 * ============================================
 */

import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import MainLayout from '@/components/layout/MainLayout';
import { type AppRole, getDefaultRouteForRole, hasRoleAccess } from '@/utils/rbac';

// Lazy load pages
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const StudentsPage = lazy(() => import('@/pages/StudentsPage'));
const TeachersPage = lazy(() => import('@/pages/TeachersPage'));
const ProgramsPage = lazy(() => import('@/pages/ProgramsPage'));
const GroupsPage = lazy(() => import('@/pages/GroupsPage'));
const EnrollmentsPage = lazy(() => import('@/pages/EnrollmentsPage'));
const AttendancePage = lazy(() => import('@/pages/AttendancePage'));
const EvaluationsPage = lazy(() => import('@/pages/EvaluationsPage'));
const VenuesPage = lazy(() => import('@/pages/AdditionalPages').then(m => ({ default: m.VenuesPage })));
const ReservationsPage = lazy(() => import('@/pages/AdditionalPages').then(m => ({ default: m.ReservationsPage })));
const ContractsPage = lazy(() => import('@/pages/AdditionalPages').then(m => ({ default: m.ContractsPage })));
const MaintenancePage = lazy(() => import('@/pages/AdditionalPages').then(m => ({ default: m.MaintenancePage })));
const ReportsPage = lazy(() => import('@/pages/AdditionalPages').then(m => ({ default: m.ReportsPage })));
const ProfilePage = lazy(() => import('@/pages/AdditionalPages').then(m => ({ default: m.ProfilePage })));
const SettingsPage = lazy(() => import('@/pages/AdditionalPages').then(m => ({ default: m.SettingsPage })));

// Loading fallback
const PageLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-dark-50 dark:bg-dark-900">
    <div className="flex flex-col items-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 animate-pulse flex items-center justify-center">
        <span className="text-2xl">🎭</span>
      </div>
      <div className="w-12 h-1 bg-primary-200 dark:bg-primary-800 rounded-full overflow-hidden">
        <div className="h-full bg-primary-500 rounded-full animate-[shimmer_1s_ease-in-out_infinite]" style={{ width: '50%' }} />
      </div>
    </div>
  </div>
);

const RoleGuard: React.FC<{ allowedRoles: AppRole[]; children: React.ReactElement }> = ({
  allowedRoles,
  children,
}) => {
  const { user } = useAuthStore();
  if (!hasRoleAccess(user?.role, allowedRoles)) {
    return <Navigate to={getDefaultRouteForRole(user?.role)} replace />;
  }
  return children;
};

// Protected Route Component
const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

// Public Route Component (redirect if authenticated)
const PublicRoute: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) {
    return <PageLoader />;
  }

  if (isAuthenticated) {
    return <Navigate to={getDefaultRouteForRole(user?.role)} replace />;
  }

  return <Outlet />;
};

const HomeRedirect: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/programs" replace />;
  }

  return <Navigate to={getDefaultRouteForRole(user?.role)} replace />;
};

// Router configuration
export const router = createBrowserRouter([
  {
    // Public auth routes
    element: <PublicRoute />,
    children: [
      {
        path: '/login',
        element: (
          <Suspense fallback={<PageLoader />}>
            <LoginPage />
          </Suspense>
        ),
      },
    ],
  },
  {
    // Public catalog routes
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: <HomeRedirect />,
      },
      {
        path: '/programs',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ProgramsPage />
          </Suspense>
        ),
      },
      {
        path: '/venues',
        element: (
          <Suspense fallback={<PageLoader />}>
            <VenuesPage />
          </Suspense>
        ),
      },
      {
        path: '/reservations',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ReservationsPage />
          </Suspense>
        ),
      },
    ],
  },
  {
    // Protected routes
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            path: '/dashboard',
            element: (
              <RoleGuard allowedRoles={['ADMIN', 'DOCENTE', 'ESTUDIANTE']}>
                <Suspense fallback={<PageLoader />}>
                  <DashboardPage />
                </Suspense>
              </RoleGuard>
            ),
          },
          {
            path: '/students',
            element: (
              <RoleGuard allowedRoles={['ADMIN', 'DOCENTE']}>
                <Suspense fallback={<PageLoader />}>
                  <StudentsPage />
                </Suspense>
              </RoleGuard>
            ),
          },
          {
            path: '/teachers',
            element: (
              <RoleGuard allowedRoles={['ADMIN']}>
                <Suspense fallback={<PageLoader />}>
                  <TeachersPage />
                </Suspense>
              </RoleGuard>
            ),
          },
          {
            path: '/groups',
            element: (
              <RoleGuard allowedRoles={['ADMIN', 'DOCENTE']}>
                <Suspense fallback={<PageLoader />}>
                  <GroupsPage />
                </Suspense>
              </RoleGuard>
            ),
          },
          {
            path: '/enrollments',
            element: (
              <RoleGuard allowedRoles={['ADMIN', 'DOCENTE', 'ESTUDIANTE']}>
                <Suspense fallback={<PageLoader />}>
                  <EnrollmentsPage />
                </Suspense>
              </RoleGuard>
            ),
          },
          {
            path: '/attendance',
            element: (
              <RoleGuard allowedRoles={['ADMIN', 'DOCENTE', 'ESTUDIANTE']}>
                <Suspense fallback={<PageLoader />}>
                  <AttendancePage />
                </Suspense>
              </RoleGuard>
            ),
          },
          {
            path: '/evaluations',
            element: (
              <RoleGuard allowedRoles={['ADMIN', 'DOCENTE', 'ESTUDIANTE']}>
                <Suspense fallback={<PageLoader />}>
                  <EvaluationsPage />
                </Suspense>
              </RoleGuard>
            ),
          },
          {
            path: '/contracts',
            element: (
              <RoleGuard allowedRoles={['ADMIN']}>
                <Suspense fallback={<PageLoader />}>
                  <ContractsPage />
                </Suspense>
              </RoleGuard>
            ),
          },
          {
            path: '/maintenance',
            element: (
              <RoleGuard allowedRoles={['ADMIN']}>
                <Suspense fallback={<PageLoader />}>
                  <MaintenancePage />
                </Suspense>
              </RoleGuard>
            ),
          },
          {
            path: '/reports',
            element: (
              <RoleGuard allowedRoles={['ADMIN', 'DOCENTE', 'ESTUDIANTE']}>
                <Suspense fallback={<PageLoader />}>
                  <ReportsPage />
                </Suspense>
              </RoleGuard>
            ),
          },
          {
            path: '/profile',
            element: (
              <RoleGuard allowedRoles={['ADMIN', 'DOCENTE', 'ESTUDIANTE', 'VISITANTE']}>
                <Suspense fallback={<PageLoader />}>
                  <ProfilePage />
                </Suspense>
              </RoleGuard>
            ),
          },
          {
            path: '/settings',
            element: (
              <RoleGuard allowedRoles={['ADMIN', 'DOCENTE', 'ESTUDIANTE', 'VISITANTE']}>
                <Suspense fallback={<PageLoader />}>
                  <SettingsPage />
                </Suspense>
              </RoleGuard>
            ),
          },
        ],
      },
    ],
  },
  {
    // Catch all - 404
    path: '*',
    element: (
      <div className="min-h-screen flex items-center justify-center bg-dark-50 dark:bg-dark-900">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-primary-500">404</h1>
          <p className="mt-4 text-xl text-dark-600 dark:text-dark-300">Página no encontrada</p>
          <a
            href="/"
            className="mt-6 inline-block btn-primary"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    ),
  },
]);

export default router;
