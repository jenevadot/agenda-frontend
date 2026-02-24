import { create } from 'zustand';
import type { Servicio } from '../tipos';

export interface PersonalSimple {
  id: string;
  nombre: string;
}

export interface HorarioDisponible {
  horaInicio: string; // HH:mm format
  horaFin: string;
  personalDisponible: PersonalSimple[];
}

type PasoReserva = 'servicio' | 'fecha' | 'personal' | 'horario' | 'confirmacion';

interface EstadoFlujoReserva {
  // State
  negocioId: string | null;
  servicioSeleccionado: Servicio | null;
  fechaSeleccionada: Date | null;
  // null = "any professional", undefined = not yet selected, PersonalSimple = specific professional
  personalSeleccionado: PersonalSimple | null | undefined;
  horarioSeleccionado: HorarioDisponible | null;
  periodoVista: 1 | 2 | 4; // weeks

  // Actions
  setNegocio: (negocioId: string) => void;
  setServicio: (servicio: Servicio) => void;
  setFecha: (fecha: Date) => void;
  setPersonal: (personal: PersonalSimple | null) => void;
  setHorario: (horario: HorarioDisponible) => void;
  setPeriodoVista: (semanas: 1 | 2 | 4) => void;
  reiniciarFlujo: () => void;
  volverAPaso: (paso: PasoReserva) => void;

  // Helpers
  obtenerPasoActual: () => PasoReserva;
  puedeAvanzar: (paso: PasoReserva) => boolean;
}

const estadoInicial = {
  negocioId: null,
  servicioSeleccionado: null,
  fechaSeleccionada: null,
  personalSeleccionado: undefined as PersonalSimple | null | undefined,
  horarioSeleccionado: null,
  periodoVista: 1 as const,
};

/**
 * Booking flow store
 * Manages state for the multi-step booking process
 */
export const useFlujoReservaStore = create<EstadoFlujoReserva>((set, get) => ({
  ...estadoInicial,

  setNegocio: (negocioId) => set({ negocioId }),

  setServicio: (servicio) =>
    set({
      servicioSeleccionado: servicio,
      // Clear dependent selections
      fechaSeleccionada: null,
      personalSeleccionado: undefined,
      horarioSeleccionado: null,
    }),

  setFecha: (fecha) =>
    set({
      fechaSeleccionada: fecha,
      // Clear dependent selections
      personalSeleccionado: undefined,
      horarioSeleccionado: null,
    }),

  setPersonal: (personal) =>
    set({
      personalSeleccionado: personal,
      horarioSeleccionado: null,
    }),

  setHorario: (horario) => set({ horarioSeleccionado: horario }),

  setPeriodoVista: (semanas) => set({ periodoVista: semanas }),

  reiniciarFlujo: () => set(estadoInicial),

  volverAPaso: (paso) => {
    switch (paso) {
      case 'servicio':
        set({
          servicioSeleccionado: null,
          fechaSeleccionada: null,
          personalSeleccionado: undefined,
          horarioSeleccionado: null,
        });
        break;
      case 'fecha':
        set({
          fechaSeleccionada: null,
          personalSeleccionado: undefined,
          horarioSeleccionado: null,
        });
        break;
      case 'personal':
        set({
          personalSeleccionado: undefined,
          horarioSeleccionado: null,
        });
        break;
      case 'horario':
        set({
          horarioSeleccionado: null,
        });
        break;
    }
  },

  obtenerPasoActual: () => {
    const state = get();
    if (!state.servicioSeleccionado) return 'servicio';
    if (!state.fechaSeleccionada) return 'fecha';
    if (state.personalSeleccionado === undefined) return 'personal';
    if (!state.horarioSeleccionado) return 'horario';
    return 'confirmacion';
  },

  puedeAvanzar: (paso) => {
    const state = get();
    switch (paso) {
      case 'servicio':
        return !!state.servicioSeleccionado;
      case 'fecha':
        return !!state.servicioSeleccionado && !!state.fechaSeleccionada;
      case 'personal':
        return !!state.fechaSeleccionada && state.personalSeleccionado !== undefined;
      case 'horario':
        return !!state.horarioSeleccionado;
      case 'confirmacion':
        return (
          !!state.servicioSeleccionado &&
          !!state.fechaSeleccionada &&
          state.personalSeleccionado !== undefined &&
          !!state.horarioSeleccionado
        );
      default:
        return false;
    }
  },
}));
