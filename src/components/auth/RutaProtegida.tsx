import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface RutaProtegidaProps {
  children: React.ReactNode;
  rolesPermitidos?: ('cliente' | 'dueno_negocio')[];
}

/**
 * Protected route component
 * Redirects to login if not authenticated
 * Implements RF-FE-007, RF-FE-008
 */
export function RutaProtegida({ children, rolesPermitidos }: RutaProtegidaProps) {
  const { estaAutenticado, usuario } = useAuthStore();
  const location = useLocation();

  // Not authenticated - redirect to login, preserve original URL
  if (!estaAutenticado) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role permissions if specified
  if (rolesPermitidos && usuario && !rolesPermitidos.includes(usuario.rol)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
