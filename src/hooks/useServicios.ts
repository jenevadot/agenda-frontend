import { useQuery } from '@tanstack/react-query';
import { obtenerServicios, obtenerServicio } from '../api/servicios';

/**
 * Hook to fetch services for a business
 * Implements RF-FE-009
 */
export function useServicios(negocioId: string | undefined) {
  return useQuery({
    queryKey: ['servicios', negocioId],
    queryFn: () => obtenerServicios(negocioId!),
    staleTime: 30000, // 30 seconds
    enabled: !!negocioId,
  });
}

/**
 * Hook to fetch a single service
 */
export function useServicio(negocioId: string | undefined, servicioId: string | undefined) {
  return useQuery({
    queryKey: ['servicio', negocioId, servicioId],
    queryFn: () => obtenerServicio(negocioId!, servicioId!),
    staleTime: 30000,
    enabled: !!negocioId && !!servicioId,
  });
}
