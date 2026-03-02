import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { useAuthStore } from '../stores/authStore';
import { useNotificacion } from '../components/comunes/Notificacion';
import type { ErrorApi } from '../tipos';
import {
  obtenerMiPerfil,
  actualizarMiPerfil,
  obtenerMisPreferencias,
  guardarMisPreferencias,
} from '../api/usuarios';
import type { ActualizarPerfilRequest, GuardarPreferenciasRequest } from '../tipos';

/**
 * Hook for fetching the authenticated user's profile
 */
export function useMiPerfil() {
  const { estaAutenticado } = useAuthStore();

  return useQuery({
    queryKey: ['usuarios', 'me'],
    queryFn: obtenerMiPerfil,
    enabled: estaAutenticado,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for updating the authenticated user's profile
 * Syncs the updated user into the auth store on success
 */
export function useActualizarPerfil() {
  const queryClient = useQueryClient();
  const { mostrarExito, mostrarError } = useNotificacion();
  const { setUsuario } = useAuthStore();

  return useMutation<
    Awaited<ReturnType<typeof actualizarMiPerfil>>,
    AxiosError<ErrorApi>,
    ActualizarPerfilRequest
  >({
    mutationFn: actualizarMiPerfil,
    onSuccess: (usuario) => {
      mostrarExito('Perfil actualizado correctamente');
      setUsuario(usuario);
      queryClient.invalidateQueries({ queryKey: ['usuarios', 'me'] });
    },
    onError: (error) => {
      mostrarError(error.response?.data?.mensaje || 'Error al actualizar el perfil');
    },
  });
}

/**
 * Hook for fetching the authenticated user's preferences
 * Returns null when no preferences have been set (404 absorbed)
 */
export function useMisPreferencias() {
  const { estaAutenticado } = useAuthStore();

  return useQuery({
    queryKey: ['usuarios', 'me', 'preferencias'],
    queryFn: obtenerMisPreferencias,
    enabled: estaAutenticado,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for saving (create or replace) the authenticated user's preferences
 */
export function useGuardarPreferencias() {
  const queryClient = useQueryClient();
  const { mostrarExito, mostrarError } = useNotificacion();

  return useMutation<
    Awaited<ReturnType<typeof guardarMisPreferencias>>,
    AxiosError<ErrorApi>,
    GuardarPreferenciasRequest
  >({
    mutationFn: guardarMisPreferencias,
    onSuccess: () => {
      mostrarExito('Preferencias guardadas correctamente');
      queryClient.invalidateQueries({ queryKey: ['usuarios', 'me', 'preferencias'] });
    },
    onError: (error) => {
      mostrarError(error.response?.data?.mensaje || 'Error al guardar las preferencias');
    },
  });
}
