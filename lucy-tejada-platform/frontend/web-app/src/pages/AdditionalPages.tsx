/**
 * VENUES & RESERVATIONS & CONTRACTS & MAINTENANCE & REPORTS & SETTINGS PAGES
 */

// VenuesPage.tsx
import React, { useState } from 'react';
import { storage } from '@/services/mockApi';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Venue {
  id: string;
  name: string;
  capacity: number;
  type: string;
  status: string;
}

export const VenuesPage: React.FC = () => {
  const [venues, setVenues] = useState<Venue[]>(() => {
    const data = storage.get<Venue[]>('venues') || [];
    if (data.length === 0) {
      const initial = [
        { id: '1', name: 'Auditorio Principal', capacity: 300, type: 'Teatro', status: 'AVAILABLE' },
        { id: '2', name: 'Sala de Danza', capacity: 40, type: 'Danza', status: 'AVAILABLE' },
        { id: '3', name: 'Sala de Música', capacity: 25, type: 'Música', status: 'MAINTENANCE' },
      ];
      storage.set('venues', initial);
      return initial;
    }
    return data;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Escenarios Culturales</h1>
          <p className="text-dark-500 mt-1">Gestión de espacios físicos</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />Nuevo Escenario
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {venues.map(venue => (
          <div key={venue.id} className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold mb-1">{venue.name}</h3>
                <p className="text-sm text-dark-500">{venue.type}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                venue.status === 'AVAILABLE' ? 'bg-success-100 text-success-800' : 'bg-warning-100 text-warning-800'
              }`}>
                {venue.status === 'AVAILABLE' ? 'Disponible' : 'Mantenimiento'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-dark-600">
              <span>👥</span>
              <span>Capacidad: {venue.capacity} personas</span>
            </div>
            <div className="flex gap-2 mt-4">
              <button className="btn-secondary flex-1">Ver Calendario</button>
              <button className="text-primary-600"><PencilIcon className="w-5 h-5" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ReservationsPage.tsx
export const ReservationsPage: React.FC = () => {
  const reservations = [
    { id: '1', venue: 'Auditorio Principal', event: 'Concierto de Clausura', date: '2024-04-15', time: '18:00-21:00', status: 'APPROVED' },
    { id: '2', venue: 'Sala de Danza', event: 'Ensayo Ballet', date: '2024-04-10', time: '14:00-17:00', status: 'PENDING' },
    { id: '3', venue: 'Sala de Música', event: 'Clase de Guitarra', date: '2024-04-12', time: '10:00-12:00', status: 'APPROVED' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reservas de Escenarios</h1>
          <p className="text-dark-500 mt-1">Gestión de reservas y eventos</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />Nueva Reserva
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-dark-50 dark:bg-dark-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase">Escenario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase">Evento</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase">Horario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-200 dark:divide-dark-700">
            {reservations.map(res => (
              <tr key={res.id} className="hover:bg-dark-50 dark:hover:bg-dark-800">
                <td className="px-6 py-4">{res.venue}</td>
                <td className="px-6 py-4">{res.event}</td>
                <td className="px-6 py-4">{new Date(res.date).toLocaleDateString()}</td>
                <td className="px-6 py-4">{res.time}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    res.status === 'APPROVED' ? 'bg-success-100 text-success-800' : 'bg-warning-100 text-warning-800'
                  }`}>
                    {res.status === 'APPROVED' ? 'Aprobada' : 'Pendiente'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ContractsPage.tsx
export const ContractsPage: React.FC = () => {
  const contracts = [
    { id: '1', title: 'Contrato Docente - María García', type: 'Laboral', status: 'APPROVED', date: '2024-01-15' },
    { id: '2', title: 'Contrato Prestación de Servicios - Juan Pérez', type: 'Servicios', status: 'PENDING', date: '2024-03-20' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contratos</h1>
          <p className="text-dark-500 mt-1">Gestión de contratos y convenios</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />Nuevo Contrato
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {contracts.map(contract => (
          <div key={contract.id} className="card p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold mb-2">{contract.title}</h3>
                <div className="flex gap-4 text-sm text-dark-600">
                  <span>📄 {contract.type}</span>
                  <span>📅 {new Date(contract.date).toLocaleDateString()}</span>
                </div>
              </div>
              <span className={`px-3 py-1 text-xs rounded-full ${
                contract.status === 'APPROVED' ? 'bg-success-100 text-success-800' : 'bg-warning-100 text-warning-800'
              }`}>
                {contract.status === 'APPROVED' ? 'Aprobado' : 'Pendiente Revisión'}
              </span>
            </div>
            <div className="flex gap-2 mt-4">
              <button className="btn-secondary">Ver Documento</button>
              <button className="btn-primary">Revisar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// MaintenancePage.tsx
export const MaintenancePage: React.FC = () => {
  const [maintenance, setMaintenance] = useState([
    { id: '1', equipment: 'Piano de Cola', issue: 'Afinación requerida', priority: 'HIGH', status: 'PENDING', date: '2024-03-30' },
    { id: '2', equipment: 'Sistema de Sonido', issue: 'Revisión general', priority: 'MEDIUM', status: 'IN_PROGRESS', date: '2024-03-28' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Mantenimiento</h1>
        <button className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />Registrar Mantenimiento
        </button>
      </div>

      <div className="grid gap-4">
        {maintenance.map(item => (
          <div key={item.id} className="card p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold">{item.equipment}</h3>
                <p className="text-dark-600 mt-1">{item.issue}</p>
                <p className="text-sm text-dark-500 mt-2">Registrado: {new Date(item.date).toLocaleDateString()}</p>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <span className={`px-3 py-1 text-xs rounded-full ${
                  item.priority === 'HIGH' ? 'bg-error-100 text-error-800' :
                  item.priority === 'MEDIUM' ? 'bg-warning-100 text-warning-800' :
                  'bg-primary-100 text-primary-800'
                }`}>
                  {item.priority === 'HIGH' ? 'Alta Prioridad' : item.priority === 'MEDIUM' ? 'Media' : 'Baja'}
                </span>
                <span className={`px-3 py-1 text-xs rounded-full ${
                  item.status === 'PENDING' ? 'bg-warning-100 text-warning-800' :
                  item.status === 'IN_PROGRESS' ? 'bg-primary-100 text-primary-800' :
                  'bg-success-100 text-success-800'
                }`}>
                  {item.status === 'PENDING' ? 'Pendiente' : item.status === 'IN_PROGRESS' ? 'En Progreso' : 'Completado'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ReportsPage.tsx
export const ReportsPage: React.FC = () => {
  const reportTypes = [
    { id: 'students', name: 'Reporte de Estudiantes', description: 'Listado completo de estudiantes matriculados', icon: '👥' },
    { id: 'attendance', name: 'Reporte de Asistencia', description: 'Estadísticas de asistencia por grupo', icon: '📊' },
    { id: 'grades', name: 'Reporte de Evaluaciones', description: 'Notas y evaluaciones cualitativas', icon: '📝' },
    { id: 'financial', name: 'Reporte Financiero', description: 'Resumen de ingresos y gastos', icon: '💰' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reportes</h1>
        <p className="text-dark-500 mt-1">Generación de informes y estadísticas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportTypes.map(report => (
          <div key={report.id} className="card p-6">
            <div className="flex items-start gap-4">
              <div className="text-4xl">{report.icon}</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-2">{report.name}</h3>
                <p className="text-sm text-dark-600 mb-4">{report.description}</p>
                <div className="flex gap-2">
                  <button className="btn-secondary">📄 PDF</button>
                  <button className="btn-secondary">📊 Excel</button>
                  <button className="btn-primary">Generar</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// SettingsPage.tsx
export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-dark-500 mt-1">Ajustes del sistema y perfil de usuario</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-bold mb-4">Perfil de Usuario</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre</label>
              <input type="text" defaultValue="Administrador" className="input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" defaultValue="admin@lucytejada.gov.co" className="input w-full" />
            </div>
            <button className="btn-primary w-full">Guardar Cambios</button>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-bold mb-4">Preferencias</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Modo Oscuro</span>
              <button className="w-12 h-6 bg-primary-600 rounded-full relative">
                <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></span>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span>Notificaciones Email</span>
              <button className="w-12 h-6 bg-dark-300 rounded-full relative">
                <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></span>
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Idioma</label>
              <select className="input w-full">
                <option>Español</option>
                <option>English</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-bold mb-4">Seguridad</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Contraseña Actual</label>
              <input type="password" className="input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nueva Contraseña</label>
              <input type="password" className="input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confirmar Contraseña</label>
              <input type="password" className="input w-full" />
            </div>
            <button className="btn-primary w-full">Cambiar Contraseña</button>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-bold mb-4">Información del Sistema</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-dark-500">Versión:</span>
              <span className="font-semibold">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-500">Última actualización:</span>
              <span className="font-semibold">{new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-500">Modo:</span>
              <span className="font-semibold text-success-600">Producción</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
