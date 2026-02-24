import clienteApi from './cliente';
import type { Servicio } from '../tipos';

interface ServicioBackend {
  id: string;
  nombre: string;
  descripcion?: string;
  duracion_minutos: number;
  precio_pen: string | number;
  activo: boolean;
  negocio_id: string;
}

/**
 * Transform backend snake_case to frontend camelCase
 */
function transformarServicio(data: ServicioBackend): Servicio {
  return {
    id: data.id,
    negocioId: data.negocio_id,
    nombre: data.nombre,
    descripcion: data.descripcion,
    duracionMinutos: data.duracion_minutos,
    precioPen: typeof data.precio_pen === 'string' ? parseFloat(data.precio_pen) : data.precio_pen,
    activo: data.activo,
  };
}

/**
 * Get all active services for a business
 * GET /api/v1/negocios/{negocioId}/servicios
 */
export async function obtenerServicios(negocioId: string): Promise<Servicio[]> {
  const response = await clienteApi.get(`/negocios/${negocioId}/servicios`);
  // Backend returns paginated response: { items: [], total, pagina, por_pagina }
  return response.data.items.map(transformarServicio);
}

/**
 * Get a single service by ID
 * GET /api/v1/negocios/{negocioId}/servicios/{servicioId}
 */
export async function obtenerServicio(negocioId: string, servicioId: string): Promise<Servicio> {
  const response = await clienteApi.get(`/negocios/${negocioId}/servicios/${servicioId}`);
  return transformarServicio(response.data);
}
