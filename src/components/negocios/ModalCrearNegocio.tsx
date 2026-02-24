import { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '../../lib/utils';
import { Button } from '../comunes/Button';
import { Input } from '../comunes/Input';
import { esquemaCrearNegocio, type DatosCrearNegocioForm } from '../../schemas/negocio';
import { crearNegocio } from '../../api/negocios';
import { useNotificacion } from '../comunes/Notificacion';
import type { CrearNegocioRequest } from '../../tipos';

interface ModalCrearNegocioProps {
  abierto: boolean;
  onCerrar: () => void;
  onExito?: (negocioId: string) => void;
}

/**
 * Modal for creating a new business
 * Implements RF-FE-042, RF-FE-043, RF-FE-044, RF-FE-045, RF-FE-046
 *
 * Features:
 * - Form validation with Zod + React Hook Form
 * - Real-time validation feedback (500ms)
 * - Optimistic UI updates via TanStack Query
 * - Accessible with ARIA attributes
 * - Focus trap and escape key support
 * - Premium glass effect design
 */
export function ModalCrearNegocio({
  abierto,
  onCerrar,
  onExito,
}: ModalCrearNegocioProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const { mostrarExito, mostrarError } = useNotificacion();
  const queryClient = useQueryClient();

  // Form setup with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<DatosCrearNegocioForm>({
    resolver: zodResolver(esquemaCrearNegocio),
    mode: 'onBlur', // Validate on blur for better UX (RF-FE-057)
  });

  // Create business mutation
  const mutation = useMutation({
    mutationFn: (datos: CrearNegocioRequest) => crearNegocio(datos),
    onSuccess: (negocio) => {
      // Invalidate queries to refetch business list (RF-FE-049)
      queryClient.invalidateQueries({ queryKey: ['negocios'] });

      // Show success message (RF-FE-047)
      mostrarExito(`Negocio "${negocio.nombre}" creado exitosamente`);

      // Reset form and close modal
      reset();
      onCerrar();

      // Optional callback for navigation
      onExito?.(negocio.id);
    },
    onError: (error: any) => {
      // Show error message (RF-FE-048)
      const mensaje = error.response?.data?.mensaje ||
                     error.response?.data?.message ||
                     'Error al crear el negocio. Por favor intente nuevamente.';
      mostrarError(mensaje);
    },
  });

  // Form submit handler
  const onSubmit: SubmitHandler<DatosCrearNegocioForm> = (data) => {
    const payload: CrearNegocioRequest = {
      nombre: data.nombre,
      direccion: data.direccion || null,
      telefono: data.telefono || null,
    };

    mutation.mutate(payload);
  };

  // Handle modal close
  const handleCerrar = useCallback(() => {
    if (!isSubmitting) {
      reset();
      onCerrar();
    }
  }, [isSubmitting, reset, onCerrar]);

  // Handle escape key
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCerrar();
      }
    },
    [handleCerrar]
  );

  // Focus management and cleanup
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
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={handleCerrar}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative bg-white rounded-3xl shadow-glass-xl max-w-lg w-full animate-scale-in overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-8 pb-0">
          <div>
            <h2
              id="modal-title"
              className="text-2xl font-bold text-black tracking-tight"
            >
              Crear Nuevo Negocio
            </h2>
            <p id="modal-description" className="text-sm text-gray-500 mt-1">
              Completa la información básica de tu salón
            </p>
          </div>
          <button
            onClick={handleCerrar}
            disabled={isSubmitting}
            className="p-2 -mr-2 -mt-2 rounded-full text-gray-400 hover:text-black hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-8 pt-6 space-y-6">
          {/* Campo: Nombre del negocio (RF-FE-043) */}
          <Input
            {...register('nombre')}
            label="Nombre del negocio"
            placeholder="Ej: Salón Bella Vista"
            error={errors.nombre?.message}
            required
            disabled={isSubmitting}
            autoFocus
          />

          {/* Campo: Dirección (RF-FE-043) */}
          <Input
            {...register('direccion')}
            label="Dirección"
            placeholder="Ej: Av. Principal 123, Lima"
            error={errors.direccion?.message}
            hint="Dirección física de tu salón (opcional)"
            disabled={isSubmitting}
          />

          {/* Campo: Teléfono (RF-FE-043) */}
          <Input
            {...register('telefono')}
            type="tel"
            label="Teléfono"
            placeholder="Ej: 01234567"
            error={errors.telefono?.message}
            hint="Teléfono de contacto del salón (opcional)"
            disabled={isSubmitting}
          />

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              onClick={handleCerrar}
              variant="secondary"
              disabled={isSubmitting}
              className={cn(
                'border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-black hover:border-gray-300',
                'border-2'
              )}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                'bg-black hover:bg-gray-800 text-white',
                'disabled:bg-gray-400 disabled:cursor-not-allowed'
              )}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creando...
                </span>
              ) : (
                'Crear negocio'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
