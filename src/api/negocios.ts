import clienteApi from './cliente';
import type { Negocio, HorarioNegocio, FechaExcepcion, CrearNegocioRequest, PersonalResumen } from '../tipos';

/**
 * Backend response types
 */
interface NegocioBackend {
  id: string;
  nombre: string;
  slug: string;
  direccion?: string | null;
  telefono?: string | null;
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
  dueno_id?: string;
}

interface HorarioBackend {
  id: string;
  negocio_id: string;
  dia_semana: number;
  hora_apertura: string;
  hora_cierre: string;
  activo: boolean;
}

interface FechaExcepcionBackend {
  id: string;
  negocio_id: string;
  fecha_excepcion: string;
  motivo?: string;
}

/**
 * Transform functions
 */
function transformarNegocio(data: NegocioBackend): Negocio {
  return {
    id: data.id,
    nombre: data.nombre,
    slug: data.slug,
    direccion: data.direccion ?? null,
    telefono: data.telefono ?? null,
    duenoId: data.dueno_id || '',
    activo: data.activo,
    creadoEn: data.creado_en,
    actualizadoEn: data.actualizado_en,
  };
}

function transformarHorario(data: HorarioBackend): HorarioNegocio {
  return {
    id: data.id,
    negocioId: data.negocio_id,
    diaSemana: data.dia_semana,
    horaApertura: data.hora_apertura,
    horaCierre: data.hora_cierre,
    activo: data.activo,
  };
}

function transformarExcepcion(data: FechaExcepcionBackend): FechaExcepcion {
  return {
    id: data.id,
    negocioId: data.negocio_id,
    fechaExcepcion: data.fecha_excepcion,
    motivo: data.motivo,
  };
}

/**
 * Get business by ID
 * GET /api/v1/negocios/{negocioId}
 */
export async function obtenerNegocio(negocioId: string): Promise<Negocio> {
  const response = await clienteApi.get<NegocioBackend>(`/negocios/${negocioId}`);
  return transformarNegocio(response.data);
}

/**
 * Get businesses owned by current user
 * GET /api/v1/negocios/
 */
export async function obtenerMisNegocios(): Promise<Negocio[]> {
  const response = await clienteApi.get<NegocioBackend[]>('/negocios/');
  return response.data.map(transformarNegocio);
}

/**
 * Get all active public businesses (discovery/directory)
 * GET /api/v1/negocios/publicos
 * Implements RF-FE-009
 */
export async function obtenerNegociosPublicos(): Promise<Negocio[]> {
  const response = await clienteApi.get<NegocioBackend[]>('/negocios/publicos');
  return response.data.map(transformarNegocio);
}

/**
 * Create a new business
 * POST /api/v1/negocios/
 * Implements RF-FE-046
 */
export async function crearNegocio(datos: CrearNegocioRequest): Promise<Negocio> {
  const payload = {
    nombre: datos.nombre,
    direccion: datos.direccion || null,
    telefono: datos.telefono || null,
  };

  const response = await clienteApi.post<NegocioBackend>('/negocios/', payload);
  return transformarNegocio(response.data);
}

/**
 * Get business hours configuration
 * GET /api/v1/negocios/{negocioId}/horarios
 */
export async function obtenerHorarios(negocioId: string): Promise<HorarioNegocio[]> {
  const response = await clienteApi.get<HorarioBackend[]>(
    `/negocios/${negocioId}/horarios`
  );
  return response.data.map(transformarHorario);
}

/**
 * Data for saving business hours
 */
export interface HorarioSemana {
  diaSemana: number; // 0-6 (0 = Lunes, 6 = Domingo)
  abierto: boolean;
  horaApertura: string; // HH:mm
  horaCierre: string;
}

/**
 * Save business hours configuration
 * POST /api/v1/negocios/{negocioId}/horarios
 */
export async function guardarHorarios(
  negocioId: string,
  horarios: HorarioSemana[]
): Promise<HorarioNegocio[]> {
  const payload = horarios.map((h) => ({
    dia_semana: h.diaSemana,
    hora_apertura: h.horaApertura,
    hora_cierre: h.horaCierre,
    activo: h.abierto,
  }));

  const response = await clienteApi.post<HorarioBackend[]>(
    `/negocios/${negocioId}/horarios`,
    payload
  );
  return response.data.map(transformarHorario);
}

/**
 * Get exception dates
 * GET /api/v1/negocios/{negocioId}/excepciones
 */
export async function obtenerExcepciones(negocioId: string): Promise<FechaExcepcion[]> {
  const response = await clienteApi.get<FechaExcepcionBackend[]>(
    `/negocios/${negocioId}/excepciones`
  );
  return response.data.map(transformarExcepcion);
}

/**
 * Data for creating an exception date
 */
export interface DatosExcepcion {
  fecha: string; // YYYY-MM-DD
  motivo: string;
}

/**
 * Create exception date
 * POST /api/v1/negocios/{negocioId}/excepciones
 */
export async function crearExcepcion(
  negocioId: string,
  datos: DatosExcepcion
): Promise<FechaExcepcion> {
  const response = await clienteApi.post<FechaExcepcionBackend>(
    `/negocios/${negocioId}/excepciones`,
    {
      fecha_excepcion: datos.fecha,
      motivo: datos.motivo,
    }
  );
  return transformarExcepcion(response.data);
}

/**
 * Delete exception date
 * DELETE /api/v1/negocios/{negocioId}/excepciones/{excepcionId}
 */
export async function eliminarExcepcion(
  negocioId: string,
  excepcionId: string
): Promise<void> {
  await clienteApi.delete(`/negocios/${negocioId}/excepciones/${excepcionId}`);
}

/**
 * Parameters for fetching business appointments
 */
export interface FiltrosCitasNegocio {
  fechaInicio: string;
  fechaFin: string;
  personalId?: string;
}

/**
 * Appointment for business calendar view
 */
export interface CitaNegocio {
  id: string;
  numeroConfirmacion: string;
  estado: string;
  clienteNombre: string;
  clienteEmail: string;
  clienteTelefono: string;
  fechaHoraInicio: string;
  fechaHoraFin: string;
  servicioId: string;
  servicioNombre: string;
  servicioDuracionMinutos: number;
  personalId: string;
  personalNombre: string;
}

interface CitaNegocioBackend {
  id: string;
  numero_confirmacion: string;
  estado: string;
  cliente_nombre: string;
  cliente_email: string;
  cliente_telefono: string;
  fecha_hora_inicio: string;
  fecha_hora_fin: string;
  servicio: {
    id: string;
    nombre: string;
    duracion_minutos: number;
  };
  personal: {
    id: string;
    nombre: string;
  };
}

function transformarCitaNegocio(data: CitaNegocioBackend): CitaNegocio {
  return {
    id: data.id,
    numeroConfirmacion: data.numero_confirmacion,
    estado: data.estado,
    clienteNombre: data.cliente_nombre,
    clienteEmail: data.cliente_email,
    clienteTelefono: data.cliente_telefono,
    fechaHoraInicio: data.fecha_hora_inicio,
    fechaHoraFin: data.fecha_hora_fin,
    servicioId: data.servicio.id,
    servicioNombre: data.servicio.nombre,
    servicioDuracionMinutos: data.servicio.duracion_minutos,
    personalId: data.personal.id,
    personalNombre: data.personal.nombre,
  };
}

/**
 * Get appointments for a business (admin view)
 * GET /api/v1/negocios/{negocioId}/citas
 */
export async function obtenerCitasNegocio(
  negocioId: string,
  filtros: FiltrosCitasNegocio
): Promise<CitaNegocio[]> {
  const params = new URLSearchParams();
  params.append('fecha_inicio', filtros.fechaInicio);
  params.append('fecha_fin', filtros.fechaFin);
  if (filtros.personalId) {
    params.append('personal_id', filtros.personalId);
  }

  const response = await clienteApi.get<{ citas: CitaNegocioBackend[] }>(
    `/negocios/${negocioId}/citas?${params.toString()}`
  );
  return response.data.citas.map(transformarCitaNegocio);
}

/**
 * Mark an appointment as no-show (owner only)
 * PATCH /api/v1/negocios/{negocioId}/citas/{citaId}/no-show
 */
export async function marcarNoShow(
  negocioId: string,
  citaId: string
): Promise<void> {
  await clienteApi.patch(`/negocios/${negocioId}/citas/${citaId}/no-show`);
}

interface PersonalBackend {
  id: string;
  nombre: string;
  activo: boolean;
}

/**
 * Get staff for a business (for preferences form)
 * GET /api/v1/negocios/{negocioId}/personal
 */
export async function obtenerPersonalNegocio(negocioId: string): Promise<PersonalResumen[]> {
  const response = await clienteApi.get<{ items: PersonalBackend[]; total: number }>(
    `/negocios/${negocioId}/personal`
  );
  return response.data.items.map((p) => ({ id: p.id, nombre: p.nombre, activo: p.activo }));
}
