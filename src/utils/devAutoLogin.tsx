/**
 * Development auto-login utility.
 * Automatically logs in a mock user when running in development mode.
 */
import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { iniciarSesion } from '../api/auth';

// Mock user credentials - must match backend seed.py
const MOCK_USERS = {
  cliente: {
    email: 'cliente@test.com',
    contrasena: 'Test1234',
  },
  dueno: {
    email: 'dueno@test.com',
    contrasena: 'Test1234',
  },
} as const;

type MockUserType = keyof typeof MOCK_USERS;

/**
 * Get the mock user type from environment or default to 'cliente'
 * Set VITE_DEV_USER=dueno to auto-login as business owner
 */
function getMockUserType(): MockUserType {
  const envUser = import.meta.env.VITE_DEV_USER;
  if (envUser === 'dueno') return 'dueno';
  return 'cliente';
}

/**
 * Hook to auto-login in development mode.
 * Returns loading state while authenticating.
 */
export function useDevAutoLogin(): { isLoading: boolean; error: string | null } {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { estaAutenticado, iniciarSesion: setAuth } = useAuthStore();

  useEffect(() => {
    // Only run in development
    if (import.meta.env.PROD) return;
    // Skip if auto-login is disabled
    if (import.meta.env.VITE_DEV_AUTO_LOGIN === 'false') return;
    // Skip if already authenticated
    if (estaAutenticado) return;

    const autoLogin = async () => {
      setIsLoading(true);
      setError(null);

      const userType = getMockUserType();
      const credentials = MOCK_USERS[userType];

      try {
        console.log(`[Dev] Auto-logging in as ${userType}...`);
        const response = await iniciarSesion(credentials);
        setAuth(response.usuario, response.token);
        console.log(`[Dev] Auto-login successful as ${response.usuario.nombreCompleto}`);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Auto-login failed';
        console.warn(`[Dev] Auto-login failed: ${message}`);
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    autoLogin();
  }, [estaAutenticado, setAuth]);

  return { isLoading, error };
}

/**
 * Component to wrap the app and provide dev auto-login.
 * Shows loading state while authenticating in development.
 */
export function DevAutoLoginProvider({ children }: { children: React.ReactNode }) {
  const { isLoading, error } = useDevAutoLogin();

  // In production, just render children
  if (import.meta.env.PROD) {
    return <>{children}</>;
  }

  // Skip if auto-login is disabled
  if (import.meta.env.VITE_DEV_AUTO_LOGIN === 'false') {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Iniciando sesión automática (desarrollo)...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow">
          <p className="text-red-600 mb-4">Error en auto-login: {error}</p>
          <p className="text-gray-500 text-sm">
            Asegúrate de que el backend esté corriendo y los usuarios mock estén creados.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
