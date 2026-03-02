import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Header, SpinnerCarga, MensajeError } from '../components/comunes';
import { DetalleCita, DialogoCancelacion, ModalFeedbackCita } from '../components/citas';
import { useCita, useCancelarCita } from '../hooks';

/**
 * PaginaDetalleCita - Appointment detail page
 * Shows full appointment details with cancel/edit actions
 * Implements RF-FE-034, RF-FE-035, RF-FE-036, RF-FE-037, RF-FE-038
 */
export default function PaginaDetalleCita() {
  const { negocioId, citaId } = useParams<{ negocioId: string; citaId: string }>();
  const navigate = useNavigate();

  const [mostrarDialogoCancelar, setMostrarDialogoCancelar] = useState(false);
  const [mostrarModalFeedback, setMostrarModalFeedback] = useState(false);

  // Fetch appointment details
  const { data: cita, isLoading, error, refetch } = useCita(
    negocioId ?? '',
    citaId ?? ''
  );

  // Cancel mutation
  const { mutate: cancelarCita, isPending: isCancelando } = useCancelarCita();

  const handleVolver = () => {
    navigate('/citas');
  };

  const handleCancelar = () => {
    setMostrarDialogoCancelar(true);
  };

  const handleConfirmarCancelacion = () => {
    if (negocioId && citaId) {
      cancelarCita(
        { negocioId, citaId },
        {
          onSuccess: () => {
            setMostrarDialogoCancelar(false);
            navigate('/citas');
          },
        }
      );
    }
  };

  const handleEditar = () => {
    if (negocioId && citaId) {
      navigate(`/citas/${negocioId}/${citaId}/editar`);
    }
  };

  const handleRebook = () => {
    if (negocioId && citaId) {
      navigate(`/rebook/${negocioId}/${citaId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Back button */}
        <button
          onClick={handleVolver}
          className="flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-6 group"
        >
          <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
          <span>Volver a mis citas</span>
        </button>

        {/* Loading state */}
        {isLoading && (
          <div className="py-12">
            <SpinnerCarga />
          </div>
        )}

        {/* Error state */}
        {error && (
          <MensajeError
            mensaje="Error al cargar los detalles de la cita"
            onReintentar={refetch}
          />
        )}

        {/* Content */}
        {cita && (
          <DetalleCita
            cita={cita}
            onCancelar={handleCancelar}
            onEditar={handleEditar}
            onRebook={handleRebook}
            onFeedback={() => setMostrarModalFeedback(true)}
            isCancelando={isCancelando}
          />
        )}
      </main>

      {/* Cancellation dialog */}
      {cita && (
        <DialogoCancelacion
          cita={cita}
          abierto={mostrarDialogoCancelar}
          onConfirmar={handleConfirmarCancelacion}
          onCerrar={() => setMostrarDialogoCancelar(false)}
          isLoading={isCancelando}
        />
      )}

      {/* Feedback modal */}
      {cita && mostrarModalFeedback && (
        <ModalFeedbackCita
          cita={cita}
          onCerrar={() => setMostrarModalFeedback(false)}
        />
      )}
    </div>
  );
}
