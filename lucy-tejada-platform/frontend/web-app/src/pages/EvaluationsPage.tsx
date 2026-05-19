/**
 * EVALUATIONS PAGE - Evaluaciones Cualitativas
 */
import React, { useEffect, useMemo, useState } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/authStore';
import { normalizeRole } from '@/utils/rbac';
import { storage } from '@/services/mockApi';
import toast from "react-hot-toast";
import { publishNotification } from "@/services/notificationService";

const EvaluationsPage: React.FC = () => {
  const { user } = useAuthStore();
  const role = normalizeRole(user?.role);
  const canEditEvaluations = role === 'ADMIN' || role === 'DOCENTE';
  const [selectedStudent, setSelectedStudent] = useState('');
  const [ratings, setRatings] = useState({
    creativity: 0,
    technique: 0,
    participation: 0,
    progress: 0,
  });
  const [comments, setComments] = useState('');

  interface Evaluation {
    id: string;
    studentName: string;
    date: string;
    creativity: number;
    technique: number;
    participation: number;
    progress: number;
    average: number;
    comments?: string;
  }

  const [evaluations, setEvaluations] = useState<Evaluation[]>(() =>
    storage.get<Evaluation[]>('evaluations') || []
  );

  const students = useMemo(() => {
    const data = storage.get<Array<{ firstName?: string; lastName?: string }>>('students') || [];
    return data
      .map((student) => `${student.firstName ?? ''} ${student.lastName ?? ''}`.trim())
      .filter(Boolean);
  }, []);

  useEffect(() => {
    setEvaluations(storage.get<Evaluation[]>('evaluations') || []);
  }, []);

  const criteria = [
    { key: 'creativity', label: 'Creatividad' },
    { key: 'technique', label: 'Técnica' },
    { key: 'participation', label: 'Participación' },
    { key: 'progress', label: 'Progreso' },
  ];

  const setRating = (criterion: string, value: number) => {
    setRatings({ ...ratings, [criterion]: value });
  };

  const saveEvaluation = () => {
    const average =
      (ratings.creativity + ratings.technique + ratings.participation + ratings.progress) / 4;
    const newEvaluation: Evaluation = {
      id: String(Date.now()),
      studentName: selectedStudent,
      date: new Date().toISOString().split('T')[0],
      creativity: ratings.creativity,
      technique: ratings.technique,
      participation: ratings.participation,
      progress: ratings.progress,
      average: Number(average.toFixed(2)),
      comments: comments.trim() || undefined,
    };

    const updated = [newEvaluation, ...evaluations];
    storage.set('evaluations', updated);
    setEvaluations(updated);

    toast.success('Evaluación guardada exitosamente');

    const studentsData = storage.get<Array<{ firstName: string; lastName: string; email: string }>>("students") || [];
    const match = studentsData.find((s) => `${s.firstName} ${s.lastName}`.trim() === selectedStudent);
    publishNotification({
      kind: "success",
      title: "Nueva calificación registrada",
      message: `Se registró una evaluación para ${selectedStudent} (promedio ${newEvaluation.average}).`,
      link: "/evaluations",
      audience: match?.email ? { emails: [match.email] } : { roles: ["ESTUDIANTE"] },
    });
    setSelectedStudent('');
    setRatings({ creativity: 0, technique: 0, participation: 0, progress: 0 });
    setComments('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Evaluaciones Cualitativas</h1>
        <p className="text-dark-500 mt-1">Evaluación del desempeño artístico</p>
      </div>

      <div className="card p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Estudiante</label>
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="input w-full"
          >
            <option value="">Seleccionar estudiante...</option>
            {students.map((student) => (
              <option key={student} value={student}>{student}</option>
            ))}
          </select>
          {!canEditEvaluations && (
            <p className="text-xs text-dark-500 mt-2">
              Vista de solo lectura para estudiantes.
            </p>
          )}
        </div>

        {selectedStudent && (
          <>
            <div className="space-y-6 mb-6">
              {criteria.map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-2">{label}</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={() => canEditEvaluations && setRating(key, star)}
                        disabled={!canEditEvaluations}
                        className="transition-transform hover:scale-110"
                      >
                        {star <= ratings[key as keyof typeof ratings] ? (
                          <StarIcon className="w-8 h-8 text-yellow-400" />
                        ) : (
                          <StarOutline className="w-8 h-8 text-dark-300" />
                        )}
                      </button>
                    ))}
                    <span className="ml-4 text-lg font-semibold">{ratings[key as keyof typeof ratings]}/5</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Observaciones</label>
              <textarea
                value={comments}
                onChange={(e) => canEditEvaluations && setComments(e.target.value)}
                className="input w-full"
                rows={4}
                placeholder="Comentarios sobre el desempeño del estudiante..."
                disabled={!canEditEvaluations}
              />
            </div>

            {canEditEvaluations && (
              <div className="flex justify-end">
                <button onClick={saveEvaluation} className="btn-primary">Guardar Evaluación</button>
              </div>
            )}
          </>
        )}

        {!selectedStudent && students.length === 0 && (
          <div className="text-center py-12 text-dark-500">
            No hay estudiantes registrados para evaluar.
          </div>
        )}

        {!selectedStudent && students.length > 0 && (
          <div className="text-center py-12 text-dark-500">
            Selecciona un estudiante para comenzar la evaluación
          </div>
        )}
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-bold mb-4">Evaluaciones Recientes</h3>
        {evaluations.length === 0 ? (
          <div className="text-center py-8 text-dark-500">Sin evaluaciones registradas.</div>
        ) : (
          <div className="space-y-3">
            {evaluations.slice(0, 3).map((evaluation) => (
              <div key={evaluation.id} className="flex items-center justify-between p-4 rounded-lg border border-dark-200 dark:border-dark-700">
                <div>
                  <p className="font-medium">{evaluation.studentName}</p>
                  <p className="text-sm text-dark-500">{new Date(evaluation.date).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StarIcon className="w-5 h-5 text-yellow-400" />
                  <span className="text-lg font-bold">{evaluation.average}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EvaluationsPage;
