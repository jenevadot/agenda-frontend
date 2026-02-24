import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { useNotificacion } from '../components/comunes';
import { iniciarSesion as loginApi } from '../api/auth';
import type { DatosLogin } from '../tipos';

/**
 * Hook for authentication operations
 * Implements RF-FE-005, RF-FE-006, RF-FE-007
 */
export function useAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { mostrarError, mostrarExito } = useNotificacion();

  const {
    usuario,
    token,
    estaAutenticado,
    iniciarSesion,
    cerrarSesion: logoutStore,
  } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      iniciarSesion(data.usuario, data.token);
      mostrarExito('Bienvenido!');

      // Redirect to original URL or home
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';
      navigate(from, { replace: true });
    },
    onError: (error: unknown) => {
      if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'status' in error.response &&
        error.response.status === 401
      ) {
        mostrarError('Credenciales incorrectas');
      } else {
        mostrarError('Error al iniciar sesión. Intenta de nuevo.');
      }
    },
  });

  const login = (datos: DatosLogin) => {
    loginMutation.mutate(datos);
  };

  const logout = () => {
    logoutStore();
    navigate('/login');
  };

  return {
    usuario,
    token,
    estaAutenticado,
    login,
    logout,
    isLoading: loginMutation.isPending,
    isError: loginMutation.isError,
  };
}
