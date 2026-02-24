import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import {
  obtenerMisCitas,
  obtenerCita,
  cancelarCita,
  iniciarEdicionCita,
  confirmarEdicionCita,
  cancelarEdicionCita,
  type ParametrosMisCitas,
  type ListaCitasRespuesta,
  type CitaCompleta,
  type DatosEditarCita,
  type DatosConfirmarEdicion,
} from '../api/citas';
import { useNotificacion } from '../components/comunes/Notificacion';
import type { ErrorApi } from '../tipos';

/**
 * Hook for fetching current user's appointments
 * GET /api/v1/citas/me
 */
export function useMisCitas(params: ParametrosMisCitas = {}) {
  return useQuery<ListaCitasRespuesta, AxiosError<ErrorApi>>({
    queryKey: ['citas', 'me', params],
    queryFn: () => obtenerMisCitas(params),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook for fetching a single appointment
 * GET /api/v1/negocios/{negocioId}/citas/{citaId}
 */
export function useCita(negocioId: string, citaId: string) {
  return useQuery<CitaCompleta, AxiosError<ErrorApi>>({
    queryKey: ['citas', negocioId, citaId],
    queryFn: () => obtenerCita(negocioId, citaId),
    enabled: !!negocioId && !!citaId,
    staleTime: 30 * 1000,
  });
}

/**
 * Hook for canceling an appointment
 * DELETE /api/v1/negocios/{negocioId}/citas/{citaId}
 */
export function useCancelarCita() {
  const queryClient = useQueryClient();
  const { mostrarExito, mostrarError } = useNotificacion();

  return useMutation<
    CitaCompleta,
    AxiosError<ErrorApi>,
    { negocioId: string; citaId: string }
  >({
    mutationFn: ({ negocioId, citaId }) => cancelarCita(negocioId, citaId),

    onSuccess: () => {
      mostrarExito('Cita cancelada correctamente');

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['citas'] });
      queryClient.invalidateQueries({ queryKey: ['disponibilidad'] });
    },

    onError: (error) => {
      const mensaje = error.response?.data?.mensaje || 'Error al cancelar la cita';
      mostrarError(mensaje);
    },
  });
}

/**
 * Hook for starting an appointment edit
 * PUT /api/v1/negocios/{negocioId}/citas/{citaId}
 */
export function useIniciarEdicionCita() {
  const queryClient = useQueryClient();
  const { mostrarError } = useNotificacion();

  return useMutation<
    CitaCompleta,
    AxiosError<ErrorApi>,
    { negocioId: string; citaId: string; datos: DatosEditarCita }
  >({
    mutationFn: ({ negocioId, citaId, datos }) =>
      iniciarEdicionCita(negocioId, citaId, datos),

    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        ['citas', variables.negocioId, variables.citaId],
        data
      );
      queryClient.invalidateQueries({ queryKey: ['citas', 'me'] });
    },

    onError: (error) => {
      if (error.response?.status === 409) {
        mostrarError('El horario ya no esta disponible');
      } else {
        mostrarError('Error al iniciar la edicion de la cita');
      }
    },
  });
}

/**
 * Hook for confirming an appointment edit
 * POST /api/v1/negocios/{negocioId}/citas/{citaId}/confirmar
 */
export function useConfirmarEdicionCita() {
  const queryClient = useQueryClient();
  const { mostrarExito, mostrarError } = useNotificacion();

  return useMutation<
    CitaCompleta,
    AxiosError<ErrorApi>,
    { negocioId: string; citaId: string; datos: DatosConfirmarEdicion }
  >({
    mutationFn: ({ negocioId, citaId, datos }) =>
      confirmarEdicionCita(negocioId, citaId, datos),

    onSuccess: () => {
      mostrarExito('Cita actualizada correctamente');
      queryClient.invalidateQueries({ queryKey: ['citas'] });
      queryClient.invalidateQueries({ queryKey: ['disponibilidad'] });
    },

    onError: (error) => {
      if (error.response?.status === 409) {
        mostrarError('El horario ya no esta disponible');
        queryClient.invalidateQueries({ queryKey: ['disponibilidad'] });
      } else {
        mostrarError('Error al actualizar la cita');
      }
    },
  });
}

/**
 * Hook for canceling an appointment edit
 * DELETE /api/v1/negocios/{negocioId}/citas/{citaId}/edicion
 */
export function useCancelarEdicionCita() {
  const queryClient = useQueryClient();
  const { mostrarExito, mostrarError } = useNotificacion();

  return useMutation<
    CitaCompleta,
    AxiosError<ErrorApi>,
    { negocioId: string; citaId: string }
  >({
    mutationFn: ({ negocioId, citaId }) =>
      cancelarEdicionCita(negocioId, citaId),

    onSuccess: () => {
      mostrarExito('Edicion cancelada');
      queryClient.invalidateQueries({ queryKey: ['citas'] });
    },

    onError: (error) => {
      const mensaje = error.response?.data?.mensaje || 'Error al cancelar la edicion';
      mostrarError(mensaje);
    },
  });
}
