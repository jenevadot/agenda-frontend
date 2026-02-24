import { Calendar } from 'lucide-react';
import { TarjetaCita } from './TarjetaCita';
import { SpinnerCarga } from '../comunes';
import type { CitaCompleta } from '../../api/citas';

interface ListaCitasProps {
  citas: CitaCompleta[];
  isLoading?: boolean;
  onCancelarCita?: (citaId: string, negocioId: string) => void;
  citaCancelando?: string | null;
  mensajeVacio?: string;
}

/**
 * ListaCitas component
 * Displays a list of appointment cards
 * Implements RF-FE-032
 */
export function ListaCitas({
  citas,
  isLoading,
  onCancelarCita,
  citaCancelando,
  mensajeVacio = 'No tienes citas programadas',
}: ListaCitasProps) {
  if (isLoading) {
    return (
      <div className="py-12">
        <SpinnerCarga />
      </div>
    );
  }

  if (citas.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500 mb-2">{mensajeVacio}</p>
        <p className="text-sm text-gray-400">
          Tus citas apareceran aqui despues de reservar
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {citas.map((cita) => (
        <TarjetaCita
          key={cita.id}
          cita={cita}
          onCancelar={onCancelarCita}
          isCancelando={citaCancelando === cita.id}
        />
      ))}
    </div>
  );
}
