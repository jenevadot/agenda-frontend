import clienteApi from './cliente';
import type { Usuario, RespuestaLogin, DatosRegistro, DatosLogin } from '../tipos';

/**
 * Register a new user
 * POST /api/v1/auth/registrar
 */
export async function registrarUsuario(datos: DatosRegistro): Promise<Usuario> {
  const response = await clienteApi.post<UsuarioBackend>('/auth/registrar', {
    email: datos.email,
    contrasena: datos.contrasena,
    nombre_completo: datos.nombreCompleto,
    telefono: datos.telefono,
  });
  return transformarUsuario(response.data);
}

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

interface LoginBackendResponse {
  usuario: UsuarioBackend;
  token: string;
}

/**
 * Transform backend user to frontend format
 */
function transformarUsuario(usuario: UsuarioBackend): Usuario {
  return {
    id: usuario.id,
    email: usuario.email,
    nombreCompleto: usuario.nombre_completo,
    telefono: usuario.telefono,
    rol: usuario.rol,
  };
}

/**
 * Login user and get JWT token
 * POST /api/v1/auth/login
 */
export async function iniciarSesion(datos: DatosLogin): Promise<RespuestaLogin> {
  const response = await clienteApi.post<LoginBackendResponse>('/auth/login', {
    email: datos.email,
    contrasena: datos.contrasena,
  });

  return {
    usuario: transformarUsuario(response.data.usuario),
    token: response.data.token,
  };
}
