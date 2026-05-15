/**
 * ENROLLMENTS PAGE - Gestión de Matrículas
 */
import React, { useState, useEffect } from "react";
import { storage } from "@/services/mockApi";
import { useAuthStore } from "@/store/authStore";
import { normalizeRole } from "@/utils/rbac";
import {
  PlusIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

interface Enrollment {
  id: string;
  studentId: string;
  studentName: string;
  groupId: string;
  groupName: string;
  programName: string;
  enrollmentDate: string;
  status: string;
  requestedByEmail?: string;
}

const EnrollmentsPage: React.FC = () => {
  const { user } = useAuthStore();
  const role = normalizeRole(user?.role);
  const canManageEnrollments = role === "ADMIN" || role === "DOCENTE";
  const isStudent = role === "ESTUDIANTE";
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Enrollment>>({});

  useEffect(() => {
    loadEnrollments();
  }, []);

  const loadEnrollments = () => {
    let data = storage.get<Enrollment[]>("enrollments") || [];
    if (data.length === 0) {
      data = [
        {
          id: "1",
          studentId: "1",
          studentName: "Ana Martínez",
          groupId: "1",
          groupName: "Grupo A",
          programName: "Ballet Clásico",
          enrollmentDate: "2024-01-15",
          status: "ACTIVE",
        },
        {
          id: "2",
          studentId: "2",
          studentName: "Carlos Rojas",
          groupId: "2",
          groupName: "Grupo B",
          programName: "Guitarra",
          enrollmentDate: "2024-01-20",
          status: "ACTIVE",
        },
        {
          id: "3",
          studentId: "3",
          studentName: "Laura Gómez",
          groupId: "3",
          groupName: "Grupo C",
          programName: "Teatro",
          enrollmentDate: "2024-02-01",
          status: "PENDING",
        },
      ];
      storage.set("enrollments", data);
    }
    setEnrollments(data);
  };

  const studentFullName =
    user?.profile?.firstName && user?.profile?.lastName
      ? `${user.profile.firstName} ${user.profile.lastName}`.toLowerCase()
      : "";

  const teacherProgramNames =
    role === "DOCENTE"
      ? (storage.get<Array<{ name: string; teacherId?: string }>>("programs") || [])
          .filter((program) => program.teacherId === user?.id)
          .map((program) => program.name)
      : [];

  const visibleEnrollments = isStudent
    ? enrollments.filter(
        (item) =>
          item.requestedByEmail === user?.email ||
          (studentFullName && item.studentName.toLowerCase() === studentFullName),
      )
    : role === "DOCENTE"
      ? enrollments.filter((item) => teacherProgramNames.includes(item.programName))
      : enrollments;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEnrollment = {
      ...formData,
      id: String(enrollments.length + 1),
      enrollmentDate: new Date().toISOString().split("T")[0],
      status: "ACTIVE",
    } as Enrollment;
    storage.set("enrollments", [...enrollments, newEnrollment]);
    setIsModalOpen(false);
    loadEnrollments();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Matrículas</h1>
          <p className="text-dark-500 mt-1">
            {isStudent ? "Consulta de tus inscripciones" : "Gestión de inscripciones"}
          </p>
        </div>
        {canManageEnrollments && (
          <button
            onClick={() => {
              setFormData({});
              setIsModalOpen(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Nueva Matrícula
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <p className="text-sm text-dark-500">Total Matrículas</p>
          <p className="text-2xl font-bold">{visibleEnrollments.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-dark-500">Activas</p>
            <p className="text-2xl font-bold text-success-600">
              {visibleEnrollments.filter((e) => e.status === "ACTIVE").length}
            </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-dark-500">Pendientes</p>
            <p className="text-2xl font-bold text-warning-600">
              {visibleEnrollments.filter((e) => e.status === "PENDING").length}
            </p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-dark-50 dark:bg-dark-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase">
                Estudiante
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase">
                Programa
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase">
                Grupo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-dark-500 uppercase">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-200 dark:divide-dark-700">
            {visibleEnrollments.map((enrollment) => (
              <tr
                key={enrollment.id}
                className="hover:bg-dark-50 dark:hover:bg-dark-800"
              >
                <td className="px-6 py-4">{enrollment.studentName}</td>
                <td className="px-6 py-4">{enrollment.programName}</td>
                <td className="px-6 py-4">{enrollment.groupName}</td>
                <td className="px-6 py-4">
                  {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      enrollment.status === "ACTIVE"
                        ? "bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-400"
                        : enrollment.status === "PENDING"
                          ? "bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-400"
                          : "bg-error-100 text-error-800 dark:bg-error-900/20 dark:text-error-400"
                    }`}
                  >
                    {enrollment.status === "ACTIVE"
                      ? "Activa"
                      : enrollment.status === "PENDING"
                        ? "Pendiente"
                        : "Cancelada"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {canManageEnrollments && enrollment.status === "PENDING" && (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          const updated = enrollments.map((e) =>
                            e.id === enrollment.id
                              ? { ...e, status: "ACTIVE" }
                              : e,
                          );
                          storage.set("enrollments", updated);
                          loadEnrollments();
                        }}
                        className="text-success-600 hover:text-success-900"
                      >
                        <CheckCircleIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          const updated = enrollments.map((e) =>
                            e.id === enrollment.id
                              ? { ...e, status: "CANCELLED" }
                              : e,
                          );
                          storage.set("enrollments", updated);
                          loadEnrollments();
                        }}
                        className="text-error-600 hover:text-error-900"
                      >
                        <XCircleIcon className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isStudent && visibleEnrollments.length === 0 && (
        <div className="card p-6 text-dark-500">
          Aún no tienes matrículas registradas. Puedes solicitar una desde Programas.
        </div>
      )}

      {canManageEnrollments && isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-black opacity-30"
              onClick={() => setIsModalOpen(false)}
            ></div>
            <div className="relative bg-white dark:bg-dark-800 rounded-2xl shadow-xl max-w-lg w-full p-6">
              <h3 className="text-2xl font-bold mb-6">Nueva Matrícula</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Estudiante
                  </label>
                  <input
                    type="text"
                    value={formData.studentName || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, studentName: e.target.value })
                    }
                    className="input w-full"
                    required
                    placeholder="Nombre del estudiante"
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
                    Grupo
                  </label>
                  <input
                    type="text"
                    value={formData.groupName || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, groupName: e.target.value })
                    }
                    className="input w-full"
                    required
                    placeholder="Ej: Grupo A"
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
                    Matricular
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

export default EnrollmentsPage;
