/**
 * ============================================
 * STUDENTS PAGE - Gestión de Estudiantes
 * ============================================
 */

import React, { useState, useEffect } from "react";
import { storage } from "@/services/mockApi";
import {
  digitsOnly,
  formatDateInput,
  toDisplayDateFromIso,
  toIsoDateFromDisplay,
} from "@/utils/inputFormat";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

interface Student {
  id: string;
  documentType: string;
  documentNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: string;
  city: string;
  address: string;
  enrollmentStatus: string;
  createdAt: string;
}

const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState<Partial<Student>>({});
  const [loading, setLoading] = useState(false);

  // Cargar estudiantes
  useEffect(() => {
    loadStudents();
  }, []);

  // Filtrar estudiantes
  useEffect(() => {
    if (searchTerm) {
      const filtered = students.filter(
        (student) =>
          `${student.firstName} ${student.lastName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          student.documentNumber.includes(searchTerm) ||
          student.email.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students);
    }
  }, [searchTerm, students]);

  const loadStudents = () => {
    setLoading(true);
    try {
      setStudents(storage.get<Student[]>("students") || []);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingStudent(null);
    setFormData({
      documentType: "CC",
      gender: "MALE",
      enrollmentStatus: "ACTIVE",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      ...student,
      birthDate: toDisplayDateFromIso(student.birthDate),
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("¿Estás seguro de eliminar este estudiante?")) {
      const updated = students.filter((student) => student.id !== id);
      storage.set("students", updated);
      loadStudents();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const normalizedBirthDate = toIsoDateFromDisplay(String(formData.birthDate || ""));
      if (!normalizedBirthDate) {
        alert("Fecha inválida. Usa el formato DD/MM/AA.");
        return;
      }

      if (editingStudent) {
        const updated = students.map((student) =>
          student.id === editingStudent.id
            ? { ...student, ...formData, birthDate: normalizedBirthDate }
            : student,
        );
        storage.set("students", updated);
      } else {
        const newStudent = {
          ...formData,
          id: String(Date.now()),
          birthDate: normalizedBirthDate,
          createdAt: new Date().toISOString(),
          enrollmentStatus: formData.enrollmentStatus || "ACTIVE",
        } as Student;
        storage.set("students", [newStudent, ...students]);
      }

      setIsModalOpen(false);
      loadStudents();
    } finally {
      setLoading(false);
    }
  };

  const newThisMonth = students.filter((student) => {
    if (!student.createdAt) return false;
    const created = new Date(student.createdAt);
    const now = new Date();
    return created.getFullYear() === now.getFullYear() && created.getMonth() === now.getMonth();
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-800 dark:text-dark-50">
            Gestión de Estudiantes
          </h1>
          <p className="text-dark-500 mt-1">
            Administra los estudiantes del Centro Cultural
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Nuevo Estudiante
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, documento o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
          <button className="btn-secondary flex items-center gap-2">
            <FunnelIcon className="w-5 h-5" />
            Filtros
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
              <UserGroupIcon className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-dark-500">Total Estudiantes</p>
              <p className="text-2xl font-bold">{students.length}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-success-100 dark:bg-success-900/20 flex items-center justify-center">
              <span className="text-2xl">✓</span>
            </div>
            <div>
              <p className="text-sm text-dark-500">Activos</p>
              <p className="text-2xl font-bold text-success-600">
                {students.filter((s) => s.enrollmentStatus === "ACTIVE").length}
              </p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-warning-100 dark:bg-warning-900/20 flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
            <div>
              <p className="text-sm text-dark-500">Nuevos (mes)</p>
              <p className="text-2xl font-bold text-warning-600">{newThisMonth}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-error-100 dark:bg-error-900/20 flex items-center justify-center">
              <span className="text-2xl">⏸</span>
            </div>
            <div>
              <p className="text-sm text-dark-500">Inactivos</p>
              <p className="text-2xl font-bold text-error-600">
                {students.filter((s) => s.enrollmentStatus !== "ACTIVE").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-dark-200 dark:divide-dark-700">
            <thead className="bg-dark-50 dark:bg-dark-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                  Estudiante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                  Documento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                  Ciudad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-dark-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-900 divide-y divide-dark-200 dark:divide-dark-700">
              {filteredStudents.map((student) => (
                <tr
                  key={student.id}
                  className="hover:bg-dark-50 dark:hover:bg-dark-800"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-semibold">
                        {student.firstName[0]}
                        {student.lastName[0]}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-dark-900 dark:text-dark-100">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="text-sm text-dark-500">
                          {student.gender === "MALE" ? "Masculino" : "Femenino"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-dark-900 dark:text-dark-100">
                      {student.documentType}
                    </div>
                    <div className="text-sm text-dark-500">
                      {student.documentNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-dark-900 dark:text-dark-100">
                      {student.email}
                    </div>
                    <div className="text-sm text-dark-500">{student.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-900 dark:text-dark-100">
                    {student.city}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        student.enrollmentStatus === "ACTIVE"
                          ? "bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-400"
                          : "bg-error-100 text-error-800 dark:bg-error-900/20 dark:text-error-400"
                      }`}
                    >
                      {student.enrollmentStatus === "ACTIVE"
                        ? "Activo"
                        : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(student)}
                      className="text-primary-600 hover:text-primary-900 dark:hover:text-primary-400 mr-4"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(student.id)}
                      className="text-error-600 hover:text-error-900 dark:hover:text-error-400"
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-black opacity-30"
              onClick={() => setIsModalOpen(false)}
            ></div>

            <div className="relative bg-white dark:bg-dark-800 rounded-2xl shadow-xl max-w-2xl w-full p-6">
              <h3 className="text-2xl font-bold mb-6">
                {editingStudent ? "Editar Estudiante" : "Nuevo Estudiante"}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
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
                      <option value="TI">Tarjeta de Identidad</option>
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Fecha de Nacimiento
                    </label>
                    <input
                      type="text"
                      value={formData.birthDate || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          birthDate: formatDateInput(e.target.value),
                        })
                      }
                      inputMode="numeric"
                      pattern="\d{2}/\d{2}/\d{2}"
                      placeholder="DD/MM/AA"
                      className="input w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Género
                    </label>
                    <select
                      value={formData.gender || "MALE"}
                      onChange={(e) =>
                        setFormData({ ...formData, gender: e.target.value })
                      }
                      className="input w-full"
                      required
                    >
                      <option value="MALE">Masculino</option>
                      <option value="FEMALE">Femenino</option>
                      <option value="OTHER">Otro</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Ciudad
                    </label>
                    <input
                      type="text"
                      value={formData.city || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      className="input w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Estado
                    </label>
                    <select
                      value={formData.enrollmentStatus || "ACTIVE"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          enrollmentStatus: e.target.value,
                        })
                      }
                      className="input w-full"
                    >
                      <option value="ACTIVE">Activo</option>
                      <option value="INACTIVE">Inactivo</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={formData.address || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="input w-full"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="btn-secondary"
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                  >
                    {loading
                      ? "Guardando..."
                      : editingStudent
                        ? "Actualizar"
                        : "Crear"}
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

export default StudentsPage;
