/**
 * ============================================
 * APP ROUTER
 * ============================================
 */

import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import MainLayout from '@/components/layout/MainLayout';

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
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <PageLoader />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

// Router configuration
export const router = createBrowserRouter([
  {
    // Public routes
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
    // Protected routes
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            path: '/',
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: '/dashboard',
            element: (
              <Suspense fallback={<PageLoader />}>
                <DashboardPage />
              </Suspense>
            ),
          },
          {
            path: '/students',
            element: (
              <Suspense fallback={<PageLoader />}>
                <StudentsPage />
              </Suspense>
            ),
          },
          {
            path: '/teachers',
            element: (
              <Suspense fallback={<PageLoader />}>
                <TeachersPage />
              </Suspense>
            ),
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
            path: '/groups',
            element: (
              <Suspense fallback={<PageLoader />}>
                <GroupsPage />
              </Suspense>
            ),
          },
          {
            path: '/enrollments',
            element: (
              <Suspense fallback={<PageLoader />}>
                <EnrollmentsPage />
              </Suspense>
            ),
          },
          {
            path: '/attendance',
            element: (
              <Suspense fallback={<PageLoader />}>
                <AttendancePage />
              </Suspense>
            ),
          },
          {
            path: '/evaluations',
            element: (
              <Suspense fallback={<PageLoader />}>
                <EvaluationsPage />
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
          {
            path: '/contracts',
            element: (
              <Suspense fallback={<PageLoader />}>
                <ContractsPage />
              </Suspense>
            ),
          },
          {
            path: '/maintenance',
            element: (
              <Suspense fallback={<PageLoader />}>
                <MaintenancePage />
              </Suspense>
            ),
          },
          {
            path: '/reports',
            element: (
              <Suspense fallback={<PageLoader />}>
                <ReportsPage />
              </Suspense>
            ),
          },
          {
            path: '/settings',
            element: (
              <Suspense fallback={<PageLoader />}>
                <SettingsPage />
              </Suspense>
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
            href="/dashboard"
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
