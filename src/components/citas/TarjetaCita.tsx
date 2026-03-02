import { Calendar, Clock, MapPin, Scissors, X, ChevronRight, RefreshCw } from 'lucide-react';
import { format, parseISO, isPast, isFuture, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { Button, DialogoConfirmacion } from '../comunes';
import type { CitaCompleta, EstadoCita } from '../../api/citas';

interface TarjetaCitaProps {
  cita: CitaCompleta;
  onCancelar?: (citaId: string, negocioId: string) => void;
  isCancelando?: boolean;
}

/**
 * Get status configuration for display
 */
function obtenerConfigEstado(estado: EstadoCita) {
  const config: Record<
    EstadoCita,
    { label: string; bgClass: string; textClass: string; dotClass: string }
  > = {
    confirmada: {
      label: 'Confirmada',
      bgClass: 'bg-success-light',
      textClass: 'text-green-800',
      dotClass: 'bg-success',
    },
    pendiente_actualizacion: {
      label: 'Pendiente',
      bgClass: 'bg-warning-light',
      textClass: 'text-amber-800',
      dotClass: 'bg-warning',
    },
    cancelada: {
      label: 'Cancelada',
      bgClass: 'bg-error-light',
      textClass: 'text-red-800',
      dotClass: 'bg-error',
    },
    completada: {
      label: 'Completada',
      bgClass: 'bg-gray-100',
      textClass: 'text-gray-700',
      dotClass: 'bg-gray-400',
    },
    no_show: {
      label: 'No asistio',
      bgClass: 'bg-purple-100',
      textClass: 'text-purple-800',
      dotClass: 'bg-purple-500',
    },
  };

  return config[estado] || config.confirmada;
}

/**
 * Format appointment date for display
 */
function formatearFechaCita(fecha: string): string {
  const date = parseISO(fecha);

  if (isToday(date)) {
    return 'Hoy';
  }

  return format(date, "EEEE d 'de' MMMM", { locale: es });
}

/**
 * Format time range
 */
function formatearHorario(inicio: string, fin: string): string {
  const horaInicio = format(parseISO(inicio), 'HH:mm');
  const horaFin = format(parseISO(fin), 'HH:mm');
  return `${horaInicio} - ${horaFin}`;
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
 * TarjetaCita component
 * Displays appointment details with status and actions
 * Implements RF-FE-032 through RF-FE-036
 */
export function TarjetaCita({ cita, onCancelar, isCancelando }: TarjetaCitaProps) {
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const navigate = useNavigate();

  const configEstado = obtenerConfigEstado(cita.estado);
  const fechaCita = parseISO(cita.fechaHoraInicio);
  const esProxima = isFuture(fechaCita) || isToday(fechaCita);
  const esPasada = isPast(fechaCita) && !isToday(fechaCita);
  const puedeCancelar =
    esProxima && (cita.estado === 'confirmada' || cita.estado === 'pendiente_actualizacion');
  const puedeReservarDeNuevo =
    esPasada || cita.estado === 'cancelada' || cita.estado === 'completada' || cita.estado === 'no_show';

  const duracion = calcularDuracion(cita.fechaHoraInicio, cita.fechaHoraFin);

  const handleCancelar = () => {
    setMostrarConfirmacion(true);
  };

  const handleConfirmarCancelacion = () => {
    if (onCancelar) {
      onCancelar(cita.id, cita.negocio.id);
    }
    setMostrarConfirmacion(false);
  };

  return (
    <>
      <div
        className={cn(
          'bg-white rounded-xl shadow-md overflow-hidden transition-all duration-150',
          esPasada && 'opacity-75'
        )}
      >
        {/* Clickable content - links to detail */}
        <Link
          to={`/citas/${cita.negocio.id}/${cita.id}`}
          className="block p-6 pb-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{cita.servicio.nombre}</h3>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                  configEstado.bgClass,
                  configEstado.textClass
                )}
              >
                <span className={cn('w-1.5 h-1.5 rounded-full', configEstado.dotClass)} />
                {configEstado.label}
              </span>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </div>
          </div>

          {/* Appointment details */}
          <div className="space-y-3">
            {/* Date and time */}
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="capitalize">{formatearFechaCita(cita.fechaHoraInicio)}</span>
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span>
                {formatearHorario(cita.fechaHoraInicio, cita.fechaHoraFin)} ({duracion} min)
              </span>
            </div>

            {/* Staff */}
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Scissors className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span>{cita.personal.nombre}</span>
            </div>

            {/* Business */}
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span>{cita.negocio.nombre}</span>
            </div>
          </div>

          {/* Confirmation code */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Codigo de confirmacion:{' '}
              <span className="font-mono font-medium text-gray-700">
                {cita.numeroConfirmacion}
              </span>
            </p>
          </div>
        </Link>

        {/* Actions */}
        {(puedeCancelar || puedeReservarDeNuevo) && (
          <div className="px-6 pb-6 pt-2 border-t border-gray-50 flex items-center gap-3">
            {puedeCancelar && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelar}
                disabled={isCancelando}
                className="text-error hover:text-error-dark hover:bg-error-light"
              >
                <X className="w-4 h-4 mr-2" />
                {isCancelando ? 'Cancelando...' : 'Cancelar cita'}
              </Button>
            )}
            {puedeReservarDeNuevo && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(`/rebook/${cita.negocio.id}/${cita.id}`)}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reservar de nuevo
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Confirmation dialog */}
      <DialogoConfirmacion
        abierto={mostrarConfirmacion}
        titulo="Cancelar cita"
        mensaje={`¿Estas seguro de cancelar tu cita de ${cita.servicio.nombre} para el ${formatearFechaCita(cita.fechaHoraInicio)} a las ${format(parseISO(cita.fechaHoraInicio), 'HH:mm')}?`}
        textoConfirmar="Si, cancelar"
        textoCancelar="No, mantener"
        variante="peligro"
        onConfirmar={handleConfirmarCancelacion}
        onCancelar={() => setMostrarConfirmacion(false)}
      />
    </>
  );
}
