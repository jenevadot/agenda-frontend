import {
  Calendar,
  Clock,
  MapPin,
  Scissors,
  User,
  Phone,
  Mail,
} from 'lucide-react';
import { parseISO, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '../../lib/utils';
import { Button } from '../comunes';
import { formatearFechaMostrar, formatearHoraDesdeISO } from '../../utils/fecha';
import type { CitaCompleta, EstadoCita } from '../../api/citas';

interface DetalleCitaProps {
  cita: CitaCompleta;
  onCancelar?: () => void;
  onEditar?: () => void;
  isCancelando?: boolean;
}

/**
 * Get status configuration for display
 */
function obtenerConfigEstado(estado: EstadoCita) {
  const config: Record<
    EstadoCita,
    { label: string; bgClass: string; textClass: string; description?: string }
  > = {
    confirmada: {
      label: 'Confirmada',
      bgClass: 'bg-success-light',
      textClass: 'text-green-800',
      description: 'Tu cita esta confirmada',
    },
    pendiente_actualizacion: {
      label: 'En edicion',
      bgClass: 'bg-info-light',
      textClass: 'text-blue-800',
      description: 'Esta cita esta siendo editada',
    },
    cancelada: {
      label: 'Cancelada',
      bgClass: 'bg-error-light',
      textClass: 'text-red-800',
      description: 'Esta cita fue cancelada',
    },
    completada: {
      label: 'Completada',
      bgClass: 'bg-gray-100',
      textClass: 'text-gray-700',
      description: 'Esta cita ya fue completada',
    },
    no_show: {
      label: 'No asistio',
      bgClass: 'bg-purple-100',
      textClass: 'text-purple-800',
      description: 'No asististe a esta cita',
    },
  };

  return config[estado] || config.confirmada;
}

/**
 * Calculate duration in minutes
 */
function calcularDuracion(inicio: string, fin: string): number {
  const fechaInicio = parseISO(inicio);
  const fechaFin = parseISO(fin);
  return Math.round((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60));
}

/**
 * DetalleCita component
 * Full appointment details view
 * Implements RF-FE-034, RF-FE-035, RF-FE-036
 */
export function DetalleCita({
  cita,
  onCancelar,
  onEditar,
  isCancelando,
}: DetalleCitaProps) {
  const configEstado = obtenerConfigEstado(cita.estado);
  const duracion = calcularDuracion(cita.fechaHoraInicio, cita.fechaHoraFin);

  const puedeModificar =
    cita.estado === 'confirmada' || cita.estado === 'pendiente_actualizacion';

  const fechaCita = parseISO(cita.fechaHoraInicio);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Status banner */}
      <div className={cn('px-6 py-4', configEstado.bgClass)}>
        <div className="flex items-center justify-between">
          <div>
            <span className={cn('font-semibold', configEstado.textClass)}>
              {configEstado.label}
            </span>
            {configEstado.description && (
              <p className={cn('text-sm mt-1', configEstado.textClass, 'opacity-80')}>
                {configEstado.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation code highlight */}
      <div className="bg-gray-50 px-6 py-5 text-center border-b">
        <p className="text-sm text-gray-500 mb-1">Codigo de confirmacion</p>
        <p className="text-2xl font-bold text-gray-900 font-mono tracking-wider">
          {cita.numeroConfirmacion}
        </p>
      </div>

      {/* Main content */}
      <div className="p-6 space-y-6">
        {/* Service */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            {cita.servicio.nombre}
          </h2>
          <p className="text-gray-600">{cita.negocio.nombre}</p>
        </div>

        {/* Appointment details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Fecha</p>
              <p className="font-medium text-gray-900">
                {formatearFechaMostrar(fechaCita)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Horario</p>
              <p className="font-medium text-gray-900">
                {formatearHoraDesdeISO(cita.fechaHoraInicio)} -{' '}
                {formatearHoraDesdeISO(cita.fechaHoraFin)}
              </p>
              <p className="text-xs text-gray-500">{duracion} minutos</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Scissors className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Profesional</p>
              <p className="font-medium text-gray-900">{cita.personal.nombre}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Lugar</p>
              <p className="font-medium text-gray-900">{cita.negocio.nombre}</p>
            </div>
          </div>
        </div>

        {/* Contact info */}
        <div className="border-t pt-6">
          <h3 className="font-medium text-gray-900 mb-4">Datos de contacto</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{cita.clienteNombre}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{cita.clienteEmail}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{cita.clienteTelefono}</span>
            </div>
          </div>
        </div>

        {/* Booking info */}
        <div className="border-t pt-4 text-xs text-gray-500">
          <p>
            Reservada el{' '}
            {format(parseISO(cita.creadoEn), "d 'de' MMMM 'a las' HH:mm", {
              locale: es,
            })}
          </p>
        </div>
      </div>

      {/* Actions */}
      {puedeModificar && (onCancelar || onEditar) && (
        <div className="px-6 pb-6 pt-2 border-t flex gap-3">
          {onEditar && (
            <Button
              variant="secondary"
              className="flex-1"
              onClick={onEditar}
              disabled={isCancelando}
            >
              Editar cita
            </Button>
          )}
          {onCancelar && (
            <Button
              variant="ghost"
              className="flex-1 text-error hover:text-error-dark hover:bg-error-light"
              onClick={onCancelar}
              disabled={isCancelando}
            >
              {isCancelando ? 'Cancelando...' : 'Cancelar cita'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
