/**
 * GROUPS PAGE - Grupos y Horarios
 */
import React, { useState, useEffect } from "react";
import { storage } from "@/services/mockApi";
import { publishNotification } from "@/services/notificationService";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

interface Group {
  id: string;
  name: string;
  programId: string;
  programName: string;
  teacherId: string;
  teacherName: string;
  schedule: string;
  capacity: number;
  enrolled: number;
  status: string;
}

const GroupsPage: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Group | null>(null);
  const [formData, setFormData] = useState<Partial<Group>>({});

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = () => {
    setGroups(storage.get<Group[]>("groups") || []);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let updated;
    if (editing) {
      updated = groups.map((g) =>
        g.id === editing.id ? { ...g, ...formData } : g,
      );
    } else {
      updated = [
        ...groups,
        { ...formData, id: String(groups.length + 1), enrolled: 0 } as Group,
      ];
    }
    storage.set("groups", updated);
    setIsModalOpen(false);
    loadGroups();

    if (!editing && formData.teacherName) {
      const teachers = storage.get<Array<{ firstName: string; lastName: string; email: string }>>("teachers") || [];
      const teacher = teachers.find((t) => `${t.firstName} ${t.lastName}`.trim() === String(formData.teacherName).trim());
      if (teacher?.email) {
        publishNotification({
          kind: "info",
          title: "Nuevo grupo asignado",
          message: `Fuiste asignado al grupo ${String(formData.name || "(sin nombre)")}.`,
          link: "/groups",
          audience: { emails: [teacher.email] },
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Grupos y Clases</h1>
          <p className="text-dark-500 mt-1">
            Organización de grupos y horarios
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setFormData({ status: "ACTIVE", capacity: 20, enrolled: 0 });
            setIsModalOpen(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Nuevo Grupo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <UserGroupIcon className="w-8 h-8 text-primary-600" />
            <div>
              <p className="text-sm text-dark-500">Total Grupos</p>
              <p className="text-2xl font-bold">{groups.length}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <ClockIcon className="w-8 h-8 text-success-600" />
            <div>
              <p className="text-sm text-dark-500">Grupos Activos</p>
              <p className="text-2xl font-bold">
                {groups.filter((g) => g.status === "ACTIVE").length}
              </p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">👥</span>
            <div>
              <p className="text-sm text-dark-500">Estudiantes Inscritos</p>
              <p className="text-2xl font-bold">
                {groups.reduce((sum, g) => sum + g.enrolled, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((group) => (
          <div key={group.id} className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold mb-1">{group.name}</h3>
                <p className="text-sm text-dark-500">{group.programName}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditing(group);
                    setFormData(group);
                    setIsModalOpen(true);
                  }}
                  className="text-primary-600"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    if (confirm("¿Eliminar?")) {
                      storage.set(
                        "groups",
                        groups.filter((g) => g.id !== group.id),
                      );
                      loadGroups();
                    }
                  }}
                  className="text-error-600"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <UserGroupIcon className="w-4 h-4 text-dark-400" />
                <span>Docente: {group.teacherName}</span>
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon className="w-4 h-4 text-dark-400" />
                <span>{group.schedule}</span>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                  <span>Cupos</span>
                  <span>
                    {group.enrolled}/{group.capacity}
                  </span>
                </div>
                <div className="w-full bg-dark-200 dark:bg-dark-700 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full"
                    style={{
                      width: `${(group.enrolled / group.capacity) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-black opacity-30"
              onClick={() => setIsModalOpen(false)}
            ></div>
            <div className="relative bg-white dark:bg-dark-800 rounded-2xl shadow-xl max-w-lg w-full p-6">
              <h3 className="text-2xl font-bold mb-6">
                {editing ? "Editar Grupo" : "Nuevo Grupo"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nombre del Grupo
                  </label>
                  <input
                    type="text"
                    value={formData.name || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Programa
                  </label>
                  <input
                    type="text"
                    value={formData.programName || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, programName: e.target.value })
                    }
                    className="input w-full"
                    required
                    placeholder="Ej: Ballet Clásico"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Docente
                  </label>
                  <input
                    type="text"
                    value={formData.teacherName || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, teacherName: e.target.value })
                    }
                    className="input w-full"
                    required
                    placeholder="Ej: María García"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Horario
                  </label>
                  <input
                    type="text"
                    value={formData.schedule || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, schedule: e.target.value })
                    }
                    className="input w-full"
                    required
                    placeholder="Ej: Lun-Mié 3:00-5:00 PM"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Capacidad
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.capacity || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        capacity: parseInt(e.target.value),
                      })
                    }
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="input w-full"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary">
                    {editing ? "Actualizar" : "Crear"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupsPage;
