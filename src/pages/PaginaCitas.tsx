import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { parseISO, isFuture, isPast, isToday } from 'date-fns';
import { Header, Button, MensajeError } from '../components/comunes';
import { ListaCitas, ModalFeedbackCita } from '../components/citas';
import { useMisCitas, useCancelarCita } from '../hooks';
import { useMisPreferencias } from '../hooks/useUsuario';
import { cn } from '../lib/utils';
import type { CitaCompleta } from '../api/citas';

type FiltroEstado = 'todas' | 'proximas' | 'pasadas' | 'canceladas';

const FILTROS: { id: FiltroEstado; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'proximas', label: 'Proximas' },
  { id: 'pasadas', label: 'Pasadas' },
  { id: 'canceladas', label: 'Canceladas' },
];

/**
 * Filter appointments based on selected filter
 */
function filtrarCitas(citas: CitaCompleta[], filtro: FiltroEstado): CitaCompleta[] {
  return citas.filter((cita) => {
    const fechaCita = parseISO(cita.fechaHoraInicio);

    switch (filtro) {
      case 'proximas':
        return (
          (isFuture(fechaCita) || isToday(fechaCita)) &&
          cita.estado !== 'cancelada' &&
          cita.estado !== 'completada'
        );
      case 'pasadas':
        return (
          isPast(fechaCita) &&
          !isToday(fechaCita) &&
          cita.estado !== 'cancelada'
        );
      case 'canceladas':
        return cita.estado === 'cancelada';
      default:
        return true;
    }
  });
}

/**
 * Sort appointments: upcoming first (ascending), then past (descending)
 */
function ordenarCitas(citas: CitaCompleta[]): CitaCompleta[] {
  return [...citas].sort((a, b) => {
    const fechaA = parseISO(a.fechaHoraInicio);
    const fechaB = parseISO(b.fechaHoraInicio);
    const ahora = new Date();

    const aEsFutura = fechaA >= ahora;
    const bEsFutura = fechaB >= ahora;

    // Future appointments first
    if (aEsFutura && !bEsFutura) return -1;
    if (!aEsFutura && bEsFutura) return 1;

    // Both future: ascending (soonest first)
    if (aEsFutura && bEsFutura) {
      return fechaA.getTime() - fechaB.getTime();
    }

    // Both past: descending (most recent first)
    return fechaB.getTime() - fechaA.getTime();
  });
}

/**
 * PaginaCitas - User appointments page
 * Shows list of user's appointments with filtering.
 * Auto-triggers feedback modal for the first past appointment without feedback.
 * Implements RF-FE-032 through RF-FE-036
 */
export default function PaginaCitas() {
  const navigate = useNavigate();
  const [filtroActual, setFiltroActual] = useState<FiltroEstado>('todas');
  const [citaCancelando, setCitaCancelando] = useState<string | null>(null);
  const [citaFeedbackActual, setCitaFeedbackActual] = useState<CitaCompleta | null>(null);
  const [bannerDescartado, setBannerDescartado] = useState(false);
  const feedbackModalShown = useRef(false);

  // Fetch user appointments
  const { data, isLoading, error } = useMisCitas();

  // Preferences (for banner)
  const { data: preferencias, isLoading: cargandoPrefs } = useMisPreferencias();
  const mostrarBanner = !cargandoPrefs && preferencias === null && !bannerDescartado;

  // Cancel appointment mutation
  const { mutate: cancelarCita } = useCancelarCita();

  // First past appointment that needs feedback (completed/confirmada, no feedback yet)
  const citaNecesitaFeedback = useMemo<CitaCompleta | null>(() => {
    if (!data?.citas) return null;
    return (
      data.citas.find(
        (c) =>
          isPast(parseISO(c.fechaHoraFin)) &&
          (c.estado === 'completada' || c.estado === 'confirmada') &&
          !c.tieneFeedback
      ) ?? null
    );
  }, [data?.citas]);

  // Auto-trigger feedback modal once per session
  useEffect(() => {
    if (citaNecesitaFeedback && !feedbackModalShown.current) {
      feedbackModalShown.current = true;
      setCitaFeedbackActual(citaNecesitaFeedback);
    }
  }, [citaNecesitaFeedback]);

  // Filter and sort appointments
  const citasFiltradas = useMemo(() => {
    if (!data?.citas) return [];
    const filtradas = filtrarCitas(data.citas, filtroActual);
    return ordenarCitas(filtradas);
  }, [data?.citas, filtroActual]);

  // Handle cancel
  const handleCancelar = (citaId: string, negocioId: string) => {
    setCitaCancelando(citaId);
    cancelarCita(
      { citaId, negocioId },
      {
        onSettled: () => {
          setCitaCancelando(null);
        },
      }
    );
  };

  // Get empty message based on filter
  const getMensajeVacio = (): string => {
    switch (filtroActual) {
      case 'proximas':
        return 'No tienes citas proximas';
      case 'pasadas':
        return 'No tienes citas pasadas';
      case 'canceladas':
        return 'No tienes citas canceladas';
      default:
        return 'No tienes citas programadas';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Mis Citas</h1>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/negocios')}
            className="hidden sm:flex"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva reserva
          </Button>
        </div>

        {/* Preferences banner */}
        {mostrarBanner && (
          <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-6 text-sm">
            <p className="text-gray-700">
              Completa tus preferencias para recibir recomendaciones personalizadas.{' '}
              <Link to="/cuenta" className="font-medium text-black underline underline-offset-2">
                Configurar ahora
              </Link>
            </p>
            <button
              onClick={() => setBannerDescartado(true)}
              className="ml-4 text-gray-400 hover:text-black transition-colors"
              aria-label="Cerrar banner"
            >
              ✕
            </button>
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {FILTROS.map((filtro) => (
            <Button
              key={filtro.id}
              variant={filtroActual === filtro.id ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFiltroActual(filtro.id)}
              className={cn(
                'whitespace-nowrap',
                filtroActual === filtro.id && 'shadow-none'
              )}
            >
              {filtro.label}
            </Button>
          ))}
        </div>

        {/* Error state */}
        {error && (
          <MensajeError mensaje="Error al cargar tus citas. Por favor intenta de nuevo." />
        )}

        {/* Appointments list */}
        {!error && (
          <ListaCitas
            citas={citasFiltradas}
            isLoading={isLoading}
            onCancelarCita={handleCancelar}
            citaCancelando={citaCancelando}
            mensajeVacio={getMensajeVacio()}
          />
        )}

        {/* Pagination info */}
        {data && data.total > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500">
            Mostrando {citasFiltradas.length} de {data.total} citas
          </div>
        )}

        {/* Mobile FAB */}
        <button
          onClick={() => navigate('/negocios')}
          className="sm:hidden fixed bottom-6 right-6 w-14 h-14 bg-gray-900 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-800 transition-colors"
          aria-label="Nueva reserva"
        >
          <Plus className="w-6 h-6" />
        </button>
      </main>

      {/* Feedback modal - auto-triggered for first past appointment without feedback */}
      {citaFeedbackActual && (
        <ModalFeedbackCita
          cita={citaFeedbackActual}
          onCerrar={() => setCitaFeedbackActual(null)}
        />
      )}
    </div>
  );
}
