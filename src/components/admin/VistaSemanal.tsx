import { useMemo } from 'react';
import { Calendar } from 'lucide-react';
import type { CitaNegocio } from '../../api/negocios';
import {
  generarRangoFechas,
  formatearHoraDesdeISO,
  isSameDay,
} from '../../utils/fecha';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props {
  citas: CitaNegocio[];
  fechaInicio: Date;
  fechaFin: Date;
  onClickCita: (cita: CitaNegocio) => void;
}

/**
 * Get color class based on appointment status
 */
function getColorEstado(estado: string): string {
  switch (estado) {
    case 'confirmada':
      return 'bg-success-light text-success border-l-2 border-success';
    case 'pendiente':
      return 'bg-warning-light text-warning border-l-2 border-warning';
    case 'pendiente_actualizacion':
      return 'bg-info-light text-info border-l-2 border-info';
    case 'completada':
      return 'bg-gray-100 text-gray-600 border-l-2 border-gray-400';
    case 'cancelada':
    case 'no_asistio':
      return 'bg-danger-light text-danger border-l-2 border-danger';
    default:
      return 'bg-gray-100 text-gray-700 border-l-2 border-gray-300';
  }
}

/**
 * Weekly/Biweekly view component for admin calendar
 */
export function VistaSemanal({ citas, fechaInicio, fechaFin, onClickCita }: Props) {
  // Generate array of dates for the view
  const dias = useMemo(() => {
    return generarRangoFechas(fechaInicio, fechaFin);
  }, [fechaInicio, fechaFin]);

  // Group appointments by day
  const citasPorDia = useMemo(() => {
    const map = new Map<string, CitaNegocio[]>();

    dias.forEach((dia) => {
      const key = dia.toISOString().split('T')[0];
      map.set(key, []);
    });

    citas.forEach((cita) => {
      const fechaCita = new Date(cita.fechaHoraInicio);
      const key = fechaCita.toISOString().split('T')[0];
      if (map.has(key)) {
        map.get(key)!.push(cita);
      }
    });

    return map;
  }, [citas, dias]);

  // Check if today
  const hoy = new Date();

  const totalCitas = citas.length;

  return (
    <div>
      {/* Header with day names */}
      <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
        {dias.slice(0, 7).map((dia) => (
          <div
            key={dia.toISOString()}
            className="p-2 text-center text-xs font-medium text-gray-500 uppercase"
          >
            {format(dia, 'EEE', { locale: es })}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 divide-x divide-gray-100">
        {dias.map((dia) => {
          const key = dia.toISOString().split('T')[0];
          const citasDia = citasPorDia.get(key) || [];
          const esHoy = isSameDay(dia, hoy);

          return (
            <div
              key={key}
              className={`min-h-[150px] ${esHoy ? 'bg-info-light/30' : ''}`}
            >
              {/* Day header */}
              <div
                className={`
                  p-2 text-center border-b border-gray-100
                  ${esHoy ? 'bg-info text-white' : 'text-gray-700'}
                `}
              >
                <span className="text-lg font-semibold">{dia.getDate()}</span>
                <span className="text-xs ml-1">
                  {format(dia, 'MMM', { locale: es })}
                </span>
              </div>

              {/* Day appointments */}
              <div className="p-1 space-y-1">
                {citasDia.length === 0 ? (
                  <div className="h-24" />
                ) : (
                  citasDia
                    .sort((a, b) => a.fechaHoraInicio.localeCompare(b.fechaHoraInicio))
                    .slice(0, 4)
                    .map((cita) => (
                      <div
                        key={cita.id}
                        onClick={() => onClickCita(cita)}
                        className={`
                          px-2 py-1 rounded text-xs cursor-pointer truncate
                          hover:opacity-80 transition-opacity
                          ${getColorEstado(cita.estado)}
                        `}
                        title={`${formatearHoraDesdeISO(cita.fechaHoraInicio)} - ${cita.servicioNombre} - ${cita.clienteNombre}`}
                      >
                        <span className="font-medium">
                          {formatearHoraDesdeISO(cita.fechaHoraInicio)}
                        </span>
                        <span className="ml-1 opacity-80">{cita.servicioNombre}</span>
                      </div>
                    ))
                )}

                {citasDia.length > 4 && (
                  <div className="text-xs text-center text-gray-500 py-1">
                    +{citasDia.length - 4} mas
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {totalCitas === 0 && (
        <div className="text-center py-12 text-gray-500 col-span-7">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No hay citas en este periodo</p>
        </div>
      )}
    </div>
  );
}
