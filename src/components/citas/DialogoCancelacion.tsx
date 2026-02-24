import { AlertTriangle, X } from 'lucide-react';
import { parseISO } from 'date-fns';
import { Button } from '../comunes';
import {
  formatearFechaMostrar,
  formatearHoraDesdeISO,
  esCancelacionTardia,
} from '../../utils/fecha';
import type { CitaCompleta } from '../../api/citas';

interface DialogoCancelacionProps {
  cita: CitaCompleta;
  abierto: boolean;
  onConfirmar: () => void;
  onCerrar: () => void;
  isLoading?: boolean;
}

/**
 * DialogoCancelacion component
 * Confirmation dialog for canceling appointments
 * Includes late cancellation warning (RF-FE-038)
 */
export function DialogoCancelacion({
  cita,
  abierto,
  onConfirmar,
  onCerrar,
  isLoading,
}: DialogoCancelacionProps) {
  if (!abierto) return null;

  const esTardia = esCancelacionTardia(cita.fechaHoraInicio);
  const fechaCita = parseISO(cita.fechaHoraInicio);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCerrar}
      />

      {/* Dialog */}
      <div
        className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 id="dialog-title" className="text-lg font-semibold text-gray-900">
            Cancelar cita
          </h2>
          <button
            onClick={onCerrar}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <p className="text-gray-600 mb-4">
            Estas a punto de cancelar tu cita de{' '}
            <strong className="text-gray-900">{cita.servicio.nombre}</strong> del{' '}
            <strong className="text-gray-900">
              {formatearFechaMostrar(fechaCita)}
            </strong>{' '}
            a las{' '}
            <strong className="text-gray-900">
              {formatearHoraDesdeISO(cita.fechaHoraInicio)}
            </strong>
            .
          </p>

          {/* Late cancellation warning RF-FE-038 */}
          {esTardia && (
            <div className="bg-warning-light border border-amber-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800">
                    Cancelacion con poca anticipacion
                  </p>
                  <p className="text-sm text-amber-700 mt-1">
                    Tu cita es en menos de 2 horas. Te pedimos que en el futuro
                    canceles con mayor anticipacion para que otras personas
                    puedan aprovechar el horario.
                  </p>
                </div>
              </div>
            </div>
          )}

          <p className="text-sm text-gray-500">
            Esta accion no se puede deshacer.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 py-4 bg-gray-50 border-t">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onCerrar}
            disabled={isLoading}
          >
            Volver
          </Button>
          <Button
            variant="primary"
            className="flex-1 bg-error hover:bg-error-dark"
            onClick={onConfirmar}
            disabled={isLoading}
          >
            {isLoading ? 'Cancelando...' : 'Si, cancelar cita'}
          </Button>
        </div>
      </div>
    </div>
  );
}
