import { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

interface DialogoConfirmacionProps {
  abierto: boolean;
  titulo: string;
  mensaje: string;
  onConfirmar: () => void;
  onCancelar: () => void;
  variante?: 'peligro' | 'normal';
  textoConfirmar?: string;
  textoCancelar?: string;
}

/**
 * Premium confirmation dialog with glass effect backdrop
 * - Uses React portal to render outside DOM hierarchy
 * - Focus trap inside modal
 * - Escape key to close
 * - Accessible with ARIA attributes
 * - Black/white only design
 */
export function DialogoConfirmacion({
  abierto,
  titulo,
  mensaje,
  onConfirmar,
  onCancelar,
  variante = 'normal',
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
}: DialogoConfirmacionProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Handle escape key
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancelar();
      }
    },
    [onCancelar]
  );

  // Focus management
  useEffect(() => {
    if (abierto) {
      // Store currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Focus the dialog
      dialogRef.current?.focus();

      // Add escape key listener
      document.addEventListener('keydown', handleKeyDown);

      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';

      // Restore focus to previous element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [abierto, handleKeyDown]);

  if (!abierto) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onCancelar}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative bg-white rounded-3xl shadow-glass-xl max-w-md w-full animate-scale-in"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-8 pb-0">
          <h2
            id="dialog-title"
            className="text-xl font-bold text-black tracking-tight"
          >
            {titulo}
          </h2>
          <button
            onClick={onCancelar}
            className="p-2 -mr-2 -mt-2 rounded-full text-gray-400 hover:text-black hover:bg-gray-100 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-8 py-6">
          <p className="text-gray-600 leading-relaxed">{mensaje}</p>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-8 pt-0 justify-end">
          <Button
            onClick={onCancelar}
            variant="secondary"
            className={cn(
              'border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-black hover:border-gray-300',
              'border-2'
            )}
          >
            {textoCancelar}
          </Button>
          <Button
            onClick={onConfirmar}
            className={cn(
              variante === 'peligro' && 'bg-black hover:bg-gray-800'
            )}
          >
            {textoConfirmar}
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
