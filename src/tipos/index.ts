import type { DiaSemana } from '../schemas/preferencias';

// User types
export interface Usuario {
  id: string;
  email: string;
  nombreCompleto: string;
  telefono: string;
  rol: 'cliente' | 'dueno_negocio';
}

// Authentication types
export interface RespuestaLogin {
  usuario: Usuario;
  token: string;
}

export interface DatosRegistro {
  email: string;
  contrasena: string;
  nombreCompleto: string;
  telefono: string;
}

export interface DatosLogin {
  email: string;
  contrasena: string;
}

// Business types
export interface Negocio {
  id: string;
  nombre: string;
  slug: string;
  direccion: string | null;
  telefono: string | null;
  duenoId: string;
  activo: boolean;
  creadoEn: string;
  actualizadoEn: string;
}

export interface CrearNegocioRequest {
  nombre: string;
  direccion?: string | null;
  telefono?: string | null;
}

// Service types
export interface Servicio {
  id: string;
  negocioId: string;
  nombre: string;
  descripcion?: string;
  duracionMinutos: number;
  precioPen: number;
  activo: boolean;
}

// Staff types
export interface Personal {
  id: string;
  negocioId: string;
  nombre: string;
  email?: string;
  activo: boolean;
}

// Appointment types
export type EstadoCita =
  | 'pendiente'
  | 'confirmada'
  | 'pendiente_actualizacion'
  | 'completada'
  | 'cancelada'
  | 'no_asistio';

export interface Cita {
  id: string;
  negocioId: string;
  usuarioId?: string;
  servicioId: string;
  personalId: string;
  fechaHoraInicio: string;
  fechaHoraFin: string;
  clienteNombre: string;
  clienteEmail: string;
  clienteTelefono: string;
  estado: EstadoCita;
  numeroConfirmacion: string;
  creadoEn: string;
  actualizadoEn: string;
  servicio?: Servicio;
  personal?: Personal;
}

// Availability types
export interface PersonalDisponible {
  id: string;
  nombre: string;
}

export interface SlotDisponible {
  inicio: string;
  fin: string;
  personalDisponible: PersonalDisponible[];
}

export interface DisponibilidadDia {
  fecha: string;
  slots: SlotDisponible[];
}

export interface RespuestaDisponibilidad {
  servicioId: string;
  fechaInicio: string;
  fechaFin: string;
  disponibilidad: DisponibilidadDia[];
}

// Business hours types
export interface HorarioNegocio {
  id: string;
  negocioId: string;
  diaSemana: number; // 0-6 (Sunday-Saturday)
  horaApertura: string;
  horaCierre: string;
  activo: boolean;
}

export interface FechaExcepcion {
  id: string;
  negocioId: string;
  fechaExcepcion: string;
  motivo?: string;
}

// API Error types
export interface ErrorApi {
  error: string;
  mensaje: string;
  detalles?: Record<string, unknown>;
  timestamp: string;
}

// Contact info for booking
export interface InfoContacto {
  nombre: string;
  email: string;
  telefono: string;
}

// Create appointment request
export interface CrearCitaRequest {
  servicioId: string;
  personalId?: string;
  fechaHoraCita: string;
  contacto: InfoContacto;
  notas?: string;
}

// User preferences
export interface PreferenciasUsuario {
  id: string;
  usuarioId: string;
  diasPreferentes: DiaSemana[];
  negocioId: string | null;
  personalId: string | null;
  comentario: string | null;
  creadoEn: string;
  actualizadoEn: string;
}

export interface GuardarPreferenciasRequest {
  diasPreferentes: DiaSemana[];
  negocioId: string | null;
  personalId: string | null;
  comentario: string | null;
}

export interface ActualizarPerfilRequest {
  nombreCompleto?: string;
  telefono?: string;
}

export interface PersonalResumen {
  id: string;
  nombre: string;
  activo: boolean;
}
