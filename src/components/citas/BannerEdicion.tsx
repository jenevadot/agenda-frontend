import { Info, X } from 'lucide-react';
import { parseISO } from 'date-fns';
import { formatearFechaMostrar, formatearHoraDesdeISO } from '../../utils/fecha';
import type { CitaCompleta } from '../../api/citas';

interface BannerEdicionProps {
  citaOriginal: CitaCompleta;
  onCancelar: () => void;
}

/**
 * BannerEdicion component
 * Shows a banner during appointment editing to indicate the original slot is reserved
 * Implements RF-FE-040
 */
export function BannerEdicion({ citaOriginal, onCancelar }: BannerEdicionProps) {
  const fechaCita = parseISO(citaOriginal.fechaHoraInicio);

  return (
    <div className="bg-info-light border-b border-blue-200 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-blue-800">
              Editando tu cita del {formatearFechaMostrar(fechaCita)} a las{' '}
              {formatearHoraDesdeISO(citaOriginal.fechaHoraInicio)}
            </p>
            <p className="text-sm text-blue-600 mt-0.5">
              Tu horario actual esta reservado hasta que confirmes el cambio
            </p>
          </div>
        </div>
        <button
          onClick={onCancelar}
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 whitespace-nowrap"
        >
          <X className="w-4 h-4" />
          Cancelar edicion
        </button>
      </div>
    </div>
  );
}
