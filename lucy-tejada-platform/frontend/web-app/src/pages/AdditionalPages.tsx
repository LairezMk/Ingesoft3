/**
 * VENUES & RESERVATIONS & CONTRACTS & MAINTENANCE & REPORTS & SETTINGS PAGES
 */

// VenuesPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { storage } from "@/services/mockApi";
import { useAuthStore, type UserProfile } from "@/store/authStore";
import { normalizeRole } from "@/utils/rbac";
import {
  PlusIcon,
  PencilIcon,
  EyeIcon,
  PencilSquareIcon,
  XMarkIcon,
  PhotoIcon,
  DocumentArrowUpIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  TableCellsIcon,
  PlayIcon,
  UserCircleIcon,
  DevicePhoneMobileIcon,
  IdentificationIcon,
  EnvelopeIcon,
  BuildingOffice2Icon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { useUIStore, type ThemeName } from "@/store/uiStore";
import toast from "react-hot-toast";
import {
  digitsOnly,
  formatDateInput,
  toDisplayDateFromIso,
  toIsoDateFromDisplay,
} from "@/utils/inputFormat";

interface Venue {
  id: string;
  name: string;
  capacity: number;
  type: "Teatro" | "Danza" | "Música" | "Artes Visuales" | "Multipropósito";
  status: "AVAILABLE" | "MAINTENANCE" | "UNAVAILABLE";
  location: string;
  description: string;
  photoUrl?: string;
}

export const VenuesPage: React.FC = () => {
  const { user } = useAuthStore();
  const role = normalizeRole(user?.role) ?? "VISITANTE";
  const canManageVenues = role === "ADMIN";
  const todayIso = new Date().toISOString().split("T")[0];
  const todayDisplay = toDisplayDateFromIso(todayIso);
  const [isCreateVenueModalOpen, setIsCreateVenueModalOpen] = useState(false);

  const [venues, setVenues] = useState<Venue[]>(() => storage.get<Venue[]>("venues") || []);

  const [venueForm, setVenueForm] = useState<Omit<Venue, "id">>({
    name: "",
    type: "Teatro",
    capacity: 30,
    status: "AVAILABLE",
    location: "",
    description: "",
    photoUrl: "",
  });

  const [activeCalendarVenueId, setActiveCalendarVenueId] = useState<string | null>(null);
  const [selectedDates, setSelectedDates] = useState<Record<string, string>>(() => {
    const savedDates = storage.get<Record<string, string>>("venue_calendar_dates") || {};
    const initialDates: Record<string, string> = {};

    venues.forEach((venue) => {
      initialDates[venue.id] = savedDates[venue.id] || todayIso;
    });

    return initialDates;
  });

  const [selectedDateInputs, setSelectedDateInputs] = useState<Record<string, string>>(() => {
    const initialInputs: Record<string, string> = {};
    venues.forEach((venue) => {
      const iso = selectedDates[venue.id] || todayIso;
      initialInputs[venue.id] = toDisplayDateFromIso(iso) || todayDisplay;
    });
    return initialInputs;
  });

  const handleDateChange = (venueId: string, date: string) => {
    const formatted = formatDateInput(date);
    setSelectedDateInputs((prev) => ({ ...prev, [venueId]: formatted }));
    const iso = toIsoDateFromDisplay(formatted);
    if (!iso) return;

    setSelectedDates((prev) => {
      const updatedDates = { ...prev, [venueId]: iso };
      storage.set("venue_calendar_dates", updatedDates);
      return updatedDates;
    });
  };

  const formatSelectedDate = (date: string) => {
    const iso = date.includes("/") ? toIsoDateFromDisplay(date) : date;
    if (!iso) return date;
    return new Date(`${iso}T00:00:00`).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatVenueStatus = (status: Venue["status"]) => {
    if (status === "AVAILABLE") return "Disponible";
    if (status === "MAINTENANCE") return "Mantenimiento";
    return "No disponible";
  };

  const statusClassName = (status: Venue["status"]) => {
    if (status === "AVAILABLE") {
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300";
    }
    if (status === "MAINTENANCE") {
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
    }
    return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
  };

  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
      reader.readAsDataURL(file);
    });

  const handleVenuePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("El archivo debe ser una imagen.");
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setVenueForm((previous) => ({ ...previous, photoUrl: dataUrl }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error cargando imagen.");
    }
  };

  const resetVenueForm = () => {
    setVenueForm({
      name: "",
      type: "Teatro",
      capacity: 30,
      status: "AVAILABLE",
      location: "",
      description: "",
      photoUrl: "",
    });
  };

  const handleCreateVenue = (event: React.FormEvent) => {
    event.preventDefault();

    if (!venueForm.name.trim()) {
      toast.error("El nombre del escenario es obligatorio.");
      return;
    }

    if (!venueForm.location.trim()) {
      toast.error("La ubicación del escenario es obligatoria.");
      return;
    }

    if (venueForm.capacity <= 0) {
      toast.error("La capacidad debe ser mayor a cero.");
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const newVenue: Venue = {
      id: String(Date.now()),
      ...venueForm,
      name: venueForm.name.trim(),
      location: venueForm.location.trim(),
      description: venueForm.description.trim() || "Sin descripción adicional.",
    };

    setVenues((previous) => {
      const updated = [newVenue, ...previous];
      storage.set("venues", updated);
      return updated;
    });
    setSelectedDates((previous) => ({ ...previous, [newVenue.id]: today }));
    storage.set("venue_calendar_dates", {
      ...selectedDates,
      [newVenue.id]: today,
    });

    setIsCreateVenueModalOpen(false);
    resetVenueForm();
    toast.success("Escenario creado correctamente.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Escenarios Culturales</h1>
          <p className="text-dark-500 mt-1">
            {canManageVenues ? "Gestión de espacios físicos" : "Consulta de escenarios disponibles"}
          </p>
        </div>
        {canManageVenues && (
          <button
            className="btn-primary flex items-center gap-2"
            onClick={() => setIsCreateVenueModalOpen(true)}
          >
            <PlusIcon className="w-5 h-5" />
            Nuevo Escenario
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {venues.map((venue) => (
          <div key={venue.id} className="card p-6">
            {venue.photoUrl && (
              <img
                src={venue.photoUrl}
                alt={venue.name}
                className="w-full h-36 object-cover rounded-xl mb-4 border border-dark-200 dark:border-dark-700"
              />
            )}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold mb-1">{venue.name}</h3>
                <p className="text-sm text-dark-500">{venue.type}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${statusClassName(venue.status)}`}>
                {formatVenueStatus(venue.status)}
              </span>
            </div>
            <p className="text-sm text-dark-600 dark:text-dark-300 line-clamp-2">
              {venue.description}
            </p>
            <div className="flex items-center gap-2 text-sm text-dark-600">
              <span>👥</span>
              <span>Capacidad: {venue.capacity} personas</span>
            </div>
            <p className="text-sm text-dark-500 mt-1">Ubicación: {venue.location}</p>
            <div className="flex gap-2 mt-4">
              <button
                className="btn-secondary flex-1 flex items-center justify-center gap-2"
                onClick={() =>
                  setActiveCalendarVenueId((current) =>
                    current === venue.id ? null : venue.id,
                  )
                }
              >
                <CalendarDaysIcon className="w-5 h-5" />
                Ver Calendario
              </button>
              <button className="text-primary-600">
                <PencilIcon className="w-5 h-5" />
              </button>
            </div>
            {activeCalendarVenueId === venue.id && (
              <div className="mt-4 p-4 rounded-xl border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800 space-y-3">
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-200">
                  Fecha del calendario
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={selectedDateInputs[venue.id] || todayDisplay}
                    onChange={(event) => handleDateChange(venue.id, event.target.value)}
                    inputMode="numeric"
                    pattern="\d{2}/\d{2}/\d{2}"
                    placeholder="DD/MM/AA"
                    className="input py-2"
                  />
                  <button
                    className="btn-ghost"
                    onClick={() => handleDateChange(venue.id, todayDisplay)}
                  >
                    Hoy
                  </button>
                </div>
                <p className="text-xs text-dark-500 dark:text-dark-400">
                  Fecha seleccionada: {formatSelectedDate(selectedDateInputs[venue.id] || todayDisplay)}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {canManageVenues && isCreateVenueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsCreateVenueModalOpen(false)}
          />
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Crear nuevo escenario</h3>
              <button className="btn-ghost p-2" onClick={() => setIsCreateVenueModalOpen(false)}>
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateVenue} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre del escenario</label>
                  <input
                    className="input"
                    value={venueForm.name}
                    onChange={(event) =>
                      setVenueForm((previous) => ({ ...previous, name: event.target.value }))
                    }
                    placeholder="Ej: Sala de Ensayo Coral"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo</label>
                  <select
                    className="input"
                    value={venueForm.type}
                    onChange={(event) =>
                      setVenueForm((previous) => ({
                        ...previous,
                        type: event.target.value as Venue["type"],
                      }))
                    }
                    required
                  >
                    <option value="Teatro">Teatro</option>
                    <option value="Danza">Danza</option>
                    <option value="Música">Música</option>
                    <option value="Artes Visuales">Artes Visuales</option>
                    <option value="Multipropósito">Multipropósito</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Capacidad</label>
                  <input
                    type="number"
                    min={1}
                    className="input"
                    value={venueForm.capacity}
                    onChange={(event) =>
                      setVenueForm((previous) => ({
                        ...previous,
                        capacity: Number(event.target.value) || 0,
                      }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Estado</label>
                  <select
                    className="input"
                    value={venueForm.status}
                    onChange={(event) =>
                      setVenueForm((previous) => ({
                        ...previous,
                        status: event.target.value as Venue["status"],
                      }))
                    }
                    required
                  >
                    <option value="AVAILABLE">Disponible</option>
                    <option value="MAINTENANCE">Mantenimiento</option>
                    <option value="UNAVAILABLE">No disponible</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Ubicación</label>
                  <input
                    className="input"
                    value={venueForm.location}
                    onChange={(event) =>
                      setVenueForm((previous) => ({ ...previous, location: event.target.value }))
                    }
                    placeholder="Ej: Bloque B - Piso 1"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Descripción</label>
                  <textarea
                    className="input min-h-[100px]"
                    value={venueForm.description}
                    onChange={(event) =>
                      setVenueForm((previous) => ({ ...previous, description: event.target.value }))
                    }
                    placeholder="Describe el uso principal del escenario."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Foto del escenario (opcional)</label>
                  <label className="btn-outline inline-flex items-center gap-2 cursor-pointer">
                    <PhotoIcon className="w-4 h-4" />
                    Subir imagen
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => void handleVenuePhotoUpload(event)}
                    />
                  </label>
                  {venueForm.photoUrl && (
                    <img
                      src={venueForm.photoUrl}
                      alt="Previsualización escenario"
                      className="mt-3 w-full max-w-sm h-36 object-cover rounded-lg border border-dark-200 dark:border-dark-700"
                    />
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => {
                    setIsCreateVenueModalOpen(false);
                    resetVenueForm();
                  }}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Guardar escenario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ReservationsPage.tsx
export const ReservationsPage: React.FC = () => {
  interface VenueOption {
    id: string;
    name: string;
    type: "TEATRO" | "DANZA" | "MUSICA" | "ARTES_VISUALES" | "MULTIPROPOSITO";
  }

  interface Reservation {
    id: string;
    venueId: string;
    venueName: string;
    venueType: VenueOption["type"];
    eventType: string;
    eventName: string;
    date: string;
    startTime: string;
    endTime: string;
    status: "APPROVED" | "PENDING";
    requestedBy?: {
      name: string;
      email: string;
      phone?: string;
      documentId?: string;
    };
  }

  const { user } = useAuthStore();
  const role = normalizeRole(user?.role) ?? "VISITANTE";
  const isVisitor = role === "VISITANTE";

  const todayIso = new Date().toISOString().split("T")[0];
  const todayDisplay = toDisplayDateFromIso(todayIso);

  const normalizeVenueType = (type: string): VenueOption["type"] => {
    const normalized = type.toUpperCase().replace(/\s+/g, "_");
    if (normalized === "TEATRO") return "TEATRO";
    if (normalized === "DANZA") return "DANZA";
    if (normalized === "MUSICA" || normalized === "MÚSICA") return "MUSICA";
    if (normalized === "ARTES_VISUALES" || normalized === "ARTES_VISUALES") return "ARTES_VISUALES";
    return "MULTIPROPOSITO";
  };

  const [venueOptions, setVenueOptions] = useState<VenueOption[]>([]);

  useEffect(() => {
    const venues = storage.get<Array<{ id: string; name: string; type?: string }>>("venues") || [];
    setVenueOptions(
      venues.map((venue) => ({
        id: venue.id,
        name: venue.name,
        type: normalizeVenueType(venue.type || "MULTIPROPOSITO"),
      }))
    );
  }, []);

  const eventTypesByVenueType: Record<VenueOption["type"], string[]> = {
    TEATRO: ["Obra teatral", "Ensayo general", "Muestra escénica", "Conferencia cultural"],
    DANZA: ["Clase de danza", "Ensayo coreográfico", "Muestra de baile", "Taller de expresión corporal"],
    MUSICA: ["Concierto", "Ensayo musical", "Clase instrumental", "Grabación de audio"],
    ARTES_VISUALES: ["Exposición artística", "Taller de pintura", "Laboratorio creativo", "Montaje de galería"],
    MULTIPROPOSITO: ["Evento comunitario", "Festival cultural", "Feria institucional", "Actividad formativa"],
  };

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>(
    () => storage.get<Reservation[]>("reservations") || []
  );

  const [formData, setFormData] = useState({
    venueId: "",
    eventType: "",
    eventName: "",
    date: todayDisplay,
    startTime: "09:00",
    endTime: "11:00",
    status: "PENDING" as Reservation["status"],
    requesterName: "",
    requesterEmail: "",
    requesterPhone: "",
    requesterDocumentId: "",
  });

  useEffect(() => {
    if (venueOptions.length === 0 || formData.venueId) return;
    const firstVenue = venueOptions[0];
    setFormData((previous) => ({
      ...previous,
      venueId: firstVenue.id,
      eventType: eventTypesByVenueType[firstVenue.type][0],
    }));
  }, [formData.venueId, venueOptions, eventTypesByVenueType]);

  const getVenueById = (venueId: string) =>
    venueOptions.find((venue) => venue.id === venueId);

  const resetForm = () => {
    const firstVenue = venueOptions[0];
    if (!firstVenue) return;
    setFormData({
      venueId: firstVenue.id,
      eventType: eventTypesByVenueType[firstVenue.type][0],
      eventName: "",
      date: todayDisplay,
      startTime: "09:00",
      endTime: "11:00",
      status: "PENDING",
      requesterName: "",
      requesterEmail: "",
      requesterPhone: "",
      requesterDocumentId: "",
    });
  };

  const handleCreateReservation = (event: React.FormEvent) => {
    event.preventDefault();

    if (venueOptions.length === 0) {
      toast.error("No hay escenarios registrados para reservar.");
      return;
    }

    const selectedVenue = getVenueById(formData.venueId);
    if (!selectedVenue) {
      toast.error("Selecciona un escenario válido.");
      return;
    }

    if (!formData.eventName.trim()) {
      toast.error("El nombre del evento es obligatorio.");
      return;
    }

    const normalizedDate = toIsoDateFromDisplay(formData.date);
    if (!normalizedDate) {
      toast.error("Fecha inválida. Usa el formato DD/MM/AA.");
      return;
    }

    if (formData.startTime >= formData.endTime) {
      toast.error("La hora de inicio debe ser menor que la hora de finalización.");
      return;
    }

    if (isVisitor) {
      if (!formData.requesterName.trim() || !formData.requesterEmail.trim()) {
        toast.error("Como visitante debes ingresar nombre y correo para la solicitud.");
        return;
      }
    }

    const defaultRequesterName =
      user?.profile?.firstName && user?.profile?.lastName
        ? `${user.profile.firstName} ${user.profile.lastName}`
        : user?.email || "Usuario";
    const requester = isVisitor
      ? {
          name: formData.requesterName.trim(),
          email: formData.requesterEmail.trim(),
          phone: formData.requesterPhone.trim(),
          documentId: formData.requesterDocumentId.trim(),
        }
      : {
          name: defaultRequesterName,
          email: user?.email || "",
        };

    const newReservation: Reservation = {
      id: String(Date.now()),
      venueId: selectedVenue.id,
      venueName: selectedVenue.name,
      venueType: selectedVenue.type,
      eventType: formData.eventType,
      eventName: formData.eventName.trim(),
      date: normalizedDate,
      startTime: formData.startTime,
      endTime: formData.endTime,
      status: formData.status,
      requestedBy: requester,
    };

    setReservations((previous) => {
      const updated = [newReservation, ...previous];
      storage.set("reservations", updated);
      return updated;
    });

    setIsCreateModalOpen(false);
    resetForm();
    toast.success("Reserva creada correctamente.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reservas de Escenarios</h1>
          <p className="text-dark-500 mt-1">
            {isVisitor
              ? "Solicita reservas y alquileres de escenarios"
              : "Gestión de reservas y eventos"}
          </p>
        </div>
        <button
          className="btn-primary flex items-center gap-2"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <PlusIcon className="w-5 h-5" />
          {isVisitor ? "Solicitar Reserva" : "Nueva Reserva"}
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-dark-50 dark:bg-dark-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase">
                Escenario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase">
                Tipo de Escenario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase">
                Evento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase">
                Tipo de Evento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase">
                Horario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-200 dark:divide-dark-700">
            {reservations.map((res) => (
              <tr
                key={res.id}
                className="hover:bg-dark-50 dark:hover:bg-dark-800"
              >
                <td className="px-6 py-4">{res.venueName}</td>
                <td className="px-6 py-4">
                  <span className="badge badge-info">{res.venueType.replace("_", " ")}</span>
                </td>
                <td className="px-6 py-4">{res.eventName}</td>
                <td className="px-6 py-4">{res.eventType}</td>
                <td className="px-6 py-4">
                  {new Date(res.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">{res.startTime}-{res.endTime}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      res.status === "APPROVED"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                    }`}
                  >
                    {res.status === "APPROVED" ? "Aprobada" : "Pendiente"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsCreateModalOpen(false)}
          />
          <div className="relative w-full max-w-2xl card p-6">
            <h3 className="text-xl font-bold mb-4">Nueva Reserva</h3>
            <form onSubmit={handleCreateReservation} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Escenario</label>
                  <select
                    className="input"
                    value={formData.venueId}
                    onChange={(event) => {
                      const venueId = event.target.value;
                      const venue = getVenueById(venueId);
                      if (!venue) return;
                      setFormData((previous) => ({
                        ...previous,
                        venueId,
                        eventType: eventTypesByVenueType[venue.type][0],
                      }));
                    }}
                    required
                  >
                    {venueOptions.map((venue) => (
                      <option key={venue.id} value={venue.id}>
                        {venue.name} ({venue.type.replace("_", " ")})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo de evento</label>
                  <select
                    className="input"
                    value={formData.eventType}
                    onChange={(event) =>
                      setFormData((previous) => ({
                        ...previous,
                        eventType: event.target.value,
                      }))
                    }
                    required
                  >
                    {(eventTypesByVenueType[getVenueById(formData.venueId)?.type || "TEATRO"] || []).map(
                      (eventType) => (
                        <option key={eventType} value={eventType}>
                          {eventType}
                        </option>
                      ),
                    )}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Nombre del evento</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Ej: Muestra de fin de semestre"
                    value={formData.eventName}
                    onChange={(event) =>
                      setFormData((previous) => ({
                        ...previous,
                        eventName: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
                {isVisitor && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Nombre solicitante</label>
                      <input
                        type="text"
                        className="input"
                        value={formData.requesterName}
                        onChange={(event) =>
                          setFormData((previous) => ({ ...previous, requesterName: event.target.value }))
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Correo solicitante</label>
                      <input
                        type="email"
                        className="input"
                        value={formData.requesterEmail}
                        onChange={(event) =>
                          setFormData((previous) => ({ ...previous, requesterEmail: event.target.value }))
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Teléfono</label>
                      <input
                        type="text"
                        className="input"
                        value={formData.requesterPhone}
                        onChange={(event) =>
                          setFormData((previous) => ({
                            ...previous,
                            requesterPhone: digitsOnly(event.target.value, 15),
                          }))
                        }
                        inputMode="numeric"
                        pattern="[0-9]*"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Documento</label>
                      <input
                        type="text"
                        className="input"
                        value={formData.requesterDocumentId}
                        onChange={(event) =>
                          setFormData((previous) => ({
                            ...previous,
                            requesterDocumentId: digitsOnly(event.target.value, 20),
                          }))
                        }
                        inputMode="numeric"
                        pattern="[0-9]*"
                      />
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-medium mb-1">Fecha</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.date}
                    onChange={(event) =>
                      setFormData((previous) => ({
                        ...previous,
                        date: formatDateInput(event.target.value),
                      }))
                    }
                    inputMode="numeric"
                    pattern="\d{2}/\d{2}/\d{2}"
                    placeholder="DD/MM/AA"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Estado</label>
                  <select
                    className="input"
                    value={formData.status}
                    onChange={(event) =>
                      setFormData((previous) => ({
                        ...previous,
                        status: event.target.value as Reservation["status"],
                      }))
                    }
                    required
                  >
                    <option value="PENDING">Pendiente</option>
                    <option value="APPROVED">Aprobada</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Hora inicio</label>
                  <input
                    type="time"
                    className="input"
                    value={formData.startTime}
                    onChange={(event) =>
                      setFormData((previous) => ({
                        ...previous,
                        startTime: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Hora fin</label>
                  <input
                    type="time"
                    className="input"
                    value={formData.endTime}
                    onChange={(event) =>
                      setFormData((previous) => ({
                        ...previous,
                        endTime: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Guardar Reserva
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ContractsPage.tsx
export const ContractsPage: React.FC = () => {
  type ContractType = "DOCENTE" | "PRESTACION_SERVICIOS" | "ASEO_LOGISTICA";
  type ContractStatus = "APPROVED" | "PENDING";
  type ContractEditMode = "GUIDED" | "FULL";

  interface ContractRecord {
    id: string;
    contractNumber: string;
    contractType: ContractType;
    contractorName: string;
    contractorId: string;
    specificFieldValue: string;
    startDate: string;
    endDate: string;
    amount: string;
    city: string;
    supervisor: string;
    object: string;
    status: ContractStatus;
    createdAt: string;
    content: string;
  }

  interface ContractTemplateConfig {
    label: string;
    contractLabel: string;
    specificFieldLabel: string;
    defaultSpecificValue: string;
    objectHint: string;
    buildContent: (fields: Omit<ContractRecord, "content">) => string;
  }

  const today = new Date().toISOString().split("T")[0];

  const contractTemplates: Record<ContractType, ContractTemplateConfig> = {
    DOCENTE: {
      label: "Docente",
      contractLabel: "Contrato Docente",
      specificFieldLabel: "Área / Asignatura",
      defaultSpecificValue: "Música - Cuerdas",
      objectHint: "Prestación de servicios docentes para formación artística.",
      buildContent: (fields) => `CENTRO CULTURAL LUCY TEJADA
CONTRATO DOCENTE N.º ${fields.contractNumber}

Partes:
1. Contratante: Centro Cultural Lucy Tejada.
2. Contratista: ${fields.contractorName}, identificado(a) con documento ${fields.contractorId}.

Objeto:
${fields.object}

Cláusulas principales:
- Área/asignatura: ${fields.specificFieldValue}.
- Vigencia: del ${fields.startDate} al ${fields.endDate}.
- Valor estimado: ${fields.amount}.
- Supervisor designado: ${fields.supervisor}.
- Lugar de ejecución: ${fields.city}.

El presente documento se estructura conforme a lineamientos generales de contratación pública aplicables en Colombia y a los procedimientos internos institucionales.
Fecha de elaboración: ${fields.createdAt}.
`,
    },
    PRESTACION_SERVICIOS: {
      label: "Prestación de Servicios",
      contractLabel: "Contrato de Prestación de Servicios",
      specificFieldLabel: "Servicio especializado",
      defaultSpecificValue: "Apoyo administrativo y documental",
      objectHint: "Prestación de servicios profesionales o de apoyo a la gestión.",
      buildContent: (fields) => `CENTRO CULTURAL LUCY TEJADA
CONTRATO DE PRESTACIÓN DE SERVICIOS N.º ${fields.contractNumber}

Partes:
1. Contratante: Centro Cultural Lucy Tejada.
2. Contratista: ${fields.contractorName}, documento ${fields.contractorId}.

Objeto contractual:
${fields.object}

Condiciones:
- Servicio especializado: ${fields.specificFieldValue}.
- Plazo de ejecución: ${fields.startDate} a ${fields.endDate}.
- Valor del contrato: ${fields.amount}.
- Supervisor contractual: ${fields.supervisor}.
- Ciudad: ${fields.city}.

Este formato se construye como plantilla operativa interna en concordancia general con prácticas de contratación estatal en Colombia.
Fecha de elaboración: ${fields.createdAt}.
`,
    },
    ASEO_LOGISTICA: {
      label: "Aseo y Logística",
      contractLabel: "Contrato de Aseo y Logística",
      specificFieldLabel: "Cobertura del servicio",
      defaultSpecificValue: "Aseo integral y apoyo logístico en sedes",
      objectHint: "Servicios de aseo, limpieza y apoyo logístico operativo.",
      buildContent: (fields) => `CENTRO CULTURAL LUCY TEJADA
CONTRATO DE ASEO Y LOGÍSTICA N.º ${fields.contractNumber}

Partes:
1. Contratante: Centro Cultural Lucy Tejada.
2. Contratista: ${fields.contractorName}, documento ${fields.contractorId}.

Objeto:
${fields.object}

Especificaciones:
- Cobertura del servicio: ${fields.specificFieldValue}.
- Vigencia: ${fields.startDate} a ${fields.endDate}.
- Valor pactado: ${fields.amount}.
- Supervisor operativo: ${fields.supervisor}.
- Lugar de ejecución: ${fields.city}.

Plantilla de referencia para gestión contractual interna basada en lineamientos generales aplicables en Colombia.
Fecha de elaboración: ${fields.createdAt}.
`,
    },
  };

  const createBaseContract = (contractType: ContractType): Omit<ContractRecord, "content"> => ({
    id: String(Date.now()),
    contractNumber: `CCLT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`,
    contractType,
    contractorName: "",
    contractorId: "",
    specificFieldValue: contractTemplates[contractType].defaultSpecificValue,
    startDate: today,
    endDate: today,
    amount: "$ 0 COP",
    city: "Pereira",
    supervisor: "Coordinación Administrativa",
    object: contractTemplates[contractType].objectHint,
    status: "PENDING" as ContractStatus,
    createdAt: today,
  });

  const hydrateContractContent = (
    contract: Omit<ContractRecord, "content"> | ContractRecord,
  ): string => {
    const fields = { ...contract } as Omit<ContractRecord, "content">;
    return contractTemplates[fields.contractType].buildContent(fields);
  };

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewContract, setViewContract] = useState<ContractRecord | null>(null);
  const [editingContract, setEditingContract] = useState<ContractRecord | null>(null);
  const [createMode, setCreateMode] = useState<ContractEditMode>("GUIDED");
  const [contracts, setContracts] = useState<ContractRecord[]>(() => {
    const saved = storage.get<ContractRecord[]>("contracts");
    if (saved && saved.length > 0) return saved;

    const docenteBase = createBaseContract("DOCENTE");
    const serviciosBase = createBaseContract("PRESTACION_SERVICIOS");
    const initial: ContractRecord[] = [
      {
        ...docenteBase,
        id: "1",
        contractNumber: "CCLT-2024-101",
        contractorName: "María García",
        contractorId: "CC 52123456",
        startDate: "2024-01-15",
        endDate: "2024-12-15",
        amount: "$ 36.000.000 COP",
        specificFieldValue: "Danza Contemporánea",
        object:
          "Prestación de servicios docentes para la formación artística en danza contemporánea y montaje escénico.",
        status: "APPROVED" as ContractStatus,
        createdAt: "2024-01-15",
        content: "",
      },
      {
        ...serviciosBase,
        id: "2",
        contractNumber: "CCLT-2024-145",
        contractorName: "Juan Pérez",
        contractorId: "CC 1000456789",
        startDate: "2024-03-20",
        endDate: "2024-09-20",
        amount: "$ 18.500.000 COP",
        specificFieldValue: "Apoyo jurídico y contractual",
        object:
          "Prestación de servicios profesionales para acompañamiento jurídico en procesos contractuales institucionales.",
        status: "PENDING" as ContractStatus,
        createdAt: "2024-03-20",
        content: "",
      },
    ].map((contract) => ({ ...contract, content: hydrateContractContent(contract) }));

    storage.set("contracts", initial);
    return initial;
  });

  const [createForm, setCreateForm] = useState<ContractRecord>(() => {
    const base = createBaseContract("DOCENTE");
    return { ...base, content: hydrateContractContent(base) };
  });

  const updateCreateForm = (patch: Partial<ContractRecord>) => {
    setCreateForm((previous) => {
      const updated = { ...previous, ...patch };
      if (createMode === "GUIDED") {
        return { ...updated, content: hydrateContractContent(updated) };
      }
      return updated;
    });
  };

  const handleChangeCreateType = (contractType: ContractType) => {
    const base = createBaseContract(contractType);
    setCreateForm({ ...base, content: hydrateContractContent(base) });
  };

  const handleOpenCreate = () => {
    const base = createBaseContract("DOCENTE");
    setCreateMode("GUIDED");
    setCreateForm({ ...base, content: hydrateContractContent(base) });
    setIsCreateModalOpen(true);
  };

  const handleSaveNewContract = (event: React.FormEvent) => {
    event.preventDefault();

    if (!createForm.contractorName.trim() || !createForm.contractorId.trim()) {
      toast.error("Completa nombre e identificación del contratista.");
      return;
    }

    if (createForm.startDate > createForm.endDate) {
      toast.error("La fecha de inicio no puede ser mayor a la fecha de finalización.");
      return;
    }

    const contractToSave: ContractRecord =
      createMode === "GUIDED"
        ? { ...createForm, content: hydrateContractContent(createForm) }
        : createForm;

    setContracts((previous) => {
      const updated = [contractToSave, ...previous];
      storage.set("contracts", updated);
      return updated;
    });
    setIsCreateModalOpen(false);
    toast.success("Contrato creado correctamente.");
  };

  const handleOpenReview = (contract: ContractRecord) => {
    setEditingContract({ ...contract });
  };

  const handleSaveReview = () => {
    if (!editingContract) return;

    setContracts((previous) => {
      const updated = previous.map((item) =>
        item.id === editingContract.id ? editingContract : item,
      );
      storage.set("contracts", updated);
      return updated;
    });
    setEditingContract(null);
    toast.success("Contrato actualizado.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contratos</h1>
          <p className="text-dark-500 mt-1">Gestión de contratos y convenios</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={handleOpenCreate}>
          <PlusIcon className="w-5 h-5" />
          Nuevo Contrato
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {contracts.map((contract) => (
          <div key={contract.id} className="card p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold mb-2">
                  {contractTemplates[contract.contractType].contractLabel} - {contract.contractorName}
                </h3>
                <div className="flex gap-4 text-sm text-dark-600">
                  <span>📄 {contractTemplates[contract.contractType].label}</span>
                  <span>🆔 {contract.contractNumber}</span>
                  <span>📅 {new Date(contract.startDate).toLocaleDateString()}</span>
                </div>
              </div>
              <span
                className={`px-3 py-1 text-xs rounded-full ${
                  contract.status === "APPROVED"
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                }`}
              >
                {contract.status === "APPROVED"
                  ? "Aprobado"
                  : "Pendiente Revisión"}
              </span>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                className="btn-secondary flex items-center gap-2"
                onClick={() => setViewContract(contract)}
              >
                <EyeIcon className="w-4 h-4" />
                Ver Documento
              </button>
              <button
                className="btn-primary flex items-center gap-2"
                onClick={() => handleOpenReview(contract)}
              >
                <PencilSquareIcon className="w-4 h-4" />
                Revisar
              </button>
            </div>
          </div>
        ))}
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsCreateModalOpen(false)} />
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Crear Contrato</h3>
              <button className="btn-ghost p-2" onClick={() => setIsCreateModalOpen(false)}>
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveNewContract} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo de contrato</label>
                  <select
                    className="input"
                    value={createForm.contractType}
                    onChange={(event) => handleChangeCreateType(event.target.value as ContractType)}
                  >
                    {(Object.keys(contractTemplates) as ContractType[]).map((type) => (
                      <option key={type} value={type}>
                        {contractTemplates[type].label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Modo de edición</label>
                  <select
                    className="input"
                    value={createMode}
                    onChange={(event) => setCreateMode(event.target.value as ContractEditMode)}
                  >
                    <option value="GUIDED">Guiado (solo campos clave)</option>
                    <option value="FULL">Edición completa del contrato</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Número de contrato</label>
                  <input
                    className="input"
                    value={createForm.contractNumber}
                    onChange={(event) => updateCreateForm({ contractNumber: event.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre del contratista</label>
                  <input
                    className="input"
                    value={createForm.contractorName}
                    onChange={(event) => updateCreateForm({ contractorName: event.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Documento</label>
                  <input
                    className="input"
                    value={createForm.contractorId}
                    onChange={(event) => updateCreateForm({ contractorId: event.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {contractTemplates[createForm.contractType].specificFieldLabel}
                  </label>
                  <input
                    className="input"
                    value={createForm.specificFieldValue}
                    onChange={(event) => updateCreateForm({ specificFieldValue: event.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Fecha inicio</label>
                  <input
                    type="date"
                    className="input"
                    value={createForm.startDate}
                    onChange={(event) => updateCreateForm({ startDate: event.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Fecha fin</label>
                  <input
                    type="date"
                    className="input"
                    value={createForm.endDate}
                    onChange={(event) => updateCreateForm({ endDate: event.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Valor</label>
                  <input
                    className="input"
                    value={createForm.amount}
                    onChange={(event) => updateCreateForm({ amount: event.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Supervisor</label>
                  <input
                    className="input"
                    value={createForm.supervisor}
                    onChange={(event) => updateCreateForm({ supervisor: event.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ciudad</label>
                  <input
                    className="input"
                    value={createForm.city}
                    onChange={(event) => updateCreateForm({ city: event.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Estado</label>
                  <select
                    className="input"
                    value={createForm.status}
                    onChange={(event) => updateCreateForm({ status: event.target.value as ContractStatus })}
                  >
                    <option value="PENDING">Pendiente revisión</option>
                    <option value="APPROVED">Aprobado</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Objeto contractual</label>
                  <textarea
                    className="input min-h-[90px]"
                    value={createForm.object}
                    onChange={(event) => updateCreateForm({ object: event.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Documento contractual {createMode === "GUIDED" ? "(generado automáticamente)" : "(editable)"}
                  </label>
                  <textarea
                    className="input min-h-[220px] font-mono text-xs"
                    value={createForm.content}
                    onChange={(event) => updateCreateForm({ content: event.target.value })}
                    readOnly={createMode === "GUIDED"}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="btn-ghost" onClick={() => setIsCreateModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Guardar Contrato
                </button>
              </div>
            </form>
            <p className="text-xs text-dark-500 mt-4">
              Plantilla de apoyo administrativo basada en lineamientos generales de contratación en Colombia. Requiere validación jurídica institucional.
            </p>
          </div>
        </div>
      )}

      {viewContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setViewContract(null)} />
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Documento del Contrato</h3>
              <button className="btn-ghost p-2" onClick={() => setViewContract(null)}>
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <pre className="whitespace-pre-wrap text-sm leading-relaxed bg-dark-50 dark:bg-dark-800 p-4 rounded-xl">
              {viewContract.content}
            </pre>
          </div>
        </div>
      )}

      {editingContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setEditingContract(null)} />
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Revisar Contrato</h3>
              <button className="btn-ghost p-2" onClick={() => setEditingContract(null)}>
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Estado</label>
                <select
                  className="input"
                  value={editingContract.status}
                  onChange={(event) =>
                    setEditingContract((previous) =>
                      previous
                        ? { ...previous, status: event.target.value as ContractStatus }
                        : previous,
                    )
                  }
                >
                  <option value="PENDING">Pendiente revisión</option>
                  <option value="APPROVED">Aprobado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Supervisor</label>
                <input
                  className="input"
                  value={editingContract.supervisor}
                  onChange={(event) =>
                    setEditingContract((previous) =>
                      previous ? { ...previous, supervisor: event.target.value } : previous,
                    )
                  }
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Documento completo</label>
                <textarea
                  className="input min-h-[260px] font-mono text-xs"
                  value={editingContract.content}
                  onChange={(event) =>
                    setEditingContract((previous) =>
                      previous ? { ...previous, content: event.target.value } : previous,
                    )
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button className="btn-ghost" onClick={() => setEditingContract(null)}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={handleSaveReview}>
                Guardar Revisión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// MaintenancePage.tsx
export const MaintenancePage: React.FC = () => {
  type MaintenancePriority = "HIGH" | "MEDIUM" | "LOW";
  type MaintenanceStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

  interface MaintenanceRecord {
    id: string;
    venue: string;
    issue: string;
    priority: MaintenancePriority;
    status: MaintenanceStatus;
    date: string;
    beforePhoto?: string;
    afterPhoto?: string;
    pdfName?: string;
    pdfDataUrl?: string;
  }

  const today = new Date().toISOString().split("T")[0];
  const venueOptions = [
    "Auditorio Principal",
    "Sala Teatro Experimental",
    "Sala de Danza A",
    "Sala de Danza B",
    "Sala de Música Ensamble",
    "Cabina de Producción Sonora",
    "Taller de Pintura y Dibujo",
    "Galería Central",
    "Plazoleta Cultural",
  ];

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>(() => {
    const saved = storage.get<MaintenanceRecord[]>("maintenance_records");
    if (saved && saved.length > 0) return saved;

    const initial: MaintenanceRecord[] = [
      {
        id: "1",
        venue: "Sala de Música Ensamble",
        issue: "Afinación requerida",
        priority: "HIGH",
        status: "PENDING",
        date: "2024-03-30",
      },
      {
        id: "2",
        venue: "Cabina de Producción Sonora",
        issue: "Revisión general",
        priority: "MEDIUM",
        status: "IN_PROGRESS",
        date: "2024-03-28",
      },
    ];
    storage.set("maintenance_records", initial);
    return initial;
  });

  const [formData, setFormData] = useState<Omit<MaintenanceRecord, "id">>({
    venue: venueOptions[0],
    issue: "",
    priority: "MEDIUM",
    status: "PENDING",
    date: today,
    beforePhoto: "",
    afterPhoto: "",
    pdfName: "",
    pdfDataUrl: "",
  });

  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("No se pudo leer el archivo."));
      reader.readAsDataURL(file);
    });

  const handlePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    target: "beforePhoto" | "afterPhoto",
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Selecciona una imagen válida.");
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setFormData((previous) => ({ ...previous, [target]: dataUrl }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al cargar imagen.");
    }
  };

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Solo se permiten archivos PDF.");
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setFormData((previous) => ({
        ...previous,
        pdfName: file.name,
        pdfDataUrl: dataUrl,
      }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al cargar PDF.");
    }
  };

  const resetForm = () => {
    setFormData({
      venue: venueOptions[0],
      issue: "",
      priority: "MEDIUM",
      status: "PENDING",
      date: today,
      beforePhoto: "",
      afterPhoto: "",
      pdfName: "",
      pdfDataUrl: "",
    });
  };

  const handleCreateMaintenance = (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.issue.trim()) {
      toast.error("Describe el mantenimiento requerido.");
      return;
    }

    if (!formData.beforePhoto || !formData.afterPhoto) {
      toast.error("Debes adjuntar foto de antes y después.");
      return;
    }

    const newRecord: MaintenanceRecord = {
      id: String(Date.now()),
      ...formData,
      issue: formData.issue.trim(),
    };

    setMaintenance((previous) => {
      const updated = [newRecord, ...previous];
      storage.set("maintenance_records", updated);
      return updated;
    });

    setIsCreateModalOpen(false);
    resetForm();
    toast.success("Mantenimiento registrado correctamente.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Mantenimiento</h1>
        <button
          className="btn-primary flex items-center gap-2"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <PlusIcon className="w-5 h-5" />
          Registrar Mantenimiento
        </button>
      </div>

      <div className="grid gap-4">
        {maintenance.map((item) => (
          <div key={item.id} className="card p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold">{item.venue}</h3>
                <p className="text-dark-600 mt-1">{item.issue}</p>
                <p className="text-sm text-dark-500 mt-2">
                  Registrado: {new Date(item.date).toLocaleDateString()}
                </p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-dark-500 mb-2">Antes</p>
                    {item.beforePhoto ? (
                      <img
                        src={item.beforePhoto}
                        alt={`Antes - ${item.venue}`}
                        className="w-full h-36 object-cover rounded-lg border border-dark-200 dark:border-dark-700"
                      />
                    ) : (
                      <div className="h-36 rounded-lg border border-dashed border-dark-300 flex items-center justify-center text-sm text-dark-400">
                        Sin foto
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-dark-500 mb-2">Después</p>
                    {item.afterPhoto ? (
                      <img
                        src={item.afterPhoto}
                        alt={`Después - ${item.venue}`}
                        className="w-full h-36 object-cover rounded-lg border border-dark-200 dark:border-dark-700"
                      />
                    ) : (
                      <div className="h-36 rounded-lg border border-dashed border-dark-300 flex items-center justify-center text-sm text-dark-400">
                        Sin foto
                      </div>
                    )}
                  </div>
                </div>
                {item.pdfDataUrl && item.pdfName && (
                  <a
                    href={item.pdfDataUrl}
                    download={item.pdfName}
                    className="inline-flex items-center gap-2 mt-4 text-sm text-primary-600 hover:text-primary-700"
                  >
                    <DocumentArrowUpIcon className="w-4 h-4" />
                    Descargar PDF: {item.pdfName}
                  </a>
                )}
              </div>
              <div className="flex flex-col gap-2 items-end">
                <span
                  className={`px-3 py-1 text-xs rounded-full ${
                    item.priority === "HIGH"
                      ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                      : item.priority === "MEDIUM"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                        : "bg-primary-100 text-primary-800"
                  }`}
                >
                  {item.priority === "HIGH"
                    ? "Alta Prioridad"
                    : item.priority === "MEDIUM"
                      ? "Media"
                      : "Baja"}
                </span>
                <span
                  className={`px-3 py-1 text-xs rounded-full ${
                    item.status === "PENDING"
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                      : item.status === "IN_PROGRESS"
                        ? "bg-primary-100 text-primary-800"
                        : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                  }`}
                >
                  {item.status === "PENDING"
                    ? "Pendiente"
                    : item.status === "IN_PROGRESS"
                      ? "En Progreso"
                      : "Completado"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsCreateModalOpen(false)} />
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Registrar mantenimiento de escenario</h3>
              <button className="btn-ghost p-2" onClick={() => setIsCreateModalOpen(false)}>
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateMaintenance} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Escenario</label>
                  <select
                    className="input"
                    value={formData.venue}
                    onChange={(event) =>
                      setFormData((previous) => ({ ...previous, venue: event.target.value }))
                    }
                    required
                  >
                    {venueOptions.map((venue) => (
                      <option key={venue} value={venue}>
                        {venue}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Fecha</label>
                  <input
                    type="date"
                    className="input"
                    value={formData.date}
                    onChange={(event) =>
                      setFormData((previous) => ({ ...previous, date: event.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Prioridad</label>
                  <select
                    className="input"
                    value={formData.priority}
                    onChange={(event) =>
                      setFormData((previous) => ({
                        ...previous,
                        priority: event.target.value as MaintenancePriority,
                      }))
                    }
                  >
                    <option value="HIGH">Alta</option>
                    <option value="MEDIUM">Media</option>
                    <option value="LOW">Baja</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Estado</label>
                  <select
                    className="input"
                    value={formData.status}
                    onChange={(event) =>
                      setFormData((previous) => ({
                        ...previous,
                        status: event.target.value as MaintenanceStatus,
                      }))
                    }
                  >
                    <option value="PENDING">Pendiente</option>
                    <option value="IN_PROGRESS">En Progreso</option>
                    <option value="COMPLETED">Completado</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Descripción del mantenimiento</label>
                  <textarea
                    className="input min-h-[100px]"
                    value={formData.issue}
                    onChange={(event) =>
                      setFormData((previous) => ({ ...previous, issue: event.target.value }))
                    }
                    placeholder="Ej: Reparación de iluminación en tarima y limpieza profunda."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Foto antes</label>
                  <label className="flex items-center gap-2 btn-outline cursor-pointer">
                    <PhotoIcon className="w-4 h-4" />
                    Subir imagen
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => void handlePhotoUpload(event, "beforePhoto")}
                    />
                  </label>
                  {formData.beforePhoto && (
                    <img
                      src={formData.beforePhoto}
                      alt="Antes"
                      className="mt-2 w-full h-32 object-cover rounded-lg border border-dark-200 dark:border-dark-700"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Foto después</label>
                  <label className="flex items-center gap-2 btn-outline cursor-pointer">
                    <PhotoIcon className="w-4 h-4" />
                    Subir imagen
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => void handlePhotoUpload(event, "afterPhoto")}
                    />
                  </label>
                  {formData.afterPhoto && (
                    <img
                      src={formData.afterPhoto}
                      alt="Después"
                      className="mt-2 w-full h-32 object-cover rounded-lg border border-dark-200 dark:border-dark-700"
                    />
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">PDF de soporte (opcional)</label>
                  <label className="flex items-center gap-2 btn-outline cursor-pointer w-fit">
                    <DocumentArrowUpIcon className="w-4 h-4" />
                    Adjuntar PDF
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(event) => void handlePdfUpload(event)}
                    />
                  </label>
                  {formData.pdfName && (
                    <p className="text-sm text-dark-500 mt-2">Archivo: {formData.pdfName}</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Guardar mantenimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ReportsPage.tsx
export const ReportsPage: React.FC = () => {
  const { user } = useAuthStore();
  const role = normalizeRole(user?.role);
  const isStudent = role === "ESTUDIANTE";
  const studentName =
    user?.profile?.firstName && user?.profile?.lastName
      ? `${user.profile.firstName} ${user.profile.lastName}`.trim()
      : "";

  interface StudentReportRow {
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

  interface AttendanceReportRow {
    id: string;
    date: string;
    groupName: string;
    studentName: string;
    present: boolean;
  }

  interface EvaluationReportRow {
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

  const formatStatus = (status: string) =>
    status === "ACTIVE" ? "Activo" : "Inactivo";

  const formatGender = (gender: string) => {
    if (gender === "MALE") return "Masculino";
    if (gender === "FEMALE") return "Femenino";
    return gender || "N/A";
  };

  const getStudentsForReport = async () => {
    if (isStudent) {
      throw new Error("Como estudiante solo puedes descargar reportes de asistencia y evaluaciones.");
    }
    const students = storage.get<StudentReportRow[]>("students") || [];

    if (students.length === 0) {
      throw new Error("No hay estudiantes cargados para generar el reporte.");
    }

    return students;
  };

  const getAttendanceForReport = async () => {
    const attendance = storage.get<AttendanceReportRow[]>("attendance_records") || [];
    if (attendance.length > 0) {
      if (!isStudent) return attendance;
      const filteredByStudent = attendance.filter((item) =>
        studentName ? item.studentName.toLowerCase().includes(studentName.toLowerCase()) : false,
      );
      return filteredByStudent.length > 0
        ? filteredByStudent
        : [
            {
              id: "A-STUDENT",
              date: new Date().toISOString().split("T")[0],
              groupName: "Curso asignado",
              studentName: studentName || user?.email || "Estudiante",
              present: true,
            },
          ];
    }

    const seedAttendance: AttendanceReportRow[] = [
      {
        id: "A-1",
        date: new Date().toISOString().split("T")[0],
        groupName: "Grupo A - Ballet",
        studentName: "Ana Martínez",
        present: true,
      },
      {
        id: "A-2",
        date: new Date().toISOString().split("T")[0],
        groupName: "Grupo A - Ballet",
        studentName: "Carlos Rojas",
        present: false,
      },
      {
        id: "A-3",
        date: new Date().toISOString().split("T")[0],
        groupName: "Grupo B - Guitarra",
        studentName: "Laura Gómez",
        present: true,
      },
    ];
    storage.set("attendance_records", seedAttendance);
    const baseData = seedAttendance;
    if (!isStudent) return baseData;
    const filteredByStudent = baseData.filter((item) =>
      studentName ? item.studentName.toLowerCase().includes(studentName.toLowerCase()) : false,
    );
    return filteredByStudent.length > 0
      ? filteredByStudent
      : [
          {
            id: "A-STUDENT",
            date: new Date().toISOString().split("T")[0],
            groupName: "Curso asignado",
            studentName: studentName || user?.email || "Estudiante",
            present: true,
          },
        ];
  };

  const getEvaluationsForReport = async () => {
    const evaluations = storage.get<EvaluationReportRow[]>("evaluations") || [];
    if (evaluations.length > 0) {
      if (!isStudent) return evaluations;
      const filteredByStudent = evaluations.filter((item) =>
        studentName ? item.studentName.toLowerCase().includes(studentName.toLowerCase()) : false,
      );
      return filteredByStudent.length > 0
        ? filteredByStudent
        : [
            {
              id: "E-STUDENT",
              studentName: studentName || user?.email || "Estudiante",
              date: new Date().toISOString().split("T")[0],
              creativity: 4,
              technique: 4,
              participation: 4,
              progress: 4,
              average: 4,
              comments: "Reporte individual generado para estudiante.",
            },
          ];
    }

    const seedEvaluations: EvaluationReportRow[] = [
      {
        id: "E-1",
        studentName: "Ana Martínez",
        date: new Date().toISOString().split("T")[0],
        creativity: 5,
        technique: 4,
        participation: 5,
        progress: 4,
        average: 4.5,
        comments: "Excelente progreso técnico.",
      },
      {
        id: "E-2",
        studentName: "Carlos Rojas",
        date: new Date().toISOString().split("T")[0],
        creativity: 4,
        technique: 4,
        participation: 4,
        progress: 4,
        average: 4,
        comments: "Buen desempeño general.",
      },
    ];
    storage.set("evaluations", seedEvaluations);
    const baseData = seedEvaluations;
    if (!isStudent) return baseData;
    const filteredByStudent = baseData.filter((item) =>
      studentName ? item.studentName.toLowerCase().includes(studentName.toLowerCase()) : false,
    );
    return filteredByStudent.length > 0
      ? filteredByStudent
      : [
          {
            id: "E-STUDENT",
            studentName: studentName || user?.email || "Estudiante",
            date: new Date().toISOString().split("T")[0],
            creativity: 4,
            technique: 4,
            participation: 4,
            progress: 4,
            average: 4,
            comments: "Reporte individual generado para estudiante.",
          },
        ];
  };

  const downloadFile = (filename: string, content: BlobPart, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const buildStudentsCsv = (students: StudentReportRow[]) => {
    const headers = [
      "ID",
      "Tipo Documento",
      "Número Documento",
      "Nombre",
      "Apellido",
      "Correo",
      "Teléfono",
      "Fecha Nacimiento",
      "Género",
      "Ciudad",
      "Dirección",
      "Estado Matrícula",
      "Fecha Registro",
    ];

    const escape = (value: unknown) =>
      `"${String(value ?? "").replaceAll('"', '""')}"`;

    const rows = students.map((student) =>
      [
        student.id,
        student.documentType,
        student.documentNumber,
        student.firstName,
        student.lastName,
        student.email,
        student.phone,
        student.birthDate,
        formatGender(student.gender),
        student.city,
        student.address,
        formatStatus(student.enrollmentStatus),
        new Date(student.createdAt).toLocaleDateString("es-CO"),
      ]
        .map(escape)
        .join(","),
    );

    return [headers.join(","), ...rows].join("\n");
  };

  const buildAttendanceCsv = (attendance: AttendanceReportRow[]) => {
    const headers = ["ID", "Fecha", "Grupo", "Estudiante", "Asistencia"];
    const escape = (value: unknown) =>
      `"${String(value ?? "").replaceAll('"', '""')}"`;

    const rows = attendance.map((record) =>
      [
        record.id,
        new Date(record.date).toLocaleDateString("es-CO"),
        record.groupName,
        record.studentName,
        record.present ? "Presente" : "Ausente",
      ]
        .map(escape)
        .join(","),
    );
    return [headers.join(","), ...rows].join("\n");
  };

  const buildEvaluationsCsv = (evaluations: EvaluationReportRow[]) => {
    const headers = [
      "ID",
      "Fecha",
      "Estudiante",
      "Creatividad",
      "Técnica",
      "Participación",
      "Progreso",
      "Promedio",
      "Observaciones",
    ];
    const escape = (value: unknown) =>
      `"${String(value ?? "").replaceAll('"', '""')}"`;

    const rows = evaluations.map((record) =>
      [
        record.id,
        new Date(record.date).toLocaleDateString("es-CO"),
        record.studentName,
        record.creativity,
        record.technique,
        record.participation,
        record.progress,
        record.average,
        record.comments || "",
      ]
        .map(escape)
        .join(","),
    );
    return [headers.join(","), ...rows].join("\n");
  };

  const handleDownloadStudentsExcel = async () => {
    try {
      const students = await getStudentsForReport();
      const csv = buildStudentsCsv(students);
      const timestamp = new Date().toISOString().slice(0, 10);
      downloadFile(
        `reporte-estudiantes-${timestamp}.csv`,
        "\uFEFF" + csv,
        "text/csv;charset=utf-8;",
      );
      toast.success("Reporte de estudiantes en Excel descargado");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al generar el reporte";
      toast.error(message);
    }
  };

  const handleDownloadStudentsPdf = async () => {
    try {
      const students = await getStudentsForReport();
      const timestamp = new Date().toISOString().slice(0, 10);
      const generatedAt = new Date().toLocaleString("es-CO");

      const rowsHtml = students
        .map(
          (student) => `
            <tr>
              <td>${student.documentType} ${student.documentNumber}</td>
              <td>${student.firstName} ${student.lastName}</td>
              <td>${student.email}</td>
              <td>${student.phone}</td>
              <td>${student.city}</td>
              <td>${formatStatus(student.enrollmentStatus)}</td>
            </tr>
          `,
        )
        .join("");

      const printableWindow = window.open("", "_blank");
      if (!printableWindow) {
        throw new Error("No se pudo abrir la ventana para generar el PDF.");
      }

      printableWindow.document.write(`
        <html>
          <head>
            <title>Reporte de Estudiantes</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 24px; color: #1e293b; }
              h1 { margin: 0 0 8px; font-size: 24px; }
              p { margin: 0 0 16px; font-size: 13px; color: #475569; }
              table { width: 100%; border-collapse: collapse; font-size: 12px; }
              th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; vertical-align: top; }
              th { background: #f8fafc; font-weight: 700; }
              tr:nth-child(even) td { background: #f8fafc; }
            </style>
          </head>
          <body>
            <h1>Reporte de Estudiantes</h1>
            <p>Generado: ${generatedAt} · Total estudiantes: ${students.length}</p>
            <table>
              <thead>
                <tr>
                  <th>Documento</th>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Teléfono</th>
                  <th>Ciudad</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
          </body>
        </html>
      `);

      printableWindow.document.close();
      printableWindow.focus();
      printableWindow.print();
      printableWindow.document.title = `reporte-estudiantes-${timestamp}`;
      toast.success("Vista de impresión del reporte PDF abierta");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al generar el PDF";
      toast.error(message);
    }
  };

  const handleGenerateStudentsReport = async () => {
    try {
      const students = await getStudentsForReport();
      toast.success(`Reporte listo con ${students.length} estudiantes cargados`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al generar el reporte";
      toast.error(message);
    }
  };

  const openPrintableReport = (title: string, subtitle: string, header: string[], rows: string[][]) => {
    const printableWindow = window.open("", "_blank");
    if (!printableWindow) {
      throw new Error("No se pudo abrir la ventana para generar el PDF.");
    }

    const rowsHtml = rows
      .map(
        (row) => `
          <tr>
            ${row.map((cell) => `<td>${cell}</td>`).join("")}
          </tr>
        `,
      )
      .join("");

    printableWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 24px; color: #1e293b; }
            h1 { margin: 0 0 8px; font-size: 24px; }
            p { margin: 0 0 16px; font-size: 13px; color: #475569; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; vertical-align: top; }
            th { background: #f8fafc; font-weight: 700; }
            tr:nth-child(even) td { background: #f8fafc; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <p>${subtitle}</p>
          <table>
            <thead>
              <tr>${header.map((item) => `<th>${item}</th>`).join("")}</tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </body>
      </html>
    `);
    printableWindow.document.close();
    printableWindow.focus();
    printableWindow.print();
  };

  const handleDownloadAttendanceExcel = async () => {
    try {
      const attendance = await getAttendanceForReport();
      const csv = buildAttendanceCsv(attendance);
      const timestamp = new Date().toISOString().slice(0, 10);
      downloadFile(
        `reporte-asistencia-${timestamp}.csv`,
        "\uFEFF" + csv,
        "text/csv;charset=utf-8;",
      );
      toast.success("Reporte de asistencia en Excel descargado");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al generar reporte de asistencia");
    }
  };

  const handleDownloadAttendancePdf = async () => {
    try {
      const attendance = await getAttendanceForReport();
      const subtitle = `Generado: ${new Date().toLocaleString("es-CO")} · Registros: ${attendance.length}`;
      openPrintableReport(
        "Reporte de Asistencia",
        subtitle,
        ["Fecha", "Grupo", "Estudiante", "Asistencia"],
        attendance.map((record) => [
          new Date(record.date).toLocaleDateString("es-CO"),
          record.groupName,
          record.studentName,
          record.present ? "Presente" : "Ausente",
        ]),
      );
      toast.success("Vista de impresión del reporte de asistencia abierta");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al generar PDF de asistencia");
    }
  };

  const handleGenerateAttendanceReport = async () => {
    try {
      const attendance = await getAttendanceForReport();
      const present = attendance.filter((item) => item.present).length;
      const rate = attendance.length > 0 ? ((present / attendance.length) * 100).toFixed(1) : "0";
      toast.success(`Asistencia: ${present}/${attendance.length} (${rate}%)`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al generar resumen de asistencia");
    }
  };

  const handleDownloadEvaluationsExcel = async () => {
    try {
      const evaluations = await getEvaluationsForReport();
      const csv = buildEvaluationsCsv(evaluations);
      const timestamp = new Date().toISOString().slice(0, 10);
      downloadFile(
        `reporte-evaluaciones-${timestamp}.csv`,
        "\uFEFF" + csv,
        "text/csv;charset=utf-8;",
      );
      toast.success("Reporte de evaluaciones en Excel descargado");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al generar reporte de evaluaciones");
    }
  };

  const handleDownloadEvaluationsPdf = async () => {
    try {
      const evaluations = await getEvaluationsForReport();
      const subtitle = `Generado: ${new Date().toLocaleString("es-CO")} · Registros: ${evaluations.length}`;
      openPrintableReport(
        "Reporte de Evaluaciones",
        subtitle,
        ["Fecha", "Estudiante", "Creat.", "Téc.", "Part.", "Prog.", "Promedio"],
        evaluations.map((record) => [
          new Date(record.date).toLocaleDateString("es-CO"),
          record.studentName,
          String(record.creativity),
          String(record.technique),
          String(record.participation),
          String(record.progress),
          String(record.average),
        ]),
      );
      toast.success("Vista de impresión del reporte de evaluaciones abierta");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al generar PDF de evaluaciones");
    }
  };

  const handleGenerateEvaluationsReport = async () => {
    try {
      const evaluations = await getEvaluationsForReport();
      const average =
        evaluations.length > 0
          ? (
              evaluations.reduce((sum, item) => sum + Number(item.average || 0), 0) /
              evaluations.length
            ).toFixed(2)
          : "0";
      toast.success(`Promedio general de evaluaciones: ${average}/5`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al generar resumen de evaluaciones");
    }
  };

  const reportTypes = [
    {
      id: "students",
      name: "Reporte de Estudiantes",
      description: "Listado completo de estudiantes matriculados",
      icon: <UserGroupIcon className="w-10 h-10 text-primary-600 dark:text-primary-400" />,
    },
    {
      id: "attendance",
      name: "Reporte de Asistencia",
      description: "Estadísticas de asistencia por grupo",
      icon: <ChartBarIcon className="w-10 h-10 text-cyan-600 dark:text-cyan-400" />,
    },
    {
      id: "grades",
      name: "Reporte de Evaluaciones",
      description: "Notas y evaluaciones cualitativas",
      icon: <DocumentTextIcon className="w-10 h-10 text-amber-600 dark:text-amber-400" />,
    },
  ].filter((report) => (isStudent ? report.id !== "students" : true));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reportes</h1>
        <p className="text-dark-500 mt-1">
          Generación de informes y estadísticas
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportTypes.map((report) => (
          <div key={report.id} className="card p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-dark-100 dark:bg-dark-700">
                {report.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-2">{report.name}</h3>
                <p className="text-sm text-dark-600 mb-4">
                  {report.description}
                </p>
                <div className="flex gap-2">
                  <button
                    className="btn-secondary flex items-center gap-2"
                    onClick={
                      report.id === "students"
                        ? handleDownloadStudentsPdf
                        : report.id === "attendance"
                          ? handleDownloadAttendancePdf
                          : handleDownloadEvaluationsPdf
                    }
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    PDF
                  </button>
                  <button
                    className="btn-secondary flex items-center gap-2"
                    onClick={
                      report.id === "students"
                        ? handleDownloadStudentsExcel
                        : report.id === "attendance"
                          ? handleDownloadAttendanceExcel
                          : handleDownloadEvaluationsExcel
                    }
                  >
                    <TableCellsIcon className="w-4 h-4" />
                    Excel
                  </button>
                  <button
                    className="btn-primary flex items-center gap-2"
                    onClick={
                      report.id === "students"
                        ? handleGenerateStudentsReport
                        : report.id === "attendance"
                          ? handleGenerateAttendanceReport
                          : handleGenerateEvaluationsReport
                    }
                  >
                    <PlayIcon className="w-4 h-4" />
                    Generar
                  </button>
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
  const navigate = useNavigate();
  const { darkMode, setDarkMode, theme, setTheme } = useUIStore();

  const themes: Array<{ value: ThemeName; name: string; description: string }> = [
    { value: "lucy", name: "Lucy (Predeterminado)", description: "Morados y naranjas institucionales." },
    { value: "ocean", name: "Océano", description: "Azules y cian con look moderno." },
    { value: "sunset", name: "Atardecer", description: "Rosas y naranjas cálidos." },
    { value: "forest", name: "Bosque", description: "Verdes suaves de alto contraste." },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-dark-500 mt-1">
          Ajustes del sistema y perfil de usuario
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-bold mb-4">Perfil de Usuario</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre</label>
              <input
                type="text"
                defaultValue="Administrador"
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                defaultValue="admin@lucytejada.gov.co"
                className="input w-full"
              />
            </div>
            <button className="btn-primary w-full">Guardar Cambios</button>
            <button
              type="button"
              className="btn-secondary w-full"
              onClick={() => navigate("/profile")}
            >
              Ir al perfil completo
            </button>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-bold mb-4">Preferencias</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Modo Oscuro</span>
              <button
                type="button"
                onClick={() => setDarkMode(!darkMode)}
                className={`w-12 h-6 rounded-full relative transition-colors ${
                  darkMode ? "bg-primary-600" : "bg-dark-300"
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                    darkMode ? "right-1" : "left-1"
                  }`}
                ></span>
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tema visual</label>
              <select
                className="input w-full"
                value={theme}
                onChange={(event) => setTheme(event.target.value as ThemeName)}
              >
                {themes.map((themeOption) => (
                  <option key={themeOption.value} value={themeOption.value}>
                    {themeOption.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-dark-500 mt-2">
                {themes.find((themeOption) => themeOption.value === theme)?.description}
              </p>
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
              <label className="block text-sm font-medium mb-1">
                Contraseña Actual
              </label>
              <input type="password" className="input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Nueva Contraseña
              </label>
              <input type="password" className="input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Confirmar Contraseña
              </label>
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
              <span className="font-semibold">
                {new Date().toLocaleDateString()}
              </span>
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

// ProfilePage.tsx
export const ProfilePage: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const LOCKED_FIRST_NAME = "Administrador";
  const LOCKED_LAST_NAME = "Lucy Tejada";
  const LOCKED_EMAIL = user?.email?.trim() || "admin@lucytejada.gov.co";

  const currentProfile = useMemo(
    () =>
      user?.profile ?? {
        firstName: "",
        lastName: "",
      },
    [user]
  );

  const [profileForm, setProfileForm] = useState<UserProfile>({
    firstName: LOCKED_FIRST_NAME,
    lastName: LOCKED_LAST_NAME,
    photoUrl: currentProfile.photoUrl,
    identification: currentProfile.identification,
    phone: currentProfile.phone,
    city: currentProfile.city,
    position: currentProfile.position,
    bio: currentProfile.bio,
  });

  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
      reader.readAsDataURL(file);
    });

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Selecciona una imagen válida.");
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setProfileForm((prev) => ({ ...prev, photoUrl: dataUrl }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al cargar imagen.");
    }
  };

  const handleSaveProfile = (event: React.FormEvent) => {
    event.preventDefault();

    if (!user) {
      toast.error("No hay sesión activa.");
      return;
    }

    const sanitizedProfile: UserProfile = {
      ...profileForm,
      firstName: LOCKED_FIRST_NAME,
      lastName: LOCKED_LAST_NAME,
      identification: profileForm.identification?.trim() || "",
      phone: profileForm.phone?.trim() || "",
      city: profileForm.city?.trim() || "",
      position: profileForm.position?.trim() || "",
      bio: profileForm.bio?.trim() || "",
      photoUrl: profileForm.photoUrl || "",
    };

    setUser({
      ...user,
      email: LOCKED_EMAIL,
      profile: {
        ...(user.profile ?? { firstName: "", lastName: "" }),
        ...sanitizedProfile,
      },
    });

    toast.success("Perfil actualizado correctamente.");
  };

  if (!user) {
    return (
      <div className="card p-6">
        <p className="text-dark-500">No hay usuario autenticado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Perfil</h1>
        <p className="text-dark-500 mt-1">
          Gestiona tu información personal visible en la aplicación
        </p>
      </div>

      <form onSubmit={handleSaveProfile} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6 lg:col-span-1">
          <h3 className="text-lg font-bold mb-4">Foto de perfil</h3>
          <div className="flex flex-col items-center gap-4">
            <div className="w-28 h-28 rounded-full bg-primary-100 dark:bg-primary-900/30 overflow-hidden flex items-center justify-center">
              {profileForm.photoUrl ? (
                <img
                  src={profileForm.photoUrl}
                  alt={profileForm.firstName || "Perfil"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserCircleIcon className="w-20 h-20 text-primary-500" />
              )}
            </div>
            <label className="btn-secondary cursor-pointer">
              Cambiar imagen
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </label>
          </div>
        </div>

        <div className="card p-6 lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold">Información personal</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre</label>
              <input
                type="text"
                className="input w-full"
                value={LOCKED_FIRST_NAME}
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Apellido</label>
              <input
                type="text"
                className="input w-full"
                value={LOCKED_LAST_NAME}
                disabled
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                <IdentificationIcon className="w-4 h-4 text-dark-500" />
                Identificación
              </label>
              <input
                type="text"
                className="input w-full"
                value={profileForm.identification ?? ""}
                onChange={(event) =>
                  setProfileForm((prev) => ({ ...prev, identification: event.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                <EnvelopeIcon className="w-4 h-4 text-dark-500" />
                Correo
              </label>
              <input
                type="email"
                className="input w-full"
                value={LOCKED_EMAIL}
                disabled
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                <DevicePhoneMobileIcon className="w-4 h-4 text-dark-500" />
                Teléfono
              </label>
              <input
                type="text"
                className="input w-full"
                value={profileForm.phone ?? ""}
                onChange={(event) =>
                  setProfileForm((prev) => ({ ...prev, phone: event.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                <BuildingOffice2Icon className="w-4 h-4 text-dark-500" />
                Cargo
              </label>
              <input
                type="text"
                className="input w-full"
                value={profileForm.position ?? ""}
                onChange={(event) =>
                  setProfileForm((prev) => ({ ...prev, position: event.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                <MapPinIcon className="w-4 h-4 text-dark-500" />
                Ciudad
              </label>
              <input
                type="text"
                className="input w-full"
                value={profileForm.city ?? ""}
                onChange={(event) =>
                  setProfileForm((prev) => ({ ...prev, city: event.target.value }))
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Biografía corta</label>
            <textarea
              rows={4}
              className="input w-full resize-none"
              value={profileForm.bio ?? ""}
              onChange={(event) =>
                setProfileForm((prev) => ({ ...prev, bio: event.target.value }))
              }
            />
          </div>

          <div className="flex justify-end">
            <button type="submit" className="btn-primary">
              Guardar perfil
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
