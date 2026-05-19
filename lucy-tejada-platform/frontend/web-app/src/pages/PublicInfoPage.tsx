import React from "react";
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

export const PublicInfoPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <section className="card p-6 md:p-8">
        <h1 className="text-3xl font-bold">Información y Políticas</h1>
        <p className="mt-2 text-dark-500">
          Información general, datos de contacto y políticas de tratamiento de datos personales.
        </p>
      </section>

      <section className="card p-6 md:p-8">
        <h2 className="text-2xl font-bold mb-6">Información General</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-3">Sobre nosotros</h3>
            <p className="text-dark-600 dark:text-dark-300 leading-relaxed">
              El Centro Cultural Lucy Tejada es un espacio dedicado a la promoción, enseñanza y difusión de
              las artes y la cultura. Ofrecemos cursos, escenarios para presentaciones y la posibilidad de
              reservar espacios para eventos culturales.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3">Horarios de atención</h3>
            <ul className="space-y-2 text-dark-600 dark:text-dark-300">
              <li>
                <span className="font-medium">Lunes a Viernes:</span> 8:00 AM - 6:00 PM
              </li>
              <li>
                <span className="font-medium">Sábados:</span> 9:00 AM - 4:00 PM
              </li>
              <li>
                <span className="font-medium">Domingos:</span> Cerrado
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="card p-6 md:p-8">
        <h2 className="text-2xl font-bold mb-6">Contacto</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a
            href="mailto:info@lucytejada.com"
            className="group p-4 rounded-lg border border-dark-200 dark:border-dark-700 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors"
          >
            <div className="flex items-center gap-3 mb-2">
              <EnvelopeIcon className="h-5 w-5 text-primary-500 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Correo</span>
            </div>
            <p className="text-sm text-dark-600 dark:text-dark-400">info@lucytejada.com</p>
          </a>

          <a
            href="tel:+573001234567"
            className="group p-4 rounded-lg border border-dark-200 dark:border-dark-700 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors"
          >
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

      <section className="card p-6 md:p-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <ShieldCheckIcon className="h-6 w-6 text-primary-500" />
          Tratamiento de datos personales
        </h2>
        <div className="space-y-3 text-dark-600 dark:text-dark-300 leading-relaxed">
          <p>
            El uso de esta plataforma implica el tratamiento de datos personales con fines académicos,
            administrativos y de gestión cultural (inscripciones, asistencia, evaluaciones, reservas y
            comunicaciones).
          </p>
          <p>
            Solo se recolectan los datos necesarios para prestar el servicio. Los datos se usan para
            comunicación de novedades, procesos internos y operación de la plataforma.
          </p>
          <p>
            Si requieres actualización, corrección o eliminación de información, comunícate a través del
            canal de contacto.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <article className="card p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <LockClosedIcon className="h-6 w-6 text-primary-500" />
            Seguridad
          </h2>
          <ul className="space-y-2 text-dark-600 dark:text-dark-300">
            <li>• No compartas tu contraseña y cierra sesión en equipos públicos.</li>
            <li>• Mantén tu información de contacto actualizada.</li>
            <li>• Si detectas actividad sospechosa, repórtala al administrador.</li>
          </ul>
        </article>

        <article className="card p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <DocumentTextIcon className="h-6 w-6 text-primary-500" />
            Cookies y políticas
          </h2>
          <div className="space-y-3 text-dark-600 dark:text-dark-300 leading-relaxed">
            <p>
              La plataforma puede usar almacenamiento local del navegador para recordar preferencias (por
              ejemplo, el tema) y para el funcionamiento de la aplicación.
            </p>
            <p>
              El contenido de políticas (términos, privacidad, cookies) puede ser actualizado por la
              administración cuando sea necesario.
            </p>
          </div>
        </article>
      </section>
    </div>
  );
};

export default PublicInfoPage;
