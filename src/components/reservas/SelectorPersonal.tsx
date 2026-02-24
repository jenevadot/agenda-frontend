import { useEffect } from 'react';
import { User, Users } from 'lucide-react';
import { cn } from '../../lib/utils';
import { SpinnerCarga } from '../comunes';
import type { PersonalSimple } from '../../stores/flujoReservaStore';

interface SelectorPersonalProps {
  personalDisponible: PersonalSimple[];
  personalSeleccionado: PersonalSimple | null | undefined;
  onSeleccionar: (personal: PersonalSimple | null) => void;
  isLoading?: boolean;
}

/**
 * Premium Staff selector with black/white design
 */
export function SelectorPersonal({
  personalDisponible,
  personalSeleccionado,
  onSeleccionar,
  isLoading,
}: SelectorPersonalProps) {
  // Auto-select if only one professional available
  useEffect(() => {
    if (personalDisponible.length === 1 && personalSeleccionado === undefined) {
      onSeleccionar(personalDisponible[0]);
    }
  }, [personalDisponible, personalSeleccionado, onSeleccionar]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8">
        <SpinnerCarga />
      </div>
    );
  }

  if (personalDisponible.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <Users className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-black font-medium">
          No hay profesionales disponibles
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Por favor, selecciona otra fecha.
        </p>
      </div>
    );
  }

  const estaSeleccionadoCualquiera = personalSeleccionado === null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 lg:p-8">
      <div className="space-y-3">
        {/* Option: Any available professional */}
        <button
          onClick={() => onSeleccionar(null)}
          className={cn(
            'w-full p-5 rounded-2xl border-2 text-left transition-all duration-200',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2',
            estaSeleccionadoCualquiera
              ? 'border-black bg-gray-50'
              : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'
          )}
        >
          <div className="flex items-center gap-4">
            <div
              className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
                estaSeleccionadoCualquiera
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-500'
              )}
            >
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="font-medium text-black">
                Cualquier profesional disponible
              </div>
              <div className="text-sm text-gray-500">
                Se asignara automaticamente al confirmar
              </div>
            </div>
          </div>
        </button>

        {/* List of available staff */}
        {personalDisponible.map((personal) => {
          const estaSeleccionado = personalSeleccionado?.id === personal.id;

          return (
            <button
              key={personal.id}
              onClick={() => onSeleccionar(personal)}
              className={cn(
                'w-full p-5 rounded-2xl border-2 text-left transition-all duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2',
                estaSeleccionado
                  ? 'border-black bg-gray-50'
                  : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'
              )}
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
                    estaSeleccionado
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-500'
                  )}
                >
                  <User className="w-5 h-5" />
                </div>
                <div className="font-medium text-black">{personal.nombre}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Informational message when "any professional" is selected */}
      {estaSeleccionadoCualquiera && (
        <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-sm text-gray-600">
            Al seleccionar "Cualquier profesional", se asignara automaticamente
            un miembro del personal disponible cuando confirmes tu reserva.
          </p>
        </div>
      )}
    </div>
  );
}
