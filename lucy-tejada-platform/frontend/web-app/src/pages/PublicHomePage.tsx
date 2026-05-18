import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { storage } from "@/services/mockApi";
import { useAuthStore } from "@/store/authStore";
import { BookOpenIcon, BuildingOfficeIcon, CalendarDaysIcon, ArrowRightIcon, Cog6ToothIcon, MoonIcon, LanguageIcon, EnvelopeIcon, PhoneIcon, MapPinIcon } from "@heroicons/react/24/outline";

interface ProgramPreview {
  id: string;
  name: string;
  area: string;
  level: string;
}

interface VenuePreview {
  id: string;
  name: string;
  type: string;
  status: string;
}

interface ReservationPreview {
  id: string;
  eventName: string;
  venueName: string;
  date: string;
  status: string;
}

const formatStatus = (status: string) => {
  if (status === "APPROVED") return "Aprobada";
  if (status === "PENDING") return "Pendiente";
  if (status === "AVAILABLE") return "Disponible";
  if (status === "MAINTENANCE") return "Mantenimiento";
  if (status === "UNAVAILABLE") return "No disponible";
  return status;
};

const toDisplayDate = (value: string) => {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("es-CO");
};

export const PublicHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [programs, setPrograms] = useState<ProgramPreview[]>([]);
  const [venues, setVenues] = useState<VenuePreview[]>([]);
  const [reservations, setReservations] = useState<ReservationPreview[]>([]);

  useEffect(() => {
    setPrograms(storage.get<ProgramPreview[]>("programs") || []);
    setVenues(storage.get<VenuePreview[]>("venues") || []);
    setReservations(storage.get<ReservationPreview[]>("reservations") || []);
  }, []);

  const quickStats = useMemo(
    () => [
      { label: "Cursos", value: programs.length, icon: BookOpenIcon },
      { label: "Escenarios", value: venues.length, icon: BuildingOfficeIcon },
      { label: "Reservas", value: reservations.length, icon: CalendarDaysIcon },
    ],
    [programs.length, reservations.length, venues.length],
  );

  return (
    <div className="space-y-6">
      <section className="card p-6 md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Portal Cultural Lucy Tejada</h1>
            <p className="mt-2 text-dark-500">
              Explora cursos, escenarios y reservas. Gestiona tu experiencia cultural.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {!user && (
              <button className="btn-primary" onClick={() => navigate("/login")}>
                Ya tengo usuario
              </button>
            )}
            <Link to="/programs" className="btn-outline">
              Ver catálogo
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {quickStats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-dark-500">{label}</p>
              <Icon className="h-5 w-5 text-primary-500" />
            </div>
            <p className="mt-2 text-3xl font-bold">{value}</p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <article className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Cursos</h2>
            <Link to="/programs" className="text-primary-600 hover:text-primary-500 inline-flex items-center gap-1">
              Ver todos <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {programs.slice(0, 4).map((program) => (
              <div key={program.id} className="rounded-xl border border-dark-200 dark:border-dark-700 p-3">
                <p className="font-medium">{program.name}</p>
                <p className="text-sm text-dark-500">
                  {program.area} · {program.level}
                </p>
              </div>
            ))}
            {programs.length === 0 && <p className="text-sm text-dark-500">No hay cursos publicados aún.</p>}
          </div>
        </article>

        <article className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Escenarios</h2>
            <Link to="/venues" className="text-primary-600 hover:text-primary-500 inline-flex items-center gap-1">
              Ver todos <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {venues.slice(0, 4).map((venue) => (
              <div key={venue.id} className="rounded-xl border border-dark-200 dark:border-dark-700 p-3">
                <p className="font-medium">{venue.name}</p>
                <p className="text-sm text-dark-500">
                  {venue.type} · {formatStatus(venue.status)}
                </p>
              </div>
            ))}
            {venues.length === 0 && <p className="text-sm text-dark-500">No hay escenarios disponibles aún.</p>}
          </div>
        </article>

        <article className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Reservas</h2>
            <Link to="/reservations" className="text-primary-600 hover:text-primary-500 inline-flex items-center gap-1">
              Ver todas <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {reservations.slice(0, 4).map((reservation) => (
              <div key={reservation.id} className="rounded-xl border border-dark-200 dark:border-dark-700 p-3">
                <p className="font-medium">{reservation.eventName}</p>
                <p className="text-sm text-dark-500">
                  {reservation.venueName} · {toDisplayDate(reservation.date)} · {formatStatus(reservation.status)}
                </p>
              </div>
            ))}
            {reservations.length === 0 && <p className="text-sm text-dark-500">No hay reservas registradas aún.</p>}
          </div>
        </article>
      </section>

      {/* Información General */}
      <section className="card p-6 md:p-8">
        <h2 className="text-2xl font-bold mb-6">Información General</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-3">Sobre Nosotros</h3>
            <p className="text-dark-600 dark:text-dark-300 leading-relaxed">
              El Centro Cultural Lucy Tejada es un espacio dedicado a la promoción, enseñanza y difusión 
              de las artes y la cultura. Ofrecemos cursos, escenarios para presentaciones y la posibilidad 
              de reservar espacios para eventos culturales.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3">Horarios de Atención</h3>
            <ul className="space-y-2 text-dark-600 dark:text-dark-300">
              <li><span className="font-medium">Lunes a Viernes:</span> 8:00 AM - 6:00 PM</li>
              <li><span className="font-medium">Sábados:</span> 9:00 AM - 4:00 PM</li>
              <li><span className="font-medium">Domingos:</span> Cerrado</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Contacto */}
      <section className="card p-6 md:p-8">
        <h2 className="text-2xl font-bold mb-6">Contacto</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a href="mailto:info@lucytejada.com" className="group p-4 rounded-lg border border-dark-200 dark:border-dark-700 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <EnvelopeIcon className="h-5 w-5 text-primary-500 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Correo</span>
            </div>
            <p className="text-sm text-dark-600 dark:text-dark-400">info@lucytejada.com</p>
          </a>
          
          <a href="tel:+573001234567" className="group p-4 rounded-lg border border-dark-200 dark:border-dark-700 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <PhoneIcon className="h-5 w-5 text-primary-500 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Teléfono</span>
            </div>
            <p className="text-sm text-dark-600 dark:text-dark-400">+57 (300) 123-4567</p>
          </a>
          
          <div className="group p-4 rounded-lg border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800/50">
            <div className="flex items-center gap-3 mb-2">
              <MapPinIcon className="h-5 w-5 text-primary-500" />
              <span className="font-medium">Ubicación</span>
            </div>
            <p className="text-sm text-dark-600 dark:text-dark-400">Calle Principal 123, Ciudad</p>
          </div>
        </div>
      </section>

      {/* Configuración Pública */}
      <section className="card p-6 md:p-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Cog6ToothIcon className="h-6 w-6 text-primary-500" />
          Preferencias de la Plataforma
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/settings/theme" className="group p-5 rounded-lg border-2 border-dark-200 dark:border-dark-700 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MoonIcon className="h-6 w-6 text-primary-500 group-hover:scale-110 transition-transform" />
                <div>
                  <p className="font-semibold">Tema</p>
                  <p className="text-sm text-dark-500">Oscuro, claro o automático</p>
                </div>
              </div>
              <ArrowRightIcon className="h-5 w-5 text-dark-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>

          <Link to="/settings/language" className="group p-5 rounded-lg border-2 border-dark-200 dark:border-dark-700 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <LanguageIcon className="h-6 w-6 text-primary-500 group-hover:scale-110 transition-transform" />
                <div>
                  <p className="font-semibold">Idioma</p>
                  <p className="text-sm text-dark-500">Español, Inglés o más</p>
                </div>
              </div>
              <ArrowRightIcon className="h-5 w-5 text-dark-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default PublicHomePage;
