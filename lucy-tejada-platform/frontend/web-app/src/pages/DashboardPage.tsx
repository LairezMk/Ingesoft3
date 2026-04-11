/**
 * ============================================
 * DASHBOARD PAGE
 * ============================================
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { StatCard } from '@/components/cards/StatCard';
import { dashboardService } from '@/services/dashboardService';
import {
  UserGroupIcon,
  AcademicCapIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

const COLORS = ['#8B5CF6', '#F97316', '#10B981', '#06B6D4', '#6366F1', '#F43F5E'];

export const DashboardPage: React.FC = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardService.getStats(),
  });

  const { data: enrollmentsByProgram, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ['enrollments-by-program'],
    queryFn: () => dashboardService.getEnrollmentsByProgram(),
  });

  const { data: geographicData } = useQuery({
    queryKey: ['geographic-distribution'],
    queryFn: () => dashboardService.getGeographicDistribution(),
  });

  const { data: enrollmentTrend } = useQuery({
    queryKey: ['enrollment-trend'],
    queryFn: () => dashboardService.getEnrollmentTrend(12),
  });

  const { data: attendanceByArea } = useQuery({
    queryKey: ['attendance-by-area'],
    queryFn: () => dashboardService.getAttendanceByArea(),
  });

  const statsData = stats?.data;
  const programsData = enrollmentsByProgram?.data || [];
  const trendData = enrollmentTrend?.data || [];
  const areaData = attendanceByArea?.data || [];

  // Sample data for demo when API is not available
  const sampleTrendData = [
    { period: '2024-01', count: 45 },
    { period: '2024-02', count: 52 },
    { period: '2024-03', count: 61 },
    { period: '2024-04', count: 58 },
    { period: '2024-05', count: 72 },
    { period: '2024-06', count: 85 },
  ];

  const sampleProgramsData = [
    { programName: 'Danza', enrollments: 120, area: 'DANZA' },
    { programName: 'Música', enrollments: 95, area: 'MUSICA' },
    { programName: 'Teatro', enrollments: 75, area: 'TEATRO' },
    { programName: 'Artes Visuales', enrollments: 60, area: 'ARTES_VISUALES' },
  ];

  const sampleAreaData = [
    { area: 'Danza', attendanceRate: 92 },
    { area: 'Música', attendanceRate: 88 },
    { area: 'Teatro', attendanceRate: 85 },
    { area: 'Artes Visuales', attendanceRate: 90 },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-display font-bold text-dark-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-1 text-dark-500 dark:text-dark-400">
            Resumen de la gestión institucional del Centro Cultural Lucy Tejada
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-dark-500 dark:text-dark-400">
            Última actualización: {new Date().toLocaleString('es-CO')}
          </span>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Estudiantes"
          value={statsData?.totalStudents || 350}
          change={{ value: 12, type: 'increase' }}
          icon={<UserGroupIcon className="w-6 h-6" />}
          loading={statsLoading}
        />
        <StatCard
          title="Estudiantes Activos"
          value={statsData?.activeStudents || 285}
          change={{ value: 8, type: 'increase' }}
          icon={<CheckCircleIcon className="w-6 h-6" />}
          iconColor="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
          loading={statsLoading}
        />
        <StatCard
          title="Total Docentes"
          value={statsData?.totalTeachers || 24}
          icon={<AcademicCapIcon className="w-6 h-6" />}
          iconColor="bg-secondary-100 dark:bg-secondary-900/30 text-secondary-600 dark:text-secondary-400"
          loading={statsLoading}
        />
        <StatCard
          title="Programas Activos"
          value={statsData?.activePrograms || 8}
          icon={<BookOpenIcon className="w-6 h-6" />}
          iconColor="bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400"
          loading={statsLoading}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Matrículas Activas"
          value={statsData?.activeEnrollments || 320}
          icon={<CalendarDaysIcon className="w-6 h-6" />}
          iconColor="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
          loading={statsLoading}
        />
        <StatCard
          title="Tasa de Asistencia"
          value={`${statsData?.attendanceRate || 88}%`}
          change={{ value: 3, type: 'increase' }}
          icon={<ChartBarIcon className="w-6 h-6" />}
          iconColor="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
          loading={statsLoading}
        />
        <StatCard
          title="Reservas Pendientes"
          value={statsData?.upcomingReservations || 5}
          icon={<ClockIcon className="w-6 h-6" />}
          iconColor="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
          loading={statsLoading}
        />
        <StatCard
          title="Alertas Mantenimiento"
          value={statsData?.maintenanceAlerts || 2}
          icon={<ExclamationCircleIcon className="w-6 h-6" />}
          iconColor="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
          loading={statsLoading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollment Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">
            Tendencia de Matrículas
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData.length > 0 ? trendData : sampleTrendData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis
                  dataKey="period"
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  fill="url(#colorCount)"
                  name="Matrículas"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Enrollments by Program Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">
            Matrículas por Programa
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={programsData.length > 0 ? programsData : sampleProgramsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="enrollments"
                  nameKey="programName"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {(programsData.length > 0 ? programsData : sampleProgramsData).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Attendance by Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">
          Asistencia por Área Artística
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={areaData.length > 0 ? areaData : sampleAreaData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis
                dataKey="area"
                tick={{ fill: '#64748B', fontSize: 12 }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#64748B', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                unit="%"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1E293B',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                }}
              />
              <Legend />
              <Bar
                dataKey="attendanceRate"
                name="Tasa de Asistencia"
                fill="#8B5CF6"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">
          Acciones Rápidas
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '👤', label: 'Nuevo Estudiante', href: '/students' },
            { icon: '📝', label: 'Nueva Matrícula', href: '/enrollments' },
            { icon: '📅', label: 'Nueva Reserva', href: '/reservations' },
            { icon: '📊', label: 'Generar Reporte', href: '/reports' },
          ].map((action, index) => (
            <Link
              key={index}
              to={action.href}
              className="flex flex-col items-center gap-3 p-4 rounded-xl bg-dark-50 dark:bg-dark-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors group"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">
                {action.icon}
              </span>
              <span className="text-sm font-medium text-dark-700 dark:text-dark-200 text-center">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
