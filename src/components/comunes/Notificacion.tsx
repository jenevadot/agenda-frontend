import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { create } from 'zustand';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';

// Notification types
type TipoNotificacion = 'exito' | 'error' | 'info';

interface Notificacion {
  id: string;
  tipo: TipoNotificacion;
  mensaje: string;
  duracion?: number;
}

interface NotificacionState {
  notificaciones: Notificacion[];
  agregar: (notificacion: Omit<Notificacion, 'id'>) => void;
  eliminar: (id: string) => void;
}

/**
 * Notification store using Zustand
 * Manages queue of toast notifications
 */
const useNotificacionStore = create<NotificacionState>((set) => ({
  notificaciones: [],

  agregar: (notificacion) => {
    const id = crypto.randomUUID();
    set((state) => ({
      notificaciones: [...state.notificaciones, { ...notificacion, id }],
    }));
  },

  eliminar: (id) => {
    set((state) => ({
      notificaciones: state.notificaciones.filter((n) => n.id !== id),
    }));
  },
}));

/**
 * Hook to show notifications
 * Returns functions to display success, error, and info toasts
 */
export function useNotificacion() {
  const agregar = useNotificacionStore((state) => state.agregar);

  return {
    mostrarExito: (mensaje: string, duracion = 5000) => {
      agregar({ tipo: 'exito', mensaje, duracion });
    },
    mostrarError: (mensaje: string, duracion = 5000) => {
      agregar({ tipo: 'error', mensaje, duracion });
    },
    mostrarInfo: (mensaje: string, duracion = 5000) => {
      agregar({ tipo: 'info', mensaje, duracion });
    },
  };
}

// Icon components for each notification type
const iconos = {
  exito: CheckCircle,
  error: XCircle,
  info: Info,
};

const estilos = {
  exito: 'bg-success-light text-green-800',
  error: 'bg-error-light text-red-800',
  info: 'bg-info-light text-blue-800',
};

const iconoEstilos = {
  exito: 'text-success',
  error: 'text-error',
  info: 'text-info',
};

interface ToastItemProps {
  notificacion: Notificacion;
  onClose: () => void;
}

function ToastItem({ notificacion, onClose }: ToastItemProps) {
  const Icono = iconos[notificacion.tipo];

  useEffect(() => {
    const duracion = notificacion.duracion ?? 5000;
    const timer = setTimeout(onClose, duracion);
    return () => clearTimeout(timer);
  }, [notificacion.duracion, onClose]);

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl shadow-lg max-w-sm w-full animate-slide-up',
        estilos[notificacion.tipo]
      )}
      role="alert"
    >
      <Icono className={cn('w-5 h-5 flex-shrink-0', iconoEstilos[notificacion.tipo])} />
      <p className="flex-1 text-sm font-medium">{notificacion.mensaje}</p>
      <button
        onClick={onClose}
        className="p-1 rounded hover:bg-black/10 transition-colors"
        aria-label="Cerrar notificación"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

/**
 * Toaster component - renders all active notifications
 * Should be placed at the root of the app
 */
export function Toaster() {
  const notificaciones = useNotificacionStore((state) => state.notificaciones);
  const eliminar = useNotificacionStore((state) => state.eliminar);

  if (notificaciones.length === 0) return null;

  const content = (
    <div
      className="fixed top-4 right-4 z-[600] flex flex-col gap-2"
      aria-live="polite"
    >
      {notificaciones.map((notificacion) => (
        <ToastItem
          key={notificacion.id}
          notificacion={notificacion}
          onClose={() => eliminar(notificacion.id)}
        />
      ))}
    </div>
  );

  return createPortal(content, document.body);
}
