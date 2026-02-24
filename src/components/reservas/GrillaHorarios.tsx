import { useMemo } from 'react';
import { Clock } from 'lucide-react';
import { SpinnerCarga } from '../comunes';
import { GrupoHorarios } from './GrupoHorarios';
import { agruparSlotsPorPeriodo } from '../../utils/fecha';
import type { HorarioDisponible, PersonalSimple } from '../../stores/flujoReservaStore';
import type { SlotDisponible } from '../../tipos';

interface GrillaHorariosProps {
  slots: SlotDisponible[];
  personalSeleccionado: PersonalSimple | null | undefined;
  slotSeleccionado: HorarioDisponible | null;
  onSeleccionar: (slot: HorarioDisponible) => void;
  isLoading?: boolean;
  ultimaActualizacion?: Date;
}

/**
 * Premium time slot grid with black/white design
 */
export function GrillaHorarios({
  slots,
  personalSeleccionado,
  slotSeleccionado,
  onSeleccionar,
  isLoading,
  ultimaActualizacion,
}: GrillaHorariosProps) {
  // Filter and transform slots based on selected staff
  const slotsTransformados = useMemo(() => {
    // Filter slots based on selected staff
    const slotsFiltrados = slots.filter((slot) => {
      if (personalSeleccionado === null) {
        // "Any professional": show slots with at least 1 available staff
        return slot.personalDisponible.length > 0;
      }
      if (personalSeleccionado) {
        // Specific staff: only show slots where that staff is available
        return slot.personalDisponible.some((p) => p.id === personalSeleccionado.id);
      }
      return false;
    });

    // Transform to HorarioDisponible format
    return slotsFiltrados.map((slot) => ({
      horaInicio: slot.inicio,
      horaFin: slot.fin,
      personalDisponible: slot.personalDisponible,
    }));
  }, [slots, personalSeleccionado]);

  // Group by time period
  const slotsAgrupados = useMemo(() => {
    return agruparSlotsPorPeriodo(
      slotsTransformados.map((s) => ({
        horaInicio: s.horaInicio,
        horaFin: s.horaFin,
      }))
    );
  }, [slotsTransformados]);

  // Create full slot data for each group
  const gruposConDatos = useMemo(() => {
    const buscarSlot = (hora: { horaInicio: string; horaFin: string }) =>
      slotsTransformados.find(
        (s) => s.horaInicio === hora.horaInicio && s.horaFin === hora.horaFin
      )!;

    return {
      manana: slotsAgrupados.manana.map(buscarSlot),
      mediodia: slotsAgrupados.mediodia.map(buscarSlot),
      tarde: slotsAgrupados.tarde.map(buscarSlot),
    };
  }, [slotsAgrupados, slotsTransformados]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8">
        <SpinnerCarga />
      </div>
    );
  }

  if (slotsTransformados.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <Clock className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-black font-medium">
          No hay horarios disponibles
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Intenta con otro profesional o fecha.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 lg:p-8">
      <GrupoHorarios
        titulo="Manana"
        slots={gruposConDatos.manana}
        slotSeleccionado={slotSeleccionado}
        onSeleccionar={onSeleccionar}
      />

      <GrupoHorarios
        titulo="Mediodia"
        slots={gruposConDatos.mediodia}
        slotSeleccionado={slotSeleccionado}
        onSeleccionar={onSeleccionar}
      />

      <GrupoHorarios
        titulo="Tarde"
        slots={gruposConDatos.tarde}
        slotSeleccionado={slotSeleccionado}
        onSeleccionar={onSeleccionar}
      />

      {/* Last update indicator */}
      {ultimaActualizacion && (
        <p className="text-xs text-gray-400 mt-6 pt-6 border-t border-gray-100 text-center">
          Actualizado: {formatearHoraActualizacion(ultimaActualizacion)}
        </p>
      )}
    </div>
  );
}

/**
 * Format timestamp for display
 */
function formatearHoraActualizacion(fecha: Date): string {
  return fecha.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
