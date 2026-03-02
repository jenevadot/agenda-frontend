import clienteApi from './cliente';
import type { DiaSemana } from '../schemas/preferencias';
import type { Usuario, PreferenciasUsuario, GuardarPreferenciasRequest, ActualizarPerfilRequest } from '../tipos';

/**
 * Backend response types
 */
interface UsuarioBackend {
  id: string;
  email: string;
  nombre_completo: string;
  telefono: string;
  rol: 'cliente' | 'dueno_negocio';
  creado_en: string;
}

interface PreferenciasBackend {
  id: string;
  usuario_id: string;
  dias_preferentes: string[];
  negocio_id: string | null;
  personal_id: string | null;
  comentario: string | null;
  creado_en: string;
  actualizado_en: string;
}

/**
 * Transform functions
 */
function transformarUsuario(data: UsuarioBackend): Usuario {
  return {
    id: data.id,
    email: data.email,
    nombreCompleto: data.nombre_completo,
    telefono: data.telefono,
    rol: data.rol,
  };
}

function transformarPreferencias(data: PreferenciasBackend): PreferenciasUsuario {
  return {
    id: data.id,
    usuarioId: data.usuario_id,
    diasPreferentes: data.dias_preferentes as DiaSemana[],
    negocioId: data.negocio_id,
    personalId: data.personal_id,
    comentario: data.comentario,
    creadoEn: data.creado_en,
    actualizadoEn: data.actualizado_en,
  };
}

/**
 * Get profile of the authenticated user
 * GET /api/v1/usuarios/me
 */
export async function obtenerMiPerfil(): Promise<Usuario> {
  const response = await clienteApi.get<UsuarioBackend>('/usuarios/me');
  return transformarUsuario(response.data);
}

/**
 * Update profile of the authenticated user
 * PUT /api/v1/usuarios/me
 */
export async function actualizarMiPerfil(datos: ActualizarPerfilRequest): Promise<Usuario> {
  const response = await clienteApi.put<UsuarioBackend>('/usuarios/me', {
    nombre_completo: datos.nombreCompleto,
    telefono: datos.telefono,
  });
  return transformarUsuario(response.data);
}

/**
 * Get preferences of the authenticated user
 * GET /api/v1/usuarios/me/preferencias
 * Returns null if preferences haven't been set (404 from API)
 */
export async function obtenerMisPreferencias(): Promise<PreferenciasUsuario | null> {
  try {
    const response = await clienteApi.get<PreferenciasBackend>('/usuarios/me/preferencias');
    return transformarPreferencias(response.data);
  } catch (error: unknown) {
    if (
      error &&
      typeof error === 'object' &&
      'response' in error &&
      (error as { response?: { status?: number } }).response?.status === 404
    ) {
      return null;
    }
    throw error;
  }
}

/**
 * Save (create or replace) preferences of the authenticated user
 * PUT /api/v1/usuarios/me/preferencias
 */
export async function guardarMisPreferencias(
  datos: GuardarPreferenciasRequest
): Promise<PreferenciasUsuario> {
  const response = await clienteApi.put<PreferenciasBackend>('/usuarios/me/preferencias', {
    dias_preferentes: datos.diasPreferentes,
    negocio_id: datos.negocioId,
    personal_id: datos.personalId,
    comentario: datos.comentario,
  });
  return transformarPreferencias(response.data);
}
