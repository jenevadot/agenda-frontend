import clienteApi from './cliente';

/**
 * Request payload for creating an appointment
 */
export interface DatosCrearCita {
  negocioId: string;
  servicioId: string;
  personalId: string | null;
  fechaHoraCita: string; // ISO datetime
  clienteNombre: string;
  clienteEmail: string;
  clienteTelefono: string;
}

/**
 * Appointment status types
 */
export type EstadoCita = 'confirmada' | 'pendiente_actualizacion' | 'cancelada' | 'completada' | 'no_show';

/**
 * Service info in appointment response
 */
export interface ServicioEnCita {
  id: string;
  nombre: string;
  duracionMinutos: number;
}

/**
 * Staff info in appointment response
 */
export interface PersonalEnCita {
  id: string;
  nombre: string;
}

/**
 * Business info in appointment response
 */
export interface NegocioEnCita {
  id: string;
  nombre: string;
  slug: string;
}

/**
 * Full appointment response
 */
export interface CitaCompleta {
  id: string;
  numeroConfirmacion: string;
  estado: EstadoCita;
  clienteNombre: string;
  clienteEmail: string;
  clienteTelefono: string;
  fechaHoraInicio: string;
  fechaHoraFin: string;
  negocio: NegocioEnCita;
  servicio: ServicioEnCita;
  personal: PersonalEnCita;
  tieneFeedback: boolean;
  creadoEn: string;
  actualizadoEn: string;
}

/**
 * Response from creating an appointment (simple)
 */
export interface RespuestaCita {
  id: string;
  numeroConfirmacion: string;
  servicioNombre: string;
  personalNombre: string;
  fechaHoraInicio: string;
  fechaHoraFin: string;
  estado: string;
}

/**
 * Paginated list response
 */
export interface ListaCitasRespuesta {
  citas: CitaCompleta[];
  total: number;
  pagina: number;
  porPagina: number;
}

/**
 * Feedback types
 */
export type SatisfaccionCita = 'satisfecho' | 'normal' | 'no_satisfecho';
export type MotivoCita = 'tecnica' | 'higiene' | 'duracion' | 'puntualidad' | 'comunicacion';

export interface DatosCrearFeedback {
  satisfaccion: SatisfaccionCita;
  motivos: MotivoCita[];
  recomienda: boolean;
  comentario?: string;
}

export interface FeedbackCita {
  id: string;
  citaId: string;
  satisfaccion: SatisfaccionCita;
  motivos: MotivoCita[];
  recomienda: boolean;
  comentario?: string;
  creadoEn: string;
}

/**
 * Backend response structures
 */
interface CitaBackend {
  id: string;
  numero_confirmacion: string;
  servicio_nombre: string;
  personal_nombre: string;
  fecha_hora_inicio: string;
  fecha_hora_fin: string;
  estado: string;
}

interface CitaCompletaBackend {
  id: string;
  numero_confirmacion: string;
  estado: string;
  cliente_nombre: string;
  cliente_email: string;
  cliente_telefono: string;
  fecha_hora_inicio: string;
  fecha_hora_fin: string;
  tiene_feedback: boolean;
  negocio: {
    id: string;
    nombre: string;
    slug: string;
  };
  servicio: {
    id: string;
    nombre: string;
    duracion_minutos: number;
  };
  personal: {
    id: string;
    nombre: string;
  };
  creado_en: string;
  actualizado_en: string;
}

interface ListaCitasBackend {
  citas: CitaCompletaBackend[];
  total: number;
  pagina: number;
  por_pagina: number;
}

/**
 * Transform simple backend response to frontend format
 */
function transformarRespuestaCita(data: CitaBackend): RespuestaCita {
  return {
    id: data.id,
    numeroConfirmacion: data.numero_confirmacion,
    servicioNombre: data.servicio_nombre,
    personalNombre: data.personal_nombre,
    fechaHoraInicio: data.fecha_hora_inicio,
    fechaHoraFin: data.fecha_hora_fin,
    estado: data.estado,
  };
}

/**
 * Transform full appointment backend response to frontend format
 */
function transformarCitaCompleta(data: CitaCompletaBackend): CitaCompleta {
  return {
    id: data.id,
    numeroConfirmacion: data.numero_confirmacion,
    estado: data.estado as EstadoCita,
    clienteNombre: data.cliente_nombre,
    clienteEmail: data.cliente_email,
    clienteTelefono: data.cliente_telefono,
    fechaHoraInicio: data.fecha_hora_inicio,
    fechaHoraFin: data.fecha_hora_fin,
    tieneFeedback: data.tiene_feedback ?? false,
    negocio: {
      id: data.negocio.id,
      nombre: data.negocio.nombre,
      slug: data.negocio.slug,
    },
    servicio: {
      id: data.servicio.id,
      nombre: data.servicio.nombre,
      duracionMinutos: data.servicio.duracion_minutos,
    },
    personal: {
      id: data.personal.id,
      nombre: data.personal.nombre,
    },
    creadoEn: data.creado_en,
    actualizadoEn: data.actualizado_en,
  };
}

/**
 * Create a new appointment
 * POST /api/v1/negocios/{negocioId}/citas
 */
export async function crearCita(
  datos: DatosCrearCita,
  claveIdempotencia: string
): Promise<RespuestaCita> {
  const response = await clienteApi.post(
    `/negocios/${datos.negocioId}/citas`,
    {
      servicio_id: datos.servicioId,
      personal_id: datos.personalId,
      fecha_hora_cita: datos.fechaHoraCita,
      cliente_nombre: datos.clienteNombre,
      cliente_email: datos.clienteEmail,
      cliente_telefono: datos.clienteTelefono,
    },
    {
      headers: {
        'Idempotency-Key': claveIdempotencia,
      },
    }
  );

  return transformarRespuestaCita(response.data);
}

/**
 * Parameters for fetching user appointments
 */
export interface ParametrosMisCitas {
  estado?: string;
  pagina?: number;
  porPagina?: number;
}

/**
 * Get current user's appointments
 * GET /api/v1/citas/me
 */
export async function obtenerMisCitas(
  params: ParametrosMisCitas = {}
): Promise<ListaCitasRespuesta> {
  const { estado, pagina = 1, porPagina = 20 } = params;

  const queryParams = new URLSearchParams();
  if (estado) queryParams.append('estado', estado);
  queryParams.append('pagina', pagina.toString());
  queryParams.append('por_pagina', porPagina.toString());

  const response = await clienteApi.get<ListaCitasBackend>(
    `/citas/me?${queryParams.toString()}`
  );

  return {
    citas: response.data.citas.map(transformarCitaCompleta),
    total: response.data.total,
    pagina: response.data.pagina,
    porPagina: response.data.por_pagina,
  };
}

/**
 * Cancel an appointment
 * DELETE /api/v1/negocios/{negocioId}/citas/{citaId}
 */
export async function cancelarCita(
  negocioId: string,
  citaId: string
): Promise<CitaCompleta> {
  const response = await clienteApi.delete<CitaCompletaBackend>(
    `/negocios/${negocioId}/citas/${citaId}`
  );

  return transformarCitaCompleta(response.data);
}

/**
 * Get a single appointment by ID
 * GET /api/v1/negocios/{negocioId}/citas/{citaId}
 */
export async function obtenerCita(
  negocioId: string,
  citaId: string
): Promise<CitaCompleta> {
  const response = await clienteApi.get<CitaCompletaBackend>(
    `/negocios/${negocioId}/citas/${citaId}`
  );

  return transformarCitaCompleta(response.data);
}

/**
 * Data for editing an appointment
 */
export interface DatosEditarCita {
  fechaHoraCita?: string;
  personalId?: string | null;
}

/**
 * Start editing an appointment (put in pending_update state)
 * PUT /api/v1/negocios/{negocioId}/citas/{citaId}
 */
export async function iniciarEdicionCita(
  negocioId: string,
  citaId: string,
  datos: DatosEditarCita
): Promise<CitaCompleta> {
  const response = await clienteApi.put<CitaCompletaBackend>(
    `/negocios/${negocioId}/citas/${citaId}`,
    {
      fecha_hora_cita: datos.fechaHoraCita,
      personal_id: datos.personalId,
    }
  );

  return transformarCitaCompleta(response.data);
}

/**
 * Data for confirming an appointment edit
 */
export interface DatosConfirmarEdicion {
  fechaHoraCita: string;
  personalId?: string | null;
}

/**
 * Confirm appointment edit
 * POST /api/v1/negocios/{negocioId}/citas/{citaId}/confirmar
 */
export async function confirmarEdicionCita(
  negocioId: string,
  citaId: string,
  datos: DatosConfirmarEdicion
): Promise<CitaCompleta> {
  const response = await clienteApi.post<CitaCompletaBackend>(
    `/negocios/${negocioId}/citas/${citaId}/confirmar`,
    {
      fecha_hora_cita: datos.fechaHoraCita,
      personal_id: datos.personalId,
    }
  );

  return transformarCitaCompleta(response.data);
}

/**
 * Cancel appointment editing process
 * DELETE /api/v1/negocios/{negocioId}/citas/{citaId}/edicion
 */
export async function cancelarEdicionCita(
  negocioId: string,
  citaId: string
): Promise<CitaCompleta> {
  const response = await clienteApi.delete<CitaCompletaBackend>(
    `/negocios/${negocioId}/citas/${citaId}/edicion`
  );

  return transformarCitaCompleta(response.data);
}

/**
 * Create feedback for a completed appointment
 * POST /api/v1/citas/{citaId}/feedback
 */
export async function crearFeedbackCita(
  citaId: string,
  datos: DatosCrearFeedback
): Promise<FeedbackCita> {
  const response = await clienteApi.post<{
    id: string;
    cita_id: string;
    satisfaccion: SatisfaccionCita;
    motivos: MotivoCita[];
    recomienda: boolean;
    comentario?: string;
    creado_en: string;
  }>(`/citas/${citaId}/feedback`, {
    satisfaccion: datos.satisfaccion,
    motivos: datos.motivos,
    recomienda: datos.recomienda,
    comentario: datos.comentario,
  });

  return {
    id: response.data.id,
    citaId: response.data.cita_id,
    satisfaccion: response.data.satisfaccion,
    motivos: response.data.motivos,
    recomienda: response.data.recomienda,
    comentario: response.data.comentario,
    creadoEn: response.data.creado_en,
  };
}
