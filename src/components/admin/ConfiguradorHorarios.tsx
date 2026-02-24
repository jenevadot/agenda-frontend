import { useState, useMemo } from 'react';
import { Clock } from 'lucide-react';
import { useHorariosNegocio, useGuardarHorarios } from '../../hooks/useNegocio';
import { SpinnerCarga } from '../comunes/SpinnerCarga';
import { Button } from '../comunes/Button';
import { useNotificacion } from '../comunes/Notificacion';

/**
 * Business hours configuration interface
 */
interface HorarioSemana {
  diaSemana: number; // 0 = Lunes, 6 = Domingo
  abierto: boolean;
  horaApertura: string; // HH:mm
  horaCierre: string;
}

const DIAS_SEMANA = [
  'Lunes',
  'Martes',
  'Miercoles',
  'Jueves',
  'Viernes',
  'Sabado',
  'Domingo',
];

/**
 * Generate default schedule
 */
function generarHorariosDefault(): HorarioSemana[] {
  return DIAS_SEMANA.map((_, index) => ({
    diaSemana: index,
    abierto: index < 6, // Closed on Sunday
    horaApertura: '09:00',
    horaCierre: '18:00',
  }));
}

interface Props {
  negocioId: string;
}

/**
 * Component for configuring business hours per day of week
 * Implements RF-FE-042
 */
export function ConfiguradorHorarios({ negocioId }: Props) {
  const { data: horariosGuardados, isLoading } = useHorariosNegocio(negocioId);
  const { mutate: guardar, isPending } = useGuardarHorarios(negocioId);
  const { mostrarError } = useNotificacion();

  // Initialize schedule from saved data or defaults
  const horariosIniciales = useMemo(() => {
    if (horariosGuardados && horariosGuardados.length > 0) {
      return DIAS_SEMANA.map((_, index) => {
        const horarioGuardado = horariosGuardados.find(
          (h) => h.diaSemana === index
        );
        if (horarioGuardado) {
          return {
            diaSemana: index,
            abierto: horarioGuardado.activo,
            horaApertura: horarioGuardado.horaApertura,
            horaCierre: horarioGuardado.horaCierre,
          };
        }
        return {
          diaSemana: index,
          abierto: index < 6,
          horaApertura: '09:00',
          horaCierre: '18:00',
        };
      });
    }
    return generarHorariosDefault();
  }, [horariosGuardados]);

  const [horarios, setHorarios] = useState<HorarioSemana[]>(horariosIniciales);

  // Update state when initial data changes
  if (horarios.length === 0 && horariosIniciales.length > 0) {
    setHorarios(horariosIniciales);
  }

  const actualizarDia = (diaSemana: number, cambios: Partial<HorarioSemana>) => {
    setHorarios((prev) =>
      prev.map((h) =>
        h.diaSemana === diaSemana ? { ...h, ...cambios } : h
      )
    );
  };

  const handleGuardar = () => {
    // Validate that opening < closing for open days
    const invalidos = horarios.filter(
      (h) => h.abierto && h.horaApertura >= h.horaCierre
    );
    if (invalidos.length > 0) {
      const diasInvalidos = invalidos.map((h) => DIAS_SEMANA[h.diaSemana]).join(', ');
      mostrarError(`La hora de apertura debe ser antes del cierre: ${diasInvalidos}`);
      return;
    }
    guardar(horarios);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <SpinnerCarga />
      </div>
    );
  }

  // Use initial values if state hasn't been set yet
  const horariosActuales = horarios.length > 0 ? horarios : horariosIniciales;

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-info-light rounded-lg flex items-center justify-center">
          <Clock className="w-5 h-5 text-info" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Horarios de Atencion
          </h2>
          <p className="text-sm text-gray-500">
            Configura los horarios de apertura y cierre
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {DIAS_SEMANA.map((dia, index) => {
          const horario = horariosActuales.find((h) => h.diaSemana === index);
          if (!horario) return null;

          return (
            <div
              key={dia}
              className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0"
            >
              <div className="w-28 font-medium text-gray-700">{dia}</div>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={horario.abierto}
                  onChange={(e) =>
                    actualizarDia(index, { abierto: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                />
                <span className="ml-2 text-sm text-gray-600">Abierto</span>
              </label>

              {horario.abierto ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="time"
                    value={horario.horaApertura}
                    onChange={(e) =>
                      actualizarDia(index, { horaApertura: e.target.value })
                    }
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                  <span className="text-gray-400">a</span>
                  <input
                    type="time"
                    value={horario.horaCierre}
                    onChange={(e) =>
                      actualizarDia(index, { horaCierre: e.target.value })
                    }
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>
              ) : (
                <span className="text-gray-400 text-sm flex-1">Cerrado</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <Button
          onClick={handleGuardar}
          disabled={isPending}
          className="w-full"
        >
          {isPending ? 'Guardando...' : 'Guardar horarios'}
        </Button>
      </div>
    </div>
  );
}
