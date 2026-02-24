import { AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface MensajeErrorProps {
  mensaje: string;
  onReintentar?: () => void;
  className?: string;
}

/**
 * Error message component with optional retry button
 * Displays error icon, message text, and action button
 */
export function MensajeError({ mensaje, onReintentar, className }: MensajeErrorProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-6 text-center',
        className
      )}
      role="alert"
    >
      <AlertCircle className="w-12 h-12 text-error mb-4" />
      <p className="text-gray-700 mb-4">{mensaje}</p>
      {onReintentar && (
        <button
          onClick={onReintentar}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}
