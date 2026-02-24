import {
  format,
  addWeeks,
  addDays,
  subDays,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  isToday,
  isBefore,
  isSameDay,
  eachDayOfInterval,
  getDay,
  parseISO,
  differenceInHours,
} from 'date-fns';
import { es } from 'date-fns/locale';

export { addDays, subDays, startOfWeek, endOfWeek, isSameDay };

/**
 * Date and time utilities for the booking flow
 * Uses Peru timezone (America/Lima, UTC-5)
 */

export const ZONA_HORARIA = 'America/Lima';

/**
 * Format date for display
 * @example "Lunes 10 de Febrero"
 */
export function formatearFechaMostrar(fecha: Date): string {
  const formatted = format(fecha, "EEEE d 'de' MMMM", { locale: es });
  // Capitalize first letter
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

/**
 * Format date short
 * @example "10 Feb"
 */
export function formatearFechaCorta(fecha: Date): string {
  return format(fecha, 'd MMM', { locale: es });
}

/**
 * Format slot time
 * @example "09:00"
 */
export function formatearSlotHora(hora: string): string {
  return hora;
}

/**
 * Format time range
 * @example "09:00 - 10:30"
 */
export function formatearRangoHorario(inicio: string, fin: string): string {
  return `${inicio} - ${fin}`;
}

/**
 * Calculate date range for availability
 * @param semanas - 1, 2, or 4 weeks
 */
export function obtenerRangoFechas(semanas: 1 | 2 | 4): { inicio: Date; fin: Date } {
  const hoy = startOfDay(new Date());
  const fin = endOfDay(addWeeks(hoy, semanas));
  return { inicio: hoy, fin };
}

/**
 * Check if date is today
 */
export function esFechaHoy(fecha: Date): boolean {
  return isToday(fecha);
}

/**
 * Check if date is in the past (RF-FE-015)
 */
export function esFechaPasada(fecha: Date): boolean {
  return isBefore(startOfDay(fecha), startOfDay(new Date()));
}

/**
 * Generate array of dates between start and end
 */
export function generarRangoFechas(inicio: Date, fin: Date): Date[] {
  return eachDayOfInterval({ start: inicio, end: fin });
}

/**
 * Format date for API (ISO format)
 * @example "2026-02-10"
 */
export function formatearFechaApi(fecha: Date): string {
  return format(fecha, 'yyyy-MM-dd');
}

/**
 * Get day of week name
 */
export function obtenerNombreDia(fecha: Date): string {
  return format(fecha, 'EEEE', { locale: es });
}

/**
 * Get day of week number (0 = Sunday, 6 = Saturday)
 */
export function obtenerDiaSemana(fecha: Date): number {
  return getDay(fecha);
}

/**
 * Build ISO datetime string from date and time
 * @param fecha - Date object
 * @param hora - Time string in HH:mm or HH:mm:ss format
 * @returns ISO datetime string in format YYYY-MM-DDTHH:mm:ss
 * @example construirDatetimeISO(new Date('2026-02-10'), '09:00') => '2026-02-10T09:00:00'
 * @example construirDatetimeISO(new Date('2026-02-10'), '09:00:00') => '2026-02-10T09:00:00'
 */
export function construirDatetimeISO(fecha: Date, hora: string): string {
  const fechaStr = formatearFechaApi(fecha);

  // Normalizar la hora a formato HH:mm:ss
  // Si ya tiene formato HH:mm:ss, usarla tal cual
  // Si tiene formato HH:mm, agregar :00
  const partesHora = hora.split(':');
  let horaFinal: string;

  if (partesHora.length === 2) {
    // Formato HH:mm
    horaFinal = `${hora}:00`;
  } else if (partesHora.length === 3) {
    // Formato HH:mm:ss - usar tal cual
    horaFinal = hora;
  } else {
    // Formato inválido, usar como está
    horaFinal = hora;
  }

  return `${fechaStr}T${horaFinal}`;
}

/**
 * Slot grouping interfaces
 */
export interface SlotAgrupado {
  horaInicio: string;
  horaFin: string;
  personalId?: string;
  personalNombre?: string;
}

export interface SlotsAgrupados {
  manana: SlotAgrupado[];
  mediodia: SlotAgrupado[];
  tarde: SlotAgrupado[];
}

/**
 * Group slots by time period (RF-FE-020)
 * - Morning: 06:00 - 11:59
 * - Midday: 12:00 - 15:59
 * - Afternoon: 16:00 - 20:00
 */
export function agruparSlotsPorPeriodo(slots: SlotAgrupado[]): SlotsAgrupados {
  const resultado: SlotsAgrupados = {
    manana: [],
    mediodia: [],
    tarde: [],
  };

  slots.forEach((slot) => {
    const hora = parseInt(slot.horaInicio.split(':')[0], 10);

    if (hora >= 6 && hora < 12) {
      resultado.manana.push(slot);
    } else if (hora >= 12 && hora < 16) {
      resultado.mediodia.push(slot);
    } else if (hora >= 16 && hora <= 20) {
      resultado.tarde.push(slot);
    }
  });

  return resultado;
}

/**
 * Get period label in Spanish
 */
export function obtenerEtiquetaPeriodo(periodo: keyof SlotsAgrupados): string {
  const etiquetas = {
    manana: 'Mañana',
    mediodia: 'Mediodía',
    tarde: 'Tarde',
  };
  return etiquetas[periodo];
}

/**
 * Check if cancellation is late (less than 2 hours before appointment)
 * RF-FE-038
 */
export function esCancelacionTardia(fechaHoraCita: string): boolean {
  const fechaCita = parseISO(fechaHoraCita);
  const ahora = new Date();
  const horasFaltantes = differenceInHours(fechaCita, ahora);
  return horasFaltantes < 2 && horasFaltantes >= 0;
}

/**
 * Format time from ISO string
 * @example formatearHoraDesdeISO("2026-02-10T09:00:00") => "09:00"
 */
export function formatearHoraDesdeISO(fechaISO: string): string {
  return format(parseISO(fechaISO), 'HH:mm');
}

/**
 * View type for calendar
 */
export type TipoVista = 'dia' | 'semana' | 'quincena';

/**
 * Calculate date range for calendar view
 */
export function calcularRangoVista(
  fechaBase: Date,
  tipoVista: TipoVista
): { fechaInicio: Date; fechaFin: Date } {
  const inicio = startOfDay(fechaBase);

  switch (tipoVista) {
    case 'dia':
      return { fechaInicio: inicio, fechaFin: endOfDay(inicio) };
    case 'semana':
      return {
        fechaInicio: startOfWeek(inicio, { weekStartsOn: 1 }),
        fechaFin: endOfWeek(inicio, { weekStartsOn: 1 }),
      };
    case 'quincena':
      return {
        fechaInicio: startOfWeek(inicio, { weekStartsOn: 1 }),
        fechaFin: endOfDay(addDays(startOfWeek(inicio, { weekStartsOn: 1 }), 13)),
      };
  }
}

/**
 * Format date range for display
 * @example "6 - 12 de Febrero 2026"
 */
export function formatearRangoFechas(inicio: Date, fin: Date): string {
  if (isSameDay(inicio, fin)) {
    return formatearFechaMostrar(inicio);
  }

  const inicioStr = format(inicio, 'd', { locale: es });
  const finStr = format(fin, "d 'de' MMMM yyyy", { locale: es });

  return `${inicioStr} - ${finStr}`;
}
