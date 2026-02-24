import { cn } from '../../lib/utils';
import type { HorarioDisponible } from '../../stores/flujoReservaStore';

interface GrupoHorariosProps {
  titulo: string;
  slots: HorarioDisponible[];
  slotSeleccionado: HorarioDisponible | null;
  onSeleccionar: (slot: HorarioDisponible) => void;
}

/**
 * Premium time slot group with black/white design
 */
export function GrupoHorarios({
  titulo,
  slots,
  slotSeleccionado,
  onSeleccionar,
}: GrupoHorariosProps) {
  if (slots.length === 0) {
    return (
      <div className="mb-8 last:mb-0">
        <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
          {titulo}
        </h4>
        <p className="text-gray-400 text-sm">Sin disponibilidad</p>
      </div>
    );
  }

  return (
    <div className="mb-8 last:mb-0">
      <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
        {titulo}
      </h4>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
        {slots.map((slot) => {
          const estaSeleccionado =
            slotSeleccionado?.horaInicio === slot.horaInicio &&
            slotSeleccionado?.horaFin === slot.horaFin;

          return (
            <button
              key={`${slot.horaInicio}-${slot.horaFin}`}
              onClick={() => onSeleccionar(slot)}
              className={cn(
                'py-3 px-4 rounded-xl text-center transition-all duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2',
                estaSeleccionado
                  ? 'bg-black text-white'
                  : 'bg-white border-2 border-gray-100 hover:border-black hover:shadow-sm'
              )}
            >
              <div className="font-medium text-sm">{slot.horaInicio}</div>
              <div
                className={cn(
                  'text-xs',
                  estaSeleccionado ? 'text-gray-400' : 'text-gray-500'
                )}
              >
                {slot.horaFin}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
