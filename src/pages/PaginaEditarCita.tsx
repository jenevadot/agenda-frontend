import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, ArrowLeft } from 'lucide-react';
import { Header, SpinnerCarga, MensajeError, Button } from '../components/comunes';
import { BannerEdicion } from '../components/citas';
import {
  Calendario,
  SelectorPersonal,
  GrillaHorarios,
} from '../components/reservas';
import { useCita, useConfirmarEdicionCita, useCancelarEdicionCita, useDisponibilidad } from '../hooks';
import type { PersonalSimple, HorarioDisponible } from '../stores/flujoReservaStore';
import {
  formatearFechaMostrar,
  formatearFechaApi,
  obtenerRangoFechas,
  construirDatetimeISO,
  formatearHoraDesdeISO,
} from '../utils/fecha';
import { cn } from '../lib/utils';

type PasoEdicion = 'fecha' | 'personal' | 'horario' | 'confirmacion';

const PASOS: { id: PasoEdicion; nombre: string }[] = [
  { id: 'fecha', nombre: 'Fecha' },
  { id: 'personal', nombre: 'Profesional' },
  { id: 'horario', nombre: 'Horario' },
  { id: 'confirmacion', nombre: 'Confirmar' },
];

/**
 * Extract unique staff from availability slots
 */
function extraerPersonalUnico(
  slots: { personalDisponible: PersonalSimple[] }[]
): PersonalSimple[] {
  const personalMap = new Map<string, PersonalSimple>();

  slots.forEach((slot) => {
    slot.personalDisponible.forEach((p) => {
      if (!personalMap.has(p.id)) {
        personalMap.set(p.id, p);
      }
    });
  });

  return Array.from(personalMap.values());
}

/**
 * PaginaEditarCita - Edit appointment page
 * Allows changing the date/time/staff of an existing appointment
 * Implements RF-FE-039, RF-FE-040
 */
export default function PaginaEditarCita() {
  const { negocioId, citaId } = useParams<{
    negocioId: string;
    citaId: string;
  }>();
  const navigate = useNavigate();

  // Local state for the edit flow
  const [pasoActual, setPasoActual] = useState<PasoEdicion>('fecha');
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | null>(null);
  const [personalSeleccionado, setPersonalSeleccionado] =
    useState<PersonalSimple | null>(null);
  const [horarioSeleccionado, setHorarioSeleccionado] =
    useState<HorarioDisponible | null>(null);

  const periodoVista = 2 as const;

  // Fetch original appointment
  const {
    data: citaOriginal,
    isLoading: cargandoCita,
    error: errorCita,
  } = useCita(negocioId ?? '', citaId ?? '');

  // Mutations
  const { mutate: confirmarEdicion, isPending: confirmandoEdicion } =
    useConfirmarEdicionCita();
  const { mutate: cancelarEdicion } = useCancelarEdicionCita();

  // Calculate date range for availability
  const rangoFechas = useMemo(() => obtenerRangoFechas(periodoVista), []);

  // Fetch availability for the service
  const { data: disponibilidad, isLoading: cargandoDisponibilidad } =
    useDisponibilidad(
      citaOriginal && negocioId
        ? {
            negocioId,
            servicioId: citaOriginal.servicio.id,
            fechaInicio: formatearFechaApi(rangoFechas.inicio),
            fechaFin: formatearFechaApi(rangoFechas.fin),
          }
        : null
    );

  // Get slots for selected date
  const slotsDelDia = useMemo(() => {
    if (!fechaSeleccionada || !disponibilidad) return [];

    const fechaStr = formatearFechaApi(fechaSeleccionada);
    const diaDisponibilidad = disponibilidad.find((d) => d.fecha === fechaStr);

    return diaDisponibilidad?.slots || [];
  }, [fechaSeleccionada, disponibilidad]);

  // Extract unique staff for selected date
  const personalDisponible = useMemo(() => {
    return extraerPersonalUnico(slotsDelDia);
  }, [slotsDelDia]);

  // Handle cancel editing
  const handleCancelarEdicion = () => {
    if (negocioId && citaId) {
      // If the appointment was put in editing state, cancel it
      if (citaOriginal?.estado === 'pendiente_actualizacion') {
        cancelarEdicion(
          { negocioId, citaId },
          {
            onSuccess: () => {
              navigate(`/citas/${negocioId}/${citaId}`);
            },
          }
        );
      } else {
        navigate(`/citas/${negocioId}/${citaId}`);
      }
    }
  };

  // Handle date selection
  const handleSeleccionarFecha = (fecha: Date) => {
    setFechaSeleccionada(fecha);
    setPersonalSeleccionado(null);
    setHorarioSeleccionado(null);
    setPasoActual('personal');
  };

  // Handle staff selection
  const handleSeleccionarPersonal = (personal: PersonalSimple | null) => {
    setPersonalSeleccionado(personal);
    setHorarioSeleccionado(null);
    setPasoActual('horario');
  };

  // Handle time slot selection
  const handleSeleccionarHorario = (slot: HorarioDisponible) => {
    setHorarioSeleccionado(slot);
    setPasoActual('confirmacion');
  };

  // Handle back navigation
  const handleVolver = () => {
    const pasoIndex = PASOS.findIndex((p) => p.id === pasoActual);
    if (pasoIndex > 0) {
      setPasoActual(PASOS[pasoIndex - 1].id);
    }
  };

  // Handle confirm edit
  const handleConfirmar = () => {
    if (
      !negocioId ||
      !citaId ||
      !fechaSeleccionada ||
      !horarioSeleccionado
    ) {
      return;
    }

    confirmarEdicion(
      {
        negocioId,
        citaId,
        datos: {
          fechaHoraCita: construirDatetimeISO(
            fechaSeleccionada,
            horarioSeleccionado.horaInicio
          ),
          personalId: personalSeleccionado?.id ?? null,
        },
      },
      {
        onSuccess: () => {
          navigate(`/citas/${negocioId}/${citaId}`);
        },
      }
    );
  };

  // Loading state
  if (cargandoCita) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <SpinnerCarga />
        </main>
      </div>
    );
  }

  // Error state
  if (errorCita || !citaOriginal) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <MensajeError mensaje="Error al cargar la cita" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Edit banner */}
      <BannerEdicion
        citaOriginal={citaOriginal}
        onCancelar={handleCancelarEdicion}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Service summary */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h2 className="font-semibold text-gray-900">
            {citaOriginal.servicio.nombre}
          </h2>
          <p className="text-sm text-gray-600">
            {citaOriginal.servicio.duracionMinutos} minutos
          </p>
        </div>

        {/* Step indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {PASOS.map((paso, index) => {
              const pasoIndex = PASOS.findIndex((p) => p.id === pasoActual);
              const completado = index < pasoIndex;
              const activo = paso.id === pasoActual;

              return (
                <div key={paso.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                        completado && 'bg-success text-white',
                        activo && 'bg-gray-900 text-white',
                        !completado && !activo && 'bg-gray-200 text-gray-500'
                      )}
                    >
                      {completado ? <Check className="w-4 h-4" /> : index + 1}
                    </div>
                    <span
                      className={cn(
                        'text-xs mt-1 hidden sm:block',
                        activo ? 'text-gray-900 font-medium' : 'text-gray-500'
                      )}
                    >
                      {paso.nombre}
                    </span>
                  </div>
                  {index < PASOS.length - 1 && (
                    <div
                      className={cn(
                        'w-8 sm:w-16 h-0.5 mx-1 sm:mx-2',
                        index < pasoIndex ? 'bg-success' : 'bg-gray-200'
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Back button */}
        {pasoActual !== 'fecha' && (
          <button
            onClick={handleVolver}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver</span>
          </button>
        )}

        {/* Step 1: Date selection */}
        {pasoActual === 'fecha' && (
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Selecciona una nueva fecha
            </h1>
            <p className="text-gray-500 mb-6">
              Elige cuando quieres reprogramar tu cita
            </p>

            <Calendario
              negocioId={negocioId!}
              servicioId={citaOriginal.servicio.id}
              fechaSeleccionada={fechaSeleccionada}
              onSeleccionarFecha={handleSeleccionarFecha}
              periodoVista={periodoVista}
              onCambiarPeriodo={() => {}}
            />
          </div>
        )}

        {/* Step 2: Staff selection */}
        {pasoActual === 'personal' && fechaSeleccionada && (
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Selecciona un profesional
            </h1>
            <p className="text-gray-500 mb-6">
              {formatearFechaMostrar(fechaSeleccionada)}
            </p>

            <SelectorPersonal
              personalDisponible={personalDisponible}
              personalSeleccionado={personalSeleccionado}
              onSeleccionar={handleSeleccionarPersonal}
              isLoading={cargandoDisponibilidad}
            />
          </div>
        )}

        {/* Step 3: Time slot selection */}
        {pasoActual === 'horario' &&
          fechaSeleccionada &&
          personalSeleccionado !== undefined && (
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                Selecciona un horario
              </h1>
              <p className="text-gray-500 mb-6">
                {formatearFechaMostrar(fechaSeleccionada)}
                {personalSeleccionado && ` - ${personalSeleccionado.nombre}`}
              </p>

              <GrillaHorarios
                slots={slotsDelDia}
                personalSeleccionado={personalSeleccionado}
                slotSeleccionado={horarioSeleccionado}
                onSeleccionar={handleSeleccionarHorario}
                isLoading={cargandoDisponibilidad}
              />
            </div>
          )}

        {/* Step 4: Confirmation */}
        {pasoActual === 'confirmacion' &&
          fechaSeleccionada &&
          horarioSeleccionado && (
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                Confirmar cambio
              </h1>
              <p className="text-gray-500 mb-6">
                Revisa el nuevo horario antes de confirmar
              </p>

              <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Nuevo horario
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Servicio</span>
                    <span className="font-medium">
                      {citaOriginal.servicio.nombre}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Fecha</span>
                    <span className="font-medium">
                      {formatearFechaMostrar(fechaSeleccionada)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Horario</span>
                    <span className="font-medium">
                      {horarioSeleccionado.horaInicio} -{' '}
                      {horarioSeleccionado.horaFin}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Profesional</span>
                    <span className="font-medium">
                      {personalSeleccionado?.nombre || 'Cualquier disponible'}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t">
                  <h4 className="text-xs text-gray-500 mb-2">Horario anterior</h4>
                  <p className="text-sm text-gray-600 line-through">
                    {formatearHoraDesdeISO(citaOriginal.fechaHoraInicio)} -{' '}
                    {formatearHoraDesdeISO(citaOriginal.fechaHoraFin)} con{' '}
                    {citaOriginal.personal.nombre}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setPasoActual('horario')}
                  disabled={confirmandoEdicion}
                >
                  Cambiar horario
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={handleConfirmar}
                  disabled={confirmandoEdicion}
                >
                  {confirmandoEdicion ? 'Guardando...' : 'Confirmar cambio'}
                </Button>
              </div>
            </div>
          )}
      </main>
    </div>
  );
}
