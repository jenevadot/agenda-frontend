import { Link } from 'react-router-dom';
import { LogOut, User, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../comunes';

/**
 * Premium Header component with glass effect
 * Features elegant logo typography and underline hover effects
 */
export function Header() {
  const { estaAutenticado, usuario } = useAuthStore();
  const { logout } = useAuth();
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-[200]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            to={estaAutenticado ? '/dashboard' : '/'}
            className="flex items-center gap-1 group"
          >
            <span className="text-2xl font-bold tracking-tight text-black">
              Agenda
            </span>
            <span className="text-2xl font-light tracking-tight text-gray-400">
              Salon
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {estaAutenticado && usuario ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-500 hover:text-black transition-colors relative underline-effect"
                >
                  Dashboard
                </Link>
                <Link
                  to="/citas"
                  className="text-gray-500 hover:text-black transition-colors relative underline-effect"
                >
                  Mis Citas
                </Link>
                <Link
                  to="/cuenta"
                  className="text-gray-500 hover:text-black transition-colors relative underline-effect"
                >
                  Mi cuenta
                </Link>
                <div className="flex items-center gap-4 ml-4 pl-8 border-l border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <span className="font-medium text-black">{usuario.nombreCompleto}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="text-gray-500 hover:text-black"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="text-gray-600">
                    Iniciar sesion
                  </Button>
                </Link>
                <Link to="/registro">
                  <Button>Registrarse</Button>
                </Link>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
            onClick={() => setMenuAbierto(!menuAbierto)}
            aria-label="Toggle menu"
          >
            {menuAbierto ? (
              <X className="w-6 h-6 text-black" />
            ) : (
              <Menu className="w-6 h-6 text-black" />
            )}
          </button>
        </div>

        {/* Mobile navigation */}
        {menuAbierto && (
          <div className="md:hidden py-6 border-t border-gray-100 animate-fade-in">
            <nav className="flex flex-col gap-1">
              {estaAutenticado && usuario ? (
                <>
                  <div className="px-4 py-3 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-black">{usuario.nombreCompleto}</p>
                        <p className="text-sm text-gray-500">{usuario.email}</p>
                      </div>
                    </div>
                  </div>
                  <Link
                    to="/dashboard"
                    className="px-4 py-3 text-black hover:bg-gray-50 rounded-xl transition-colors"
                    onClick={() => setMenuAbierto(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/citas"
                    className="px-4 py-3 text-black hover:bg-gray-50 rounded-xl transition-colors"
                    onClick={() => setMenuAbierto(false)}
                  >
                    Mis Citas
                  </Link>
                  <Link
                    to="/cuenta"
                    className="px-4 py-3 text-black hover:bg-gray-50 rounded-xl transition-colors"
                    onClick={() => setMenuAbierto(false)}
                  >
                    Mi cuenta
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMenuAbierto(false);
                    }}
                    className="px-4 py-3 text-left text-gray-600 hover:bg-gray-50 rounded-xl transition-colors flex items-center gap-2 mt-2 border-t border-gray-100 pt-4"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar sesion
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-3 px-4">
                  <Link
                    to="/login"
                    onClick={() => setMenuAbierto(false)}
                  >
                    <Button variant="secondary" fullWidth>
                      Iniciar sesion
                    </Button>
                  </Link>
                  <Link
                    to="/registro"
                    onClick={() => setMenuAbierto(false)}
                  >
                    <Button fullWidth>
                      Registrarse
                    </Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
