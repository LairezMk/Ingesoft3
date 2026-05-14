/**
 * PROGRAMS PAGE - Programas Formativos
 */
import React, { useState, useEffect } from "react";
import { storage } from "@/services/mockApi";
import { useAuthStore } from "@/store/authStore";
import { normalizeRole } from "@/utils/rbac";
import toast from "react-hot-toast";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

interface Program {
  id: string;
  name: string;
  area: string;
  level: string;
  duration: number;
  description: string;
  status: string;
  maxStudents: number;
  teacherId?: string;
  teacherName?: string;
  createdAt: string;
}

interface TeacherOption {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

const ProgramsPage: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Program | null>(null);
  const [formData, setFormData] = useState<Partial<Program>>({});
  const [teacherOptions, setTeacherOptions] = useState<TeacherOption[]>([]);
  const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [registrationForm, setRegistrationForm] = useState({
    firstName: "",
    lastName: "",
    documentNumber: "",
    email: "",
    phone: "",
  });
  const { user } = useAuthStore();
  const role = normalizeRole(user?.role);
  const canManagePrograms = role === "ADMIN" || role === "DOCENTE";
  const canRequestEnrollment = role === "ESTUDIANTE" || role === "VISITANTE";

  const areas = ["Danza", "Música", "Teatro", "Artes Visuales"];
  const levels = ["Básico", "Intermedio", "Avanzado"];

  useEffect(() => {
    loadPrograms();
    const teachers = storage.get<TeacherOption[]>("teachers") || [];
    setTeacherOptions(teachers);
  }, []);

  const loadPrograms = () => {
    let data = storage.get<Program[]>("programs") || [];
    if (data.length === 0) {
      data = [
        {
          id: "1",
          name: "Ballet Clásico",
          area: "Danza",
          level: "Básico",
          duration: 12,
          description: "Introducción al ballet",
          status: "ACTIVE",
          maxStudents: 20,
          teacherId: "1",
          teacherName: "Docente 1",
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          name: "Guitarra Eléctrica",
          area: "Música",
          level: "Intermedio",
          duration: 16,
          description: "Técnicas modernas de guitarra",
          status: "ACTIVE",
          maxStudents: 15,
          teacherId: "2",
          teacherName: "Docente 2",
          createdAt: new Date().toISOString(),
        },
        {
          id: "3",
          name: "Teatro Experimental",
          area: "Teatro",
          level: "Avanzado",
          duration: 20,
          description: "Técnicas avanzadas de actuación",
          status: "ACTIVE",
          maxStudents: 25,
          teacherId: "3",
          teacherName: "Docente 3",
          createdAt: new Date().toISOString(),
        },
        {
          id: "4",
          name: "Pintura al Óleo",
          area: "Artes Visuales",
          level: "Básico",
          duration: 14,
          description: "Fundamentos de pintura",
          status: "ACTIVE",
          maxStudents: 12,
          teacherId: "4",
          teacherName: "Docente 4",
          createdAt: new Date().toISOString(),
        },
      ];
      storage.set("programs", data);
    }
    setPrograms(data);
  };

  const filtered = programs.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.area.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const teacherNameForDocente =
      user?.profile?.firstName && user?.profile?.lastName
        ? `${user.profile.firstName} ${user.profile.lastName}`
        : user?.email || "Docente";
    const normalizedFormData =
      role === "DOCENTE"
        ? {
            ...formData,
            teacherId: user?.id || "DOCENTE",
            teacherName: teacherNameForDocente,
          }
        : formData;
    let updated;
    if (editing) {
      updated = programs.map((p) =>
        p.id === editing.id ? { ...p, ...normalizedFormData } : p,
      );
    } else {
      updated = [
        ...programs,
        {
          ...normalizedFormData,
          id: String(programs.length + 1),
          createdAt: new Date().toISOString(),
        } as Program,
      ];
    }
    storage.set("programs", updated);
    setIsModalOpen(false);
    loadPrograms();
  };

  const createEnrollmentRequest = (studentName: string, program: Program, requestedByEmail?: string) => {
    const enrollments = storage.get<any[]>("enrollments") || [];
    const newEnrollment = {
      id: String(Date.now()),
      studentId: requestedByEmail || String(Date.now()),
      studentName,
      groupId: "",
      groupName: "Pendiente de asignación",
      programName: program.name,
      enrollmentDate: new Date().toISOString().split("T")[0],
      status: "PENDING",
      requestedByEmail: requestedByEmail || "",
    };
    storage.set("enrollments", [newEnrollment, ...enrollments]);
  };

  const handleStudentEnrollmentRequest = (program: Program) => {
    if (!user) return;
    const studentName =
      user.profile?.firstName && user.profile?.lastName
        ? `${user.profile.firstName} ${user.profile.lastName}`
        : user.email;
    createEnrollmentRequest(studentName, program, user.email);
    toast.success("Solicitud de matrícula enviada.");
  };

  const handleOpenVisitorEnrollment = (program: Program) => {
    setSelectedProgram(program);
    setRegistrationForm({
      firstName: "",
      lastName: "",
      documentNumber: "",
      email: "",
      phone: "",
    });
    setIsEnrollmentModalOpen(true);
  };

  const handleVisitorEnrollmentRequest = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedProgram) return;
    if (!registrationForm.firstName.trim() || !registrationForm.lastName.trim() || !registrationForm.email.trim()) {
      toast.error("Completa los datos básicos para registrarte como estudiante.");
      return;
    }

    const students = storage.get<any[]>("students") || [];
    const newStudent = {
      id: String(Date.now()),
      documentType: "CC",
      documentNumber: registrationForm.documentNumber.trim() || String(Date.now()).slice(-8),
      firstName: registrationForm.firstName.trim(),
      lastName: registrationForm.lastName.trim(),
      email: registrationForm.email.trim(),
      phone: registrationForm.phone.trim(),
      birthDate: "2005-01-01",
      gender: "MALE",
      city: "Pereira",
      address: "Sin dirección registrada",
      enrollmentStatus: "ACTIVE",
      createdAt: new Date().toISOString(),
    };
    storage.set("students", [newStudent, ...students]);
    createEnrollmentRequest(
      `${newStudent.firstName} ${newStudent.lastName}`,
      selectedProgram,
      newStudent.email,
    );
    setIsEnrollmentModalOpen(false);
    toast.success("Registro básico completado. Tu solicitud de matrícula quedó pendiente.");
  };

  const handleDelete = (id: string) => {
    if (window.confirm("¿Eliminar programa?")) {
      storage.set(
        "programs",
        programs.filter((p) => p.id !== id),
      );
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
        {canManagePrograms && (
          <button
            onClick={() => {
              setEditing(null);
              setFormData({
                status: "ACTIVE",
                level: "Básico",
                duration: 12,
                maxStudents: 20,
                teacherId: teacherOptions[0]?.id || "",
                teacherName: teacherOptions[0]
                  ? `${teacherOptions[0].firstName} ${teacherOptions[0].lastName}`
                  : "",
              });
              setIsModalOpen(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Nuevo Programa
          </button>
        )}
      </div>

      <div className="card p-4">
        <div className="relative">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
          <input
            type="text"
            placeholder="Buscar programas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {areas.map((area) => (
          <div key={area} className="card p-4">
            <h3 className="text-sm text-dark-500">{area}</h3>
            <p className="text-2xl font-bold">
              {programs.filter((p) => p.area === area).length}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((program) => (
          <div
            key={program.id}
            className="card p-6 hover:shadow-lg transition-shadow"
          >
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
              {canManagePrograms && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditing(program);
                      setFormData(program);
                      setIsModalOpen(true);
                    }}
                    className="text-primary-600 hover:text-primary-900"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(program.id)}
                    className="text-error-600 hover:text-error-900"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-sm text-dark-600 dark:text-dark-300 mb-4">
              {program.description}
            </p>
            <p className="text-sm text-dark-500 mb-3">
              Docente asignado: {program.teacherName || "Pendiente"}
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-dark-500">Duración</p>
                <p className="font-semibold">{program.duration} meses</p>
              </div>
              <div>
                <p className="text-dark-500">Cupos</p>
                <p className="font-semibold">
                  {program.maxStudents} estudiantes
                </p>
              </div>
            </div>
            {!canManagePrograms && canRequestEnrollment && (
              <div className="mt-4">
                {role === "ESTUDIANTE" ? (
                  <button
                    className="btn-primary w-full"
                    onClick={() => handleStudentEnrollmentRequest(program)}
                  >
                    Inscribirme en este curso
                  </button>
                ) : (
                  <button
                    className="btn-primary w-full"
                    onClick={() => handleOpenVisitorEnrollment(program)}
                  >
                    Solicitar matrícula
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {canManagePrograms && isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-black opacity-30"
              onClick={() => setIsModalOpen(false)}
            ></div>
            <div className="relative bg-white dark:bg-dark-800 rounded-2xl shadow-xl max-w-2xl w-full p-6">
              <h3 className="text-2xl font-bold mb-6">
                {editing ? "Editar Programa" : "Nuevo Programa"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nombre del Programa
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Área Artística
                    </label>
                    <select
                      value={formData.area || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, area: e.target.value })
                      }
                      className="input w-full"
                      required
                    >
                      <option value="">Seleccionar...</option>
                      {areas.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Nivel
                    </label>
                    <select
                      value={formData.level || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, level: e.target.value })
                      }
                      className="input w-full"
                      required
                    >
                      {levels.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Duración (meses)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.duration || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          duration: parseInt(e.target.value),
                        })
                      }
                      className="input w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Cupos Máximos
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.maxStudents || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxStudents: parseInt(e.target.value),
                        })
                      }
                      className="input w-full"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="input w-full"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Docente asignado
                  </label>
                  {role === "ADMIN" ? (
                    <select
                      value={formData.teacherId || ""}
                      onChange={(e) => {
                        const teacher = teacherOptions.find((t) => t.id === e.target.value);
                        setFormData({
                          ...formData,
                          teacherId: e.target.value,
                          teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : "",
                        });
                      }}
                      className="input w-full"
                    >
                      <option value="">Seleccionar docente...</option>
                      {teacherOptions.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.firstName} {teacher.lastName}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      className="input w-full"
                      value={
                        user?.profile?.firstName && user?.profile?.lastName
                          ? `${user.profile.firstName} ${user.profile.lastName}`
                          : user?.email || "Docente"
                      }
                      disabled
                    />
                  )}
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
      {isEnrollmentModalOpen && selectedProgram && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-30" onClick={() => setIsEnrollmentModalOpen(false)} />
            <div className="relative bg-white dark:bg-dark-800 rounded-2xl shadow-xl max-w-xl w-full p-6">
              <h3 className="text-2xl font-bold mb-2">Registro básico como estudiante</h3>
              <p className="text-sm text-dark-500 mb-4">
                Curso solicitado: {selectedProgram.name}
              </p>
              <form onSubmit={handleVisitorEnrollmentRequest} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    className="input w-full"
                    placeholder="Nombre"
                    value={registrationForm.firstName}
                    onChange={(event) =>
                      setRegistrationForm((previous) => ({ ...previous, firstName: event.target.value }))
                    }
                    required
                  />
                  <input
                    className="input w-full"
                    placeholder="Apellido"
                    value={registrationForm.lastName}
                    onChange={(event) =>
                      setRegistrationForm((previous) => ({ ...previous, lastName: event.target.value }))
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    className="input w-full"
                    placeholder="Documento"
                    value={registrationForm.documentNumber}
                    onChange={(event) =>
                      setRegistrationForm((previous) => ({ ...previous, documentNumber: event.target.value }))
                    }
                  />
                  <input
                    type="tel"
                    className="input w-full"
                    placeholder="Teléfono"
                    value={registrationForm.phone}
                    onChange={(event) =>
                      setRegistrationForm((previous) => ({ ...previous, phone: event.target.value }))
                    }
                  />
                </div>
                <input
                  type="email"
                  className="input w-full"
                  placeholder="Correo electrónico"
                  value={registrationForm.email}
                  onChange={(event) =>
                    setRegistrationForm((previous) => ({ ...previous, email: event.target.value }))
                  }
                  required
                />
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setIsEnrollmentModalOpen(false)} className="btn-secondary">
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary">
                    Solicitar matrícula
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

export default ProgramsPage;
