import { useQuery } from '@tanstack/react-query';
import { obtenerDisponibilidad } from '../api/disponibilidad';

interface ParamsDisponibilidad {
  negocioId: string;
  servicioId: string;
  fechaInicio: string;
  fechaFin: string;
  personalId?: string;
}

/**
 * Hook to fetch availability for a service
 * Implements RF-FE-022 (polling every 30 seconds)
 */
export function useDisponibilidad(params: ParamsDisponibilidad | null) {
  return useQuery({
    queryKey: ['disponibilidad', params],
    queryFn: () => obtenerDisponibilidad(params!),
    staleTime: 30000, // 30 seconds
    refetchInterval: 30000, // Poll every 30 seconds
    enabled: !!params?.servicioId && !!params?.fechaInicio && !!params?.fechaFin,
  });
}
