/**
 * PROGRAMS PAGE - Programas Formativos
 */
import React, { useState, useEffect } from 'react';
import { storage } from '@/services/mockApi';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface Program {
  id: string;
  name: string;
  area: string;
  level: string;
  duration: number;
  description: string;
  status: string;
  maxStudents: number;
  createdAt: string;
}

const ProgramsPage: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Program | null>(null);
  const [formData, setFormData] = useState<Partial<Program>>({});

  const areas = ['Danza', 'Música', 'Teatro', 'Artes Visuales'];
  const levels = ['Básico', 'Intermedio', 'Avanzado'];

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = () => {
    let data = storage.get<Program[]>('programs') || [];
    if (data.length === 0) {
      data = [
        { id: '1', name: 'Ballet Clásico', area: 'Danza', level: 'Básico', duration: 12, description: 'Introducción al ballet', status: 'ACTIVE', maxStudents: 20, createdAt: new Date().toISOString() },
        { id: '2', name: 'Guitarra Eléctrica', area: 'Música', level: 'Intermedio', duration: 16, description: 'Técnicas modernas de guitarra', status: 'ACTIVE', maxStudents: 15, createdAt: new Date().toISOString() },
        { id: '3', name: 'Teatro Experimental', area: 'Teatro', level: 'Avanzado', duration: 20, description: 'Técnicas avanzadas de actuación', status: 'ACTIVE', maxStudents: 25, createdAt: new Date().toISOString() },
        { id: '4', name: 'Pintura al Óleo', area: 'Artes Visuales', level: 'Básico', duration: 14, description: 'Fundamentos de pintura', status: 'ACTIVE', maxStudents: 12, createdAt: new Date().toISOString() },
      ];
      storage.set('programs', data);
    }
    setPrograms(data);
  };

  const filtered = programs.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.area.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let updated;
    if (editing) {
      updated = programs.map(p => p.id === editing.id ? { ...p, ...formData } : p);
    } else {
      updated = [...programs, { ...formData, id: String(programs.length + 1), createdAt: new Date().toISOString() } as Program];
    }
    storage.set('programs', updated);
    setIsModalOpen(false);
    loadPrograms();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Eliminar programa?')) {
      storage.set('programs', programs.filter(p => p.id !== id));
      loadPrograms();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Programas Formativos</h1>
          <p className="text-dark-500 mt-1">Gestión de programas artísticos</p>
        </div>
        <button onClick={() => { setEditing(null); setFormData({ status: 'ACTIVE', level: 'Básico', duration: 12, maxStudents: 20 }); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />Nuevo Programa
        </button>
      </div>

      <div className="card p-4">
        <div className="relative">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
          <input type="text" placeholder="Buscar programas..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input pl-10 w-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {areas.map(area => (
          <div key={area} className="card p-4">
            <h3 className="text-sm text-dark-500">{area}</h3>
            <p className="text-2xl font-bold">{programs.filter(p => p.area === area).length}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(program => (
          <div key={program.id} className="card p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1">{program.name}</h3>
                <div className="flex gap-2 flex-wrap">
                  <span className="text-xs px-2 py-1 rounded-full bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-400">
                    {program.area}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-secondary-100 dark:bg-secondary-900/20 text-secondary-800 dark:text-secondary-400">
                    {program.level}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditing(program); setFormData(program); setIsModalOpen(true); }} className="text-primary-600 hover:text-primary-900">
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button onClick={() => handleDelete(program.id)} className="text-error-600 hover:text-error-900">
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
            <p className="text-sm text-dark-600 dark:text-dark-300 mb-4">{program.description}</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-dark-500">Duración</p>
                <p className="font-semibold">{program.duration} meses</p>
              </div>
              <div>
                <p className="text-dark-500">Cupos</p>
                <p className="font-semibold">{program.maxStudents} estudiantes</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-30" onClick={() => setIsModalOpen(false)}></div>
            <div className="relative bg-white dark:bg-dark-800 rounded-2xl shadow-xl max-w-2xl w-full p-6">
              <h3 className="text-2xl font-bold mb-6">{editing ? 'Editar Programa' : 'Nuevo Programa'}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre del Programa</label>
                  <input type="text" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input w-full" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Área Artística</label>
                    <select value={formData.area || ''} onChange={(e) => setFormData({ ...formData, area: e.target.value })} className="input w-full" required>
                      <option value="">Seleccionar...</option>
                      {areas.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Nivel</label>
                    <select value={formData.level || ''} onChange={(e) => setFormData({ ...formData, level: e.target.value })} className="input w-full" required>
                      {levels.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Duración (meses)</label>
                    <input type="number" min="1" value={formData.duration || ''} onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })} className="input w-full" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Cupos Máximos</label>
                    <input type="number" min="1" value={formData.maxStudents || ''} onChange={(e) => setFormData({ ...formData, maxStudents: parseInt(e.target.value) })} className="input w-full" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Descripción</label>
                  <textarea value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input w-full" rows={3} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Estado</label>
                  <select value={formData.status || 'ACTIVE'} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="input w-full">
                    <option value="ACTIVE">Activo</option>
                    <option value="INACTIVE">Inactivo</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancelar</button>
                  <button type="submit" className="btn-primary">{editing ? 'Actualizar' : 'Crear'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramsPage;
