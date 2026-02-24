import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Scissors, Clock, Calendar, Users, LogOut } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../comunes/Button';

interface Props {
  children: React.ReactNode;
  negocioId: string;
}

const navItems = [
  { path: '', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/servicios', label: 'Servicios', icon: Scissors },
  { path: '/horarios', label: 'Horarios', icon: Clock },
  { path: '/agenda', label: 'Agenda', icon: Calendar },
  { path: '/personal', label: 'Personal', icon: Users },
];

/**
 * Layout component for admin panel
 * Provides sidebar navigation and header
 */
export function LayoutAdmin({ children, negocioId }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const { usuario } = useAuthStore();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const basePath = `/admin/${negocioId}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-[100]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-xl font-semibold text-gray-900">
              Agenda Salon
            </Link>
            <span className="text-gray-300">|</span>
            <h1 className="text-lg font-medium text-gray-700">
              Panel de Administracion
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-gray-600 font-medium">
                  {usuario?.nombreCompleto?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-gray-600 hidden sm:inline">
                {usuario?.nombreCompleto}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-gray-500"
            >
              <LogOut className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <nav className="lg:w-56 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-md p-2">
              <ul className="space-y-1">
                {navItems.map((item) => {
                  const fullPath = `${basePath}${item.path}`;
                  const isActive =
                    item.path === ''
                      ? location.pathname === basePath
                      : location.pathname === fullPath;
                  const Icon = item.icon;

                  return (
                    <li key={item.path}>
                      <Link
                        to={fullPath}
                        className={`
                          flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                          ${
                            isActive
                              ? 'bg-gray-900 text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }
                        `}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Quick link back to main site */}
            <div className="mt-4 p-4 bg-gray-100 rounded-xl">
              <p className="text-sm text-gray-600 mb-2">
                Ver sitio como cliente
              </p>
              <Link
                to={`/negocio/${negocioId}`}
                className="text-sm font-medium text-gray-900 hover:underline"
              >
                Ir a la pagina publica →
              </Link>
            </div>
          </nav>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
