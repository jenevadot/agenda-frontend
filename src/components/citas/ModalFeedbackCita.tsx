import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ThumbsUp, Minus, ThumbsDown, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../comunes/Button';
import { useCrearFeedback } from '../../hooks/useMisCitas';
import type { CitaCompleta, SatisfaccionCita, MotivoCita } from '../../api/citas';

interface Props {
  cita: CitaCompleta;
  onCerrar: () => void;
}

const MOTIVOS: { id: MotivoCita; label: string }[] = [
  { id: 'tecnica', label: 'Tecnica' },
  { id: 'higiene', label: 'Higiene' },
  { id: 'duracion', label: 'Duracion' },
  { id: 'puntualidad', label: 'Puntualidad' },
  { id: 'comunicacion', label: 'Comunicacion' },
];

/**
 * Modal de feedback post-cita.
 * Se muestra automáticamente para la primera cita pasada sin feedback.
 * Usa portal para renderizar fuera de la jerarquía DOM.
 */
export function ModalFeedbackCita({ cita, onCerrar }: Props) {
  const [satisfaccion, setSatisfaccion] = useState<SatisfaccionCita | null>(null);
  const [motivosSeleccionados, setMotivosSeleccionados] = useState<MotivoCita[]>([]);
  const [recomienda, setRecomienda] = useState<boolean | null>(null);
  const [comentario, setComentario] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const { mutate: crearFeedback, isPending } = useCrearFeedback();

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCerrar();
      }
    },
    [onCerrar]
  );

  useEffect(() => {
    previousActiveElement.current = document.activeElement as HTMLElement;
    dialogRef.current?.focus();
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [handleKeyDown]);

  const toggleMotivo = (motivo: MotivoCita) => {
    setMotivosSeleccionados((prev) =>
      prev.includes(motivo) ? prev.filter((m) => m !== motivo) : [...prev, motivo]
    );
  };

  const puedeEnviar = satisfaccion !== null && recomienda !== null;

  const handleEnviar = () => {
    if (!puedeEnviar) return;

    crearFeedback(
      {
        citaId: cita.id,
        datos: {
          satisfaccion: satisfaccion!,
          motivos: motivosSeleccionados,
          recomienda: recomienda!,
          comentario: comentario.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          onCerrar();
        },
      }
    );
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-dialog-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onCerrar}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative bg-white rounded-3xl shadow-glass-xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-scale-in focus:outline-none"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-8 pb-0">
          <div>
            <h2
              id="feedback-dialog-title"
              className="text-xl font-bold text-black tracking-tight"
            >
              Como fue tu experiencia?
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {cita.servicio.nombre} en {cita.negocio.nombre}
            </p>
          </div>
          <button
            onClick={onCerrar}
            className="p-2 -mr-2 -mt-2 rounded-full text-gray-400 hover:text-black hover:bg-gray-100 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-8 py-6 space-y-8">
          {/* Pregunta 1: Satisfacción general */}
          <div>
            <p className="text-sm font-semibold text-black mb-3">
              Satisfaccion general
            </p>
            <div className="flex gap-3">
              {(
                [
                  { value: 'satisfecho' as SatisfaccionCita, label: 'Satisfecho', icon: ThumbsUp },
                  { value: 'normal' as SatisfaccionCita, label: 'Normal', icon: Minus },
                  { value: 'no_satisfecho' as SatisfaccionCita, label: 'No satisfecho', icon: ThumbsDown },
                ] as const
              ).map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSatisfaccion(value)}
                  className={cn(
                    'flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl border-2 transition-all text-xs font-medium',
                    satisfaccion === value
                      ? 'border-black bg-black text-white'
                      : 'border-gray-200 text-gray-600 hover:border-gray-400 hover:text-black'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Pregunta 2: Motivos */}
          <div>
            <p className="text-sm font-semibold text-black mb-3">
              Motivo de tu opinion{' '}
              <span className="font-normal text-gray-400">(opcional)</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {MOTIVOS.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleMotivo(id)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium border-2 transition-all',
                    motivosSeleccionados.includes(id)
                      ? 'border-black bg-black text-white'
                      : 'border-gray-200 text-gray-600 hover:border-gray-400 hover:text-black'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Pregunta 3: Recomienda */}
          <div>
            <p className="text-sm font-semibold text-black mb-3">
              Recomendarias la barberia?
            </p>
            <div className="flex gap-3">
              {(
                [
                  { value: true, label: 'Si' },
                  { value: false, label: 'No' },
                ] as const
              ).map(({ value, label }) => (
                <button
                  key={String(value)}
                  type="button"
                  onClick={() => setRecomienda(value)}
                  className={cn(
                    'flex-1 py-3 rounded-2xl border-2 transition-all text-sm font-medium',
                    recomienda === value
                      ? 'border-black bg-black text-white'
                      : 'border-gray-200 text-gray-600 hover:border-gray-400 hover:text-black'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Pregunta 4: Comentario */}
          <div>
            <p className="text-sm font-semibold text-black mb-3">
              Cuentanos mas{' '}
              <span className="font-normal text-gray-400">(opcional)</span>
            </p>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Cuentanos mas sobre tu experiencia..."
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black resize-none transition-colors"
            />
            <p className="text-xs text-gray-400 text-right mt-1">
              {comentario.length}/500
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-8 pb-8 pt-0">
          <Button
            variant="ghost"
            onClick={onCerrar}
            className="flex-1"
          >
            Ahora no
          </Button>
          <Button
            variant="primary"
            onClick={handleEnviar}
            disabled={!puedeEnviar}
            loading={isPending}
            className="flex-1"
          >
            Enviar
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
