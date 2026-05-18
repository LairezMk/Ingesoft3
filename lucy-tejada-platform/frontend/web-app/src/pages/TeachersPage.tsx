/**
 * ============================================
 * TEACHERS PAGE - Gestión de Docentes
 * ============================================
 */

import React, { useState, useEffect } from "react";
import { storage } from "@/services/mockApi";
import { authService } from "@/services/authService";
import toast from "react-hot-toast";
import { digitsOnly } from "@/utils/inputFormat";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";

interface Teacher {
  id: string;
  firebaseUid?: string;
  documentType: string;
  documentNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialties: string[];
  yearsExperience: number;
  status: string;
  createdAt: string;
}

const TeachersPage: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState<Partial<Teacher>>({});
  const [password, setPassword] = useState("");

  const specialtyOptions = ["Danza", "Música", "Teatro", "Artes Visuales"];

  useEffect(() => {
    loadTeachers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = teachers.filter(
        (teacher) =>
          `${teacher.firstName} ${teacher.lastName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          teacher.documentNumber.includes(searchTerm) ||
          teacher.email.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredTeachers(filtered);
    } else {
      setFilteredTeachers(teachers);
    }
  }, [searchTerm, teachers]);

  const loadTeachers = () => {
    setTeachers(storage.get<Teacher[]>("teachers") || []);
  };

  const handleCreate = () => {
    setEditingTeacher(null);
    setFormData({
      documentType: "CC",
      specialties: [],
      yearsExperience: 0,
      status: "ACTIVE",
    });
    setPassword("");
    setIsModalOpen(true);
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData(teacher);
    setPassword("");
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("¿Estás seguro de eliminar este docente?")) {
      const filtered = teachers.filter((t) => t.id !== id);
      storage.set("teachers", filtered);
      loadTeachers();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingTeacher) {
      const updatedTeachers = teachers.map((t) =>
        t.id === editingTeacher.id ? { ...t, ...formData } : t,
      );
      storage.set("teachers", updatedTeachers);
      setIsModalOpen(false);
      loadTeachers();
      toast.success("Docente actualizado correctamente.");
      return;
    }

    if (!password.trim()) {
      toast.error("La contraseña del docente es obligatoria.");
      return;
    }

    const response = await authService.createTeacherAccount({
      firstName: formData.firstName || "",
      lastName: formData.lastName || "",
      email: formData.email || "",
      password,
      documentType: formData.documentType || "CC",
      documentNumber: formData.documentNumber || "",
      phone: formData.phone || "",
      specialties: formData.specialties || [],
      yearsExperience: formData.yearsExperience || 0,
      status: formData.status || "ACTIVE",
    });

    if (!response.success) {
      toast.error(response.message || "No se pudo crear el docente.");
      return;
    }

    setIsModalOpen(false);
    setPassword("");
    loadTeachers();
    toast.success("Docente creado y registrado en Firebase.");
  };

  const toggleSpecialty = (specialty: string) => {
    const current = formData.specialties || [];
    const updated = current.includes(specialty)
      ? current.filter((s) => s !== specialty)
      : [...current, specialty];
    setFormData({ ...formData, specialties: updated });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-800 dark:text-dark-50">
            Gestión de Docentes
          </h1>
          <p className="text-dark-500 mt-1">
            Administra los docentes del Centro Cultural
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Nuevo Docente
        </button>
      </div>

      <div className="card p-4">
        <div className="relative">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
          <input
            type="text"
            placeholder="Buscar docentes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
              <AcademicCapIcon className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-dark-500">Total Docentes</p>
              <p className="text-2xl font-bold">{teachers.length}</p>
            </div>
          </div>
        </div>
        {specialtyOptions.map((specialty, idx) => (
          <div key={specialty} className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-secondary-100 dark:bg-secondary-900/20 flex items-center justify-center">
                <span className="text-2xl">🎨</span>
              </div>
              <div>
                <p className="text-sm text-dark-500">{specialty}</p>
                <p className="text-2xl font-bold">
                  {
                    teachers.filter((t) => t.specialties?.includes(specialty))
                      .length
                  }
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-dark-200 dark:divide-dark-700">
            <thead className="bg-dark-50 dark:bg-dark-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase">
                  Docente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase">
                  Documento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase">
                  Especialidades
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase">
                  Experiencia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-dark-500 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-900 divide-y divide-dark-200 dark:divide-dark-700">
              {filteredTeachers.map((teacher) => (
                <tr
                  key={teacher.id}
                  className="hover:bg-dark-50 dark:hover:bg-dark-800"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary-400 to-primary-400 flex items-center justify-center text-white font-semibold">
                        {teacher.firstName[0]}
                        {teacher.lastName[0]}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium">
                          {teacher.firstName} {teacher.lastName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">{teacher.documentType}</div>
                    <div className="text-sm text-dark-500">
                      {teacher.documentNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">{teacher.email}</div>
                    <div className="text-sm text-dark-500">{teacher.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {teacher.specialties?.map((s) => (
                        <span
                          key={s}
                          className="px-2 py-1 text-xs bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400 rounded-full"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {teacher.yearsExperience} años
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        teacher.status === "ACTIVE"
                          ? "bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-400"
                          : "bg-error-100 text-error-800 dark:bg-error-900/20 dark:text-error-400"
                      }`}
                    >
                      {teacher.status === "ACTIVE" ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(teacher)}
                      className="text-primary-600 hover:text-primary-900 mr-4"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(teacher.id)}
                      className="text-error-600 hover:text-error-900"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-black opacity-30"
              onClick={() => setIsModalOpen(false)}
            ></div>

            <div className="relative bg-white dark:bg-dark-800 rounded-2xl shadow-xl max-w-2xl w-full p-6">
              <h3 className="text-2xl font-bold mb-6">
                {editingTeacher ? "Editar Docente" : "Nuevo Docente"}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Nombres
                    </label>
                    <input
                      type="text"
                      value={formData.firstName || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      className="input w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Apellidos
                    </label>
                    <input
                      type="text"
                      value={formData.lastName || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      className="input w-full"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Tipo de Documento
                    </label>
                    <select
                      value={formData.documentType || "CC"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          documentType: e.target.value,
                        })
                      }
                      className="input w-full"
                      required
                    >
                      <option value="CC">Cédula de Ciudadanía</option>
                      <option value="CE">Cédula de Extranjería</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Número de Documento
                    </label>
                    <input
                      type="text"
                      value={formData.documentNumber || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          documentNumber: digitsOnly(e.target.value, 20),
                        })
                      }
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className="input w-full"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="input w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={formData.phone || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phone: digitsOnly(e.target.value, 15),
                        })
                      }
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className="input w-full"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Especialidades
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {specialtyOptions.map((specialty) => (
                      <button
                        key={specialty}
                        type="button"
                        onClick={() => toggleSpecialty(specialty)}
                        className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                          formData.specialties?.includes(specialty)
                            ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                            : "border-dark-200 dark:border-dark-600 hover:border-primary-300"
                        }`}
                      >
                        {specialty}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Años de Experiencia
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.yearsExperience || 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          yearsExperience: parseInt(e.target.value),
                        })
                      }
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className="input w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Estado
                    </label>
                    <select
                      value={formData.status || "ACTIVE"}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="input w-full"
                    >
                      <option value="ACTIVE">Activo</option>
                      <option value="INACTIVE">Inactivo</option>
                    </select>
                  </div>
                </div>

                {!editingTeacher && (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Contraseña
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input w-full"
                      required
                      minLength={8}
                    />
                  </div>
                )}

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingTeacher ? "Actualizar" : "Crear"}
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

export default TeachersPage;
