/**
 * ATTENDANCE PAGE - Control de Asistencia
 */
import React, { useEffect, useMemo, useState } from "react";
import { storage } from "@/services/mockApi";
import { useAuthStore } from "@/store/authStore";
import { normalizeRole } from "@/utils/rbac";
import { formatDateInput, toDisplayDateFromIso, toIsoDateFromDisplay } from "@/utils/inputFormat";
import {
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

const AttendancePage: React.FC = () => {
  const { user } = useAuthStore();
  const role = normalizeRole(user?.role);
  const canEditAttendance = role === "ADMIN" || role === "DOCENTE";
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [selectedDateInput, setSelectedDateInput] = useState(
    toDisplayDateFromIso(new Date().toISOString().split("T")[0])
  );
  const [selectedGroup, setSelectedGroup] = useState("");

  interface AttendanceRecord {
    id: string;
    studentId?: string;
    studentName: string;
    groupId?: string;
    date: string;
    status: "PRESENT" | "ABSENT";
  }

  interface Group {
    id: string;
    name: string;
  }

  const [groups, setGroups] = useState<Group[]>(() => storage.get<Group[]>("groups") || []);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(
    () => storage.get<AttendanceRecord[]>("attendance_records") || []
  );

  useEffect(() => {
    setGroups(storage.get<Group[]>("groups") || []);
    setAttendanceRecords(storage.get<AttendanceRecord[]>("attendance_records") || []);
  }, []);

  useEffect(() => {
    if (!selectedGroup && groups.length > 0) {
      setSelectedGroup(groups[0].id);
    }
  }, [groups, selectedGroup]);

  const filteredRecords = useMemo(() => {
    return attendanceRecords.filter((record) => {
      const matchesDate = record.date === selectedDate;
      const matchesGroup = selectedGroup ? record.groupId === selectedGroup : true;
      return matchesDate && matchesGroup;
    });
  }, [attendanceRecords, selectedDate, selectedGroup]);

  const toggleAttendance = (id: string) => {
    setAttendanceRecords((previous) =>
      previous.map((record) =>
        record.id === id
          ? { ...record, status: record.status === "PRESENT" ? "ABSENT" : "PRESENT" }
          : record
      )
    );
  };

  const saveAttendance = () => {
    storage.set("attendance_records", attendanceRecords);
    alert("Asistencia guardada exitosamente");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Control de Asistencia</h1>
          <p className="text-dark-500 mt-1">Registro diario de asistencia</p>
        </div>
        {canEditAttendance && (
          <button onClick={saveAttendance} className="btn-primary">
            Guardar Asistencia
          </button>
        )}
      </div>

      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Fecha</label>
            <div className="relative">
              <CalendarIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
              <input
                type="text"
                value={selectedDateInput}
                onChange={(e) => {
                  const formatted = formatDateInput(e.target.value);
                  setSelectedDateInput(formatted);
                  const iso = toIsoDateFromDisplay(formatted);
                  if (iso) {
                    setSelectedDate(iso);
                  }
                }}
                inputMode="numeric"
                pattern="\d{2}/\d{2}/\d{2}"
                placeholder="DD/MM/AA"
                className="input pl-10 w-full"
                disabled={!canEditAttendance}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Grupo</label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="input w-full"
              disabled={!canEditAttendance || groups.length === 0}
            >
              {groups.length === 0 ? (
                <option value="">Sin grupos registrados</option>
              ) : (
                groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="card p-4 bg-primary-50 dark:bg-primary-900/10">
            <p className="text-sm text-dark-600 dark:text-dark-400">
              Total Estudiantes
            </p>
            <p className="text-2xl font-bold text-primary-600">
              {filteredRecords.length}
            </p>
          </div>
          <div className="card p-4 bg-success-50 dark:bg-success-900/10">
            <p className="text-sm text-dark-600 dark:text-dark-400">
              Presentes
            </p>
            <p className="text-2xl font-bold text-success-600">
              {filteredRecords.filter((record) => record.status === "PRESENT").length}
            </p>
          </div>
          <div className="card p-4 bg-error-50 dark:bg-error-900/10">
            <p className="text-sm text-dark-600 dark:text-dark-400">Ausentes</p>
            <p className="text-2xl font-bold text-error-600">
              {filteredRecords.filter((record) => record.status === "ABSENT").length}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-8 text-dark-500">
              No hay registros de asistencia para esta fecha.
            </div>
          ) : (
            filteredRecords.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-4 rounded-lg border border-dark-200 dark:border-dark-700 hover:bg-dark-50 dark:hover:bg-dark-800"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-semibold">
                    {record.studentName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <span className="font-medium">{record.studentName}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleAttendance(record.id)}
                    disabled={!canEditAttendance}
                    className={`p-2 rounded-lg transition-colors ${
                      record.status === "PRESENT"
                        ? "bg-success-100 dark:bg-success-900/20 text-success-700 dark:text-success-400"
                        : "bg-dark-100 dark:bg-dark-800 text-dark-400"
                    }`}
                  >
                    <CheckCircleIcon className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => toggleAttendance(record.id)}
                    disabled={!canEditAttendance}
                    className={`p-2 rounded-lg transition-colors ${
                      record.status === "ABSENT"
                        ? "bg-error-100 dark:bg-error-900/20 text-error-700 dark:text-error-400"
                        : "bg-dark-100 dark:bg-dark-800 text-dark-400"
                    }`}
                  >
                    <XCircleIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
