/**
 * EVALUATIONS PAGE - Evaluaciones Cualitativas
 */
import React, { useState } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';

const EvaluationsPage: React.FC = () => {
  const [selectedStudent, setSelectedStudent] = useState('');
  const [ratings, setRatings] = useState({
    creativity: 0,
    technique: 0,
    participation: 0,
    progress: 0,
  });
  const [comments, setComments] = useState('');

  const students = [
    'Ana Martínez',
    'Carlos Rojas',
    'Laura Gómez',
    'Pedro Sánchez',
    'María López',
  ];

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
    alert('Evaluación guardada exitosamente');
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
          <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} className="input w-full">
            <option value="">Seleccionar estudiante...</option>
            {students.map(student => (
              <option key={student} value={student}>{student}</option>
            ))}
          </select>
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
                        onClick={() => setRating(key, star)}
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
                onChange={(e) => setComments(e.target.value)}
                className="input w-full"
                rows={4}
                placeholder="Comentarios sobre el desempeño del estudiante..."
              />
            </div>

            <div className="flex justify-end">
              <button onClick={saveEvaluation} className="btn-primary">Guardar Evaluación</button>
            </div>
          </>
        )}

        {!selectedStudent && (
          <div className="text-center py-12 text-dark-500">
            Selecciona un estudiante para comenzar la evaluación
          </div>
        )}
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-bold mb-4">Evaluaciones Recientes</h3>
        <div className="space-y-3">
          {[
            { student: 'Ana Martínez', date: '2024-03-25', avg: 4.5 },
            { student: 'Carlos Rojas', date: '2024-03-24', avg: 4.0 },
            { student: 'Laura Gómez', date: '2024-03-23', avg: 4.8 },
          ].map((evaluation, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 rounded-lg border border-dark-200 dark:border-dark-700">
              <div>
                <p className="font-medium">{evaluation.student}</p>
                <p className="text-sm text-dark-500">{new Date(evaluation.date).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <StarIcon className="w-5 h-5 text-yellow-400" />
                <span className="text-lg font-bold">{evaluation.avg}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EvaluationsPage;
