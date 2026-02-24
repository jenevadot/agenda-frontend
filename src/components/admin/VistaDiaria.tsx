import { useMemo } from 'react';
import { Calendar } from 'lucide-react';
import type { CitaNegocio } from '../../api/negocios';
import { formatearFechaMostrar, formatearHoraDesdeISO } from '../../utils/fecha';

interface Props {
  citas: CitaNegocio[];
  fecha: Date;
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
 * Daily view component for admin calendar
 */
export function VistaDiaria({ citas, fecha, onClickCita }: Props) {
  // Generate array of hours (6:00 - 20:00)
  const horas = Array.from({ length: 15 }, (_, i) => 6 + i);

  const citasPorHora = useMemo(() => {
    const map = new Map<number, CitaNegocio[]>();
    citas.forEach((cita) => {
      const hora = new Date(cita.fechaHoraInicio).getHours();
      if (!map.has(hora)) map.set(hora, []);
      map.get(hora)!.push(cita);
    });
    return map;
  }, [citas]);

  const totalCitas = citas.length;

  return (
    <div>
      {/* Header */}
      <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
        <span className="font-semibold text-gray-900">
          {formatearFechaMostrar(fecha)}
        </span>
        <span className="text-sm text-gray-500">
          {totalCitas} {totalCitas === 1 ? 'cita' : 'citas'}
        </span>
      </div>

      {/* Time slots */}
      <div className="divide-y divide-gray-100">
        {horas.map((hora) => {
          const citasHora = citasPorHora.get(hora) || [];

          return (
            <div key={hora} className="flex min-h-[70px]">
              {/* Time label */}
              <div className="w-20 py-3 px-3 text-right text-sm text-gray-400 bg-gray-50 flex-shrink-0 border-r border-gray-100">
                {hora.toString().padStart(2, '0')}:00
              </div>

              {/* Appointments */}
              <div className="flex-1 p-2 flex flex-wrap gap-2">
                {citasHora.map((cita) => (
                  <div
                    key={cita.id}
                    onClick={() => onClickCita(cita)}
                    className={`
                      px-3 py-2 rounded-lg text-sm cursor-pointer
                      hover:opacity-80 transition-opacity
                      ${getColorEstado(cita.estado)}
                    `}
                  >
                    <div className="font-medium">
                      {formatearHoraDesdeISO(cita.fechaHoraInicio)} - {cita.servicioNombre}
                    </div>
                    <div className="text-xs opacity-80 mt-0.5">
                      {cita.clienteNombre} • {cita.personalNombre}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {totalCitas === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No hay citas para este dia</p>
        </div>
      )}
    </div>
  );
}
