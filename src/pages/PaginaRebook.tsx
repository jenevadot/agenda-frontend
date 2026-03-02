import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, ArrowLeft } from 'lucide-react';
import { Header, SpinnerCarga, MensajeError, Button } from '../components/comunes';
import {
  Calendario,
  GrillaHorarios,
} from '../components/reservas';
import { useCita, useDisponibilidad, useCrearCita } from '../hooks';
import type { HorarioDisponible } from '../stores/flujoReservaStore';
import {
  formatearFechaMostrar,
  formatearFechaApi,
  obtenerRangoFechas,
  construirDatetimeISO,
  formatearHoraDesdeISO,
} from '../utils/fecha';
import { generarClaveIdempotencia } from '../utils/idempotencia';
import { cn } from '../lib/utils';

type PasoRebook = 'fecha' | 'horario' | 'confirmacion';

const PASOS: { id: PasoRebook; nombre: string }[] = [
  { id: 'fecha',        nombre: 'Fecha' },
  { id: 'horario',      nombre: 'Horario' },
  { id: 'confirmacion', nombre: 'Confirmar' },
];

/**
 * PaginaRebook - Rebook appointment page
 * Allows clients to quickly re-book a past/completed/cancelled appointment
 * Pre-fills service and contact info from original appointment
 */
export default function PaginaRebook() {
  const { negocioId, citaId } = useParams<{
    negocioId: string;
    citaId: string;
  }>();
  const navigate = useNavigate();

  const [pasoActual, setPasoActual] = useState<PasoRebook>('fecha');
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | null>(null);
  const [horarioSeleccionado, setHorarioSeleccionado] =
    useState<HorarioDisponible | null>(null);

  const periodoVista = 2 as const;

  const claveIdempotencia = useMemo(() => generarClaveIdempotencia(), []);

  const {
    data: citaOriginal,
    isLoading: cargandoCita,
    error: errorCita,
  } = useCita(negocioId ?? '', citaId ?? '');

  const { mutate: crearCitaNueva, isPending: creandoCita } = useCrearCita();

  const rangoFechas = useMemo(() => obtenerRangoFechas(periodoVista), []);

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

  const slotsDelDia = useMemo(() => {
    if (!fechaSeleccionada || !disponibilidad) return [];

    const fechaStr = formatearFechaApi(fechaSeleccionada);
    const diaDisponibilidad = disponibilidad.find((d) => d.fecha === fechaStr);

    return diaDisponibilidad?.slots || [];
  }, [fechaSeleccionada, disponibilidad]);

  const handleSeleccionarFecha = (fecha: Date) => {
    setFechaSeleccionada(fecha);
    setHorarioSeleccionado(null);
    setPasoActual('horario');
  };

  const handleSeleccionarHorario = (slot: HorarioDisponible) => {
    setHorarioSeleccionado(slot);
    setPasoActual('confirmacion');
  };

  const handleVolver = () => {
    const pasoIndex = PASOS.findIndex((p) => p.id === pasoActual);
    if (pasoIndex > 0) {
      setPasoActual(PASOS[pasoIndex - 1].id);
    }
  };

  const handleConfirmar = () => {
    if (
      !negocioId ||
      !citaOriginal ||
      !fechaSeleccionada ||
      !horarioSeleccionado
    ) {
      return;
    }

    crearCitaNueva({
      datos: {
        negocioId: negocioId,
        servicioId: citaOriginal.servicio.id,
        personalId:
          horarioSeleccionado.personalDisponible[0]?.id ??
          null,
        fechaHoraCita: construirDatetimeISO(
          fechaSeleccionada,
          horarioSeleccionado.horaInicio
        ),
        clienteNombre: citaOriginal.clienteNombre,
        clienteEmail: citaOriginal.clienteEmail,
        clienteTelefono: citaOriginal.clienteTelefono,
      },
      claveIdempotencia,
    });
  };

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

      {/* Rebook banner */}
      <div className="bg-gray-50 border-b border-gray-200 py-3 px-4 text-sm text-gray-600 text-center">
        Reservando de nuevo:{' '}
        <span className="font-semibold text-gray-900">
          {citaOriginal.servicio.nombre}
        </span>
      </div>

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
              Selecciona una fecha
            </h1>
            <p className="text-gray-500 mb-6">
              Elige cuando quieres agendar tu cita
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

        {/* Step 2: Time slot selection */}
        {pasoActual === 'horario' && fechaSeleccionada && (
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                Selecciona un horario
              </h1>
              <p className="text-gray-500 mb-6">
                {formatearFechaMostrar(fechaSeleccionada)}
              </p>

              <GrillaHorarios
                slots={slotsDelDia}
                personalSeleccionado={null}
                slotSeleccionado={horarioSeleccionado}
                onSeleccionar={handleSeleccionarHorario}
                isLoading={cargandoDisponibilidad}
              />
            </div>
          )}

        {/* Step 3: Confirmation */}
        {pasoActual === 'confirmacion' &&
          fechaSeleccionada &&
          horarioSeleccionado && (
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                Confirmar reserva
              </h1>
              <p className="text-gray-500 mb-6">
                Revisa los detalles antes de confirmar
              </p>

              <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Detalles de la reserva
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
                      {horarioSeleccionado.personalDisponible[0]?.nombre ?? 'Cualquier disponible'}
                    </span>
                  </div>
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Nombre</span>
                      <span className="font-medium">
                        {citaOriginal.clienteNombre}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-gray-500">
                    Cita anterior:{' '}
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
                  onClick={() => navigate(-1)}
                  disabled={creandoCita}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={handleConfirmar}
                  disabled={creandoCita}
                >
                  {creandoCita ? 'Confirmando...' : 'Confirmar reserva'}
                </Button>
              </div>
            </div>
          )}
      </main>
    </div>
  );
}
