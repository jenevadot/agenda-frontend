import clienteApi from './cliente';
import type { DisponibilidadDia } from '../tipos';

interface ParamsDisponibilidad {
  negocioId: string;
  servicioId: string;
  fechaInicio: string;
  fechaFin: string;
  personalId?: string;
}

interface PersonalBackend {
  id: string;
  nombre: string;
}

interface SlotBackend {
  hora_inicio: string;
  hora_fin: string;
  personal_disponible: PersonalBackend[];
}

interface DisponibilidadBackend {
  fecha: string;
  slots: SlotBackend[];
}

/**
 * Transform backend response to frontend format
 * Now preserves all available staff per slot
 */
function transformarDisponibilidadDia(data: DisponibilidadBackend): DisponibilidadDia {
  return {
    fecha: data.fecha,
    slots: data.slots.map((slot) => ({
      inicio: slot.hora_inicio,
      fin: slot.hora_fin,
      personalDisponible: slot.personal_disponible.map((p) => ({
        id: p.id,
        nombre: p.nombre,
      })),
    })),
  };
}

/**
 * Get availability for a service
 * GET /api/v1/negocios/{negocioId}/disponibilidad
 */
export async function obtenerDisponibilidad(
  params: ParamsDisponibilidad
): Promise<DisponibilidadDia[]> {
  const response = await clienteApi.get(`/negocios/${params.negocioId}/disponibilidad`, {
    params: {
      servicio_id: params.servicioId,
      fecha_inicio: params.fechaInicio,
      fecha_fin: params.fechaFin,
      ...(params.personalId && { personal_id: params.personalId }),
    },
  });

  // Handle case where response is an array or object with disponibilidad array
  const data = Array.isArray(response.data)
    ? response.data
    : response.data.disponibilidad || [];

  return data.map(transformarDisponibilidadDia);
}
