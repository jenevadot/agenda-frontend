import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import {
  obtenerNegocio,
  obtenerMisNegocios,
  obtenerNegociosPublicos,
  obtenerHorarios,
  guardarHorarios,
  obtenerExcepciones,
  crearExcepcion,
  eliminarExcepcion,
  obtenerCitasNegocio,
  type HorarioSemana,
  type DatosExcepcion,
  type FiltrosCitasNegocio,
} from '../api/negocios';
import { useNotificacion } from '../components/comunes/Notificacion';
import type { ErrorApi } from '../tipos';

/**
 * Hook for fetching a single business
 */
export function useNegocio(negocioId: string) {
  return useQuery({
    queryKey: ['negocio', negocioId],
    queryFn: () => obtenerNegocio(negocioId),
    enabled: !!negocioId,
  });
}

/**
 * Hook for fetching businesses owned by current user
 */
export function useMisNegocios() {
  return useQuery({
    queryKey: ['negocios', 'mios'],
    queryFn: obtenerMisNegocios,
  });
}

/**
 * Hook for fetching all active public businesses (directory/discovery)
 * Implements RF-FE-009, RF-FE-013
 */
export function useNegociosPublicos() {
  return useQuery({
    queryKey: ['negocios', 'publicos'],
    queryFn: obtenerNegociosPublicos,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for fetching business hours
 */
export function useHorariosNegocio(negocioId: string) {
  return useQuery({
    queryKey: ['horarios', negocioId],
    queryFn: () => obtenerHorarios(negocioId),
    enabled: !!negocioId,
  });
}

/**
 * Hook for saving business hours
 */
export function useGuardarHorarios(negocioId: string) {
  const queryClient = useQueryClient();
  const { mostrarExito, mostrarError } = useNotificacion();

  return useMutation<unknown, AxiosError<ErrorApi>, HorarioSemana[]>({
    mutationFn: (horarios) => guardarHorarios(negocioId, horarios),
    onSuccess: () => {
      mostrarExito('Horarios guardados correctamente');
      queryClient.invalidateQueries({ queryKey: ['horarios', negocioId] });
    },
    onError: (error) => {
      mostrarError(
        error.response?.data?.mensaje || 'Error al guardar horarios'
      );
    },
  });
}

/**
 * Hook for fetching exception dates
 */
export function useExcepcionesNegocio(negocioId: string) {
  return useQuery({
    queryKey: ['excepciones', negocioId],
    queryFn: () => obtenerExcepciones(negocioId),
    enabled: !!negocioId,
  });
}

/**
 * Hook for creating an exception date
 */
export function useCrearExcepcion(negocioId: string) {
  const queryClient = useQueryClient();
  const { mostrarExito, mostrarError } = useNotificacion();

  return useMutation<unknown, AxiosError<ErrorApi>, DatosExcepcion>({
    mutationFn: (datos) => crearExcepcion(negocioId, datos),
    onSuccess: () => {
      mostrarExito('Fecha de excepcion creada');
      queryClient.invalidateQueries({ queryKey: ['excepciones', negocioId] });
    },
    onError: (error) => {
      mostrarError(
        error.response?.data?.mensaje || 'Error al crear excepcion'
      );
    },
  });
}

/**
 * Hook for deleting an exception date
 */
export function useEliminarExcepcion(negocioId: string) {
  const queryClient = useQueryClient();
  const { mostrarExito, mostrarError } = useNotificacion();

  return useMutation<void, AxiosError<ErrorApi>, string>({
    mutationFn: (excepcionId) => eliminarExcepcion(negocioId, excepcionId),
    onSuccess: () => {
      mostrarExito('Fecha de excepcion eliminada');
      queryClient.invalidateQueries({ queryKey: ['excepciones', negocioId] });
    },
    onError: (error) => {
      mostrarError(
        error.response?.data?.mensaje || 'Error al eliminar excepcion'
      );
    },
  });
}

/**
 * Hook for fetching business appointments (admin calendar)
 */
export function useCitasNegocio(negocioId: string, filtros: FiltrosCitasNegocio) {
  return useQuery({
    queryKey: ['citas', 'negocio', negocioId, filtros],
    queryFn: () => obtenerCitasNegocio(negocioId, filtros),
    enabled: !!negocioId && !!filtros.fechaInicio && !!filtros.fechaFin,
    staleTime: 30000,
    refetchInterval: 60000, // Refresh every minute
  });
}
