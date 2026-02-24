import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { crearCita, type DatosCrearCita, type RespuestaCita } from '../api/citas';
import { useNotificacion } from '../components/comunes/Notificacion';
import { useFlujoReservaStore } from '../stores/flujoReservaStore';
import type { ErrorApi } from '../tipos';

interface VariablesCrearCita {
  datos: DatosCrearCita;
  claveIdempotencia: string;
}

/**
 * Hook for creating appointments
 * Implements RF-FE-029, RF-FE-030
 */
export function useCrearCita() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { mostrarExito, mostrarError } = useNotificacion();
  const { reiniciarFlujo, negocioId } = useFlujoReservaStore();

  return useMutation<RespuestaCita, AxiosError<ErrorApi>, VariablesCrearCita>({
    mutationFn: ({ datos, claveIdempotencia }) => crearCita(datos, claveIdempotencia),

    onSuccess: (respuesta) => {
      // Show success message with confirmation number (RF-FE-029)
      mostrarExito(
        `Reserva confirmada. Tu codigo es: ${respuesta.numeroConfirmacion}`,
        8000
      );

      // Invalidate availability queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ['disponibilidad', negocioId],
      });

      // Invalidate user appointments queries
      queryClient.invalidateQueries({
        queryKey: ['citas'],
      });

      // Clean up booking flow store
      reiniciarFlujo();

      // Navigate to appointments page
      navigate('/citas');
    },

    onError: (error) => {
      const errorData = error.response?.data;

      // Handle specific error cases (RF-FE-030)
      if (error.response?.status === 409) {
        // Slot no longer available
        mostrarError(
          errorData?.mensaje ||
            'El espacio ya no esta disponible. Por favor selecciona otro horario.',
          8000
        );

        // Invalidate availability to show updated data
        queryClient.invalidateQueries({
          queryKey: ['disponibilidad'],
        });
      } else if (error.code === 'ERR_NETWORK') {
        // Network error
        mostrarError(
          'Error de conexion. Por favor verifica tu internet e intenta nuevamente.',
          8000
        );
      } else {
        // Generic error
        mostrarError(
          errorData?.mensaje || 'Error al crear la reserva. Intenta nuevamente.',
          8000
        );
      }
    },

    // Retry configuration
    retry: (failureCount, error) => {
      // Don't retry 4xx errors
      if (error.response?.status && error.response.status >= 400 && error.response.status < 500) {
        return false;
      }
      // Retry up to 2 times for network errors and 5xx
      return failureCount < 2;
    },
  });
}
