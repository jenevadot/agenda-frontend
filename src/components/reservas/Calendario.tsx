import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useDisponibilidad } from '../../hooks/useDisponibilidad';
import {
  obtenerRangoFechas,
  generarRangoFechas,
  formatearFechaApi,
  formatearFechaCorta,
  formatearFechaMostrar,
  esFechaPasada,
  esFechaHoy,
  obtenerDiaSemana,
} from '../../utils/fecha';
import { cn } from '../../lib/utils';
import { SpinnerCarga } from '../comunes';

interface CalendarioProps {
  negocioId: string;
  servicioId: string;
  fechaSeleccionada: Date | null;
  onSeleccionarFecha: (fecha: Date) => void;
  periodoVista: 1 | 2 | 4;
  onCambiarPeriodo: (semanas: 1 | 2 | 4) => void;
}

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];

/**
 * Premium Calendar component with black/white design
 */
export function Calendario({
  negocioId,
  servicioId,
  fechaSeleccionada,
  onSeleccionarFecha,
  periodoVista,
  onCambiarPeriodo,
}: CalendarioProps) {
  const [semanaActual, setSemanaActual] = useState(0);

  // Calculate date range based on period
  const { inicio, fin } = useMemo(() => obtenerRangoFechas(periodoVista), [periodoVista]);

  // Generate all dates in the range
  const todasLasFechas = useMemo(() => generarRangoFechas(inicio, fin), [inicio, fin]);

  // Fetch availability data
  const { data: disponibilidad, isLoading } = useDisponibilidad({
    negocioId,
    servicioId,
    fechaInicio: formatearFechaApi(inicio),
    fechaFin: formatearFechaApi(fin),
  });

  // Create map of dates with availability
  const disponibilidadPorFecha = useMemo(() => {
    const map = new Map<string, boolean>();
    disponibilidad?.forEach((dia) => {
      map.set(dia.fecha, dia.slots.length > 0);
    });
    return map;
  }, [disponibilidad]);

  // Split dates into weeks
  const semanasDisponibles = useMemo(() => {
    const semanas: Date[][] = [];
    let semanaActual: Date[] = [];

    todasLasFechas.forEach((fecha, index) => {
      semanaActual.push(fecha);
      if (semanaActual.length === 7 || index === todasLasFechas.length - 1) {
        semanas.push(semanaActual);
        semanaActual = [];
      }
    });

    return semanas;
  }, [todasLasFechas]);

  // Get current week to display
  const semanaVisible = semanasDisponibles[semanaActual] || [];

  // Check if a date has availability
  const tieneDisponibilidad = (fecha: Date): boolean => {
    const fechaStr = formatearFechaApi(fecha);
    return disponibilidadPorFecha.get(fechaStr) ?? false;
  };

  // Check if date is selected
  const estaSeleccionada = (fecha: Date): boolean => {
    if (!fechaSeleccionada) return false;
    return formatearFechaApi(fecha) === formatearFechaApi(fechaSeleccionada);
  };

  // Handle date click
  const handleClickFecha = (fecha: Date) => {
    if (esFechaPasada(fecha) || !tieneDisponibilidad(fecha)) return;
    onSeleccionarFecha(fecha);
  };

  // Navigate weeks
  const puedeRetroceder = semanaActual > 0;
  const puedeAvanzar = semanaActual < semanasDisponibles.length - 1;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 lg:p-8">
      {/* Period selector */}
      <div className="flex gap-2 mb-8">
        {([1, 2, 4] as const).map((semanas) => (
          <button
            key={semanas}
            onClick={() => {
              onCambiarPeriodo(semanas);
              setSemanaActual(0);
            }}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
              periodoVista === semanas
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {semanas === 1 ? '1 Semana' : semanas === 2 ? '2 Semanas' : '1 Mes'}
          </button>
        ))}
      </div>

      {/* Week navigation */}
      {semanasDisponibles.length > 1 && (
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setSemanaActual((s) => s - 1)}
            disabled={!puedeRetroceder}
            className={cn(
              'p-2 rounded-full transition-colors',
              puedeRetroceder
                ? 'hover:bg-gray-100 text-black'
                : 'text-gray-300 cursor-not-allowed'
            )}
            aria-label="Semana anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="text-sm text-gray-500 font-medium">
            Semana {semanaActual + 1} de {semanasDisponibles.length}
          </span>

          <button
            onClick={() => setSemanaActual((s) => s + 1)}
            disabled={!puedeAvanzar}
            className={cn(
              'p-2 rounded-full transition-colors',
              puedeAvanzar
                ? 'hover:bg-gray-100 text-black'
                : 'text-gray-300 cursor-not-allowed'
            )}
            aria-label="Semana siguiente"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="py-12">
          <SpinnerCarga />
        </div>
      ) : (
        <>
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2 mb-3">
            {DIAS_SEMANA.map((dia) => (
              <div
                key={dia}
                className="text-center text-xs font-medium text-gray-400 py-2"
              >
                {dia}
              </div>
            ))}
          </div>

          {/* Date grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Add empty cells for alignment */}
            {semanaVisible.length > 0 &&
              Array.from({ length: obtenerDiaSemana(semanaVisible[0]) }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

            {semanaVisible.map((fecha) => {
              const pasada = esFechaPasada(fecha);
              const disponible = tieneDisponibilidad(fecha);
              const seleccionada = estaSeleccionada(fecha);
              const hoy = esFechaHoy(fecha);

              return (
                <button
                  key={fecha.toISOString()}
                  onClick={() => handleClickFecha(fecha)}
                  disabled={pasada || !disponible}
                  className={cn(
                    'relative aspect-square rounded-xl flex flex-col items-center justify-center transition-all duration-200',
                    'text-sm font-medium',
                    // Past dates
                    pasada && 'bg-gray-50 text-gray-300 cursor-not-allowed',
                    // No availability
                    !pasada && !disponible && 'bg-gray-100 text-gray-400 cursor-not-allowed',
                    // Available
                    !pasada &&
                      disponible &&
                      !seleccionada &&
                      'bg-white text-black border-2 border-gray-100 hover:border-black hover:shadow-sm cursor-pointer',
                    // Selected
                    seleccionada && 'bg-black text-white border-2 border-black',
                    // Today indicator
                    hoy && !seleccionada && 'ring-2 ring-black ring-offset-2'
                  )}
                  aria-label={formatearFechaMostrar(fecha)}
                >
                  <span>{fecha.getDate()}</span>
                  <span className="text-[10px] opacity-60">
                    {formatearFechaCorta(fecha).split(' ')[1]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-8 pt-6 border-t border-gray-100 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-lg bg-white border-2 border-gray-100" />
              <span>Disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-lg bg-gray-100" />
              <span>Sin disponibilidad</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-lg bg-black" />
              <span>Seleccionado</span>
            </div>
          </div>
        </>
      )}

      {/* Selected date display */}
      {fechaSeleccionada && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-500 text-center">
            Fecha seleccionada:{' '}
            <span className="font-medium text-black">
              {formatearFechaMostrar(fechaSeleccionada)}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
