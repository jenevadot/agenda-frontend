import { Clock } from 'lucide-react';
import type { Servicio } from '../../tipos';
import { Button } from '../comunes';
import { cn } from '../../lib/utils';

interface TarjetaServicioProps {
  servicio: Servicio;
  onReservar: (servicioId: string) => void;
  seleccionado?: boolean;
}

/**
 * Format price in Peruvian Soles
 */
function formatearPrecio(precio: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
  }).format(precio);
}

/**
 * Premium Service card with black/white design
 */
export function TarjetaServicio({ servicio, onReservar, seleccionado }: TarjetaServicioProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border-2 p-6 transition-all duration-300',
        'hover:border-gray-300 hover:-translate-y-1 hover:shadow-card',
        seleccionado ? 'border-black shadow-card' : 'border-gray-100'
      )}
    >
      <h3 className="text-lg font-bold text-black mb-2">
        {servicio.nombre}
      </h3>

      {servicio.descripcion && (
        <p className="text-gray-500 mb-5 line-clamp-2 text-sm leading-relaxed">
          {servicio.descripcion}
        </p>
      )}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>{servicio.duracionMinutos} min</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xl font-bold text-black">
            {formatearPrecio(servicio.precioPen)}
          </span>
        </div>
      </div>

      <Button
        onClick={() => onReservar(servicio.id)}
        fullWidth
      >
        Seleccionar
      </Button>
    </div>
  );
}
