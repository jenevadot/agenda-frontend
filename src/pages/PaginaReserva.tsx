import { useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { Header, SpinnerCarga } from '../components/comunes';
import {
  ListaServicios,
  Calendario,
  SelectorPersonal,
  GrillaHorarios,
  ConfirmacionReserva,
} from '../components/reservas';
import { useServicios, useServicio, useDisponibilidad, useCrearCita } from '../hooks';
import { useFlujoReservaStore, type PersonalSimple } from '../stores/flujoReservaStore';
import { formatearFechaMostrar, formatearFechaApi, obtenerRangoFechas, construirDatetimeISO } from '../utils/fecha';
import { cn } from '../lib/utils';
import type { InfoContactoFormulario } from '../schemas/reserva';

type Paso = 'servicio' | 'fecha' | 'personal' | 'horario' | 'confirmacion';

const PASOS: { id: Paso; nombre: string }[] = [
  { id: 'servicio', nombre: 'Servicio' },
  { id: 'fecha', nombre: 'Fecha' },
  { id: 'personal', nombre: 'Profesional' },
  { id: 'horario', nombre: 'Horario' },
  { id: 'confirmacion', nombre: 'Confirmar' },
];

/**
 * Extract unique staff from availability slots
 */
function extraerPersonalUnico(slots: { personalDisponible: PersonalSimple[] }[]): PersonalSimple[] {
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
 * Premium Booking page with elegant step indicator
 */
export default function PaginaReserva() {
  const { negocioId } = useParams<{ negocioId: string }>();
  const [searchParams] = useSearchParams();
  const servicioIdParam = searchParams.get('servicio');

  const {
    servicioSeleccionado,
    fechaSeleccionada,
    personalSeleccionado,
    horarioSeleccionado,
    periodoVista,
    setNegocio,
    setServicio,
    setFecha,
    setPersonal,
    setHorario,
    setPeriodoVista,
    reiniciarFlujo,
    volverAPaso,
    obtenerPasoActual,
  } = useFlujoReservaStore();

  // Fetch services
  const { isLoading: cargandoServicios } = useServicios(negocioId);

  // Fetch pre-selected service if provided
  const { data: servicioPreseleccionado } = useServicio(
    negocioId,
    servicioIdParam || undefined
  );

  // Calculate date range based on period
  const rangoFechas = useMemo(() => obtenerRangoFechas(periodoVista), [periodoVista]);

  // Fetch availability when service is selected
  const {
    data: disponibilidad,
    isLoading: cargandoDisponibilidad,
    dataUpdatedAt,
  } = useDisponibilidad(
    servicioSeleccionado && negocioId
      ? {
          negocioId,
          servicioId: servicioSeleccionado.id,
          fechaInicio: formatearFechaApi(rangoFechas.inicio),
          fechaFin: formatearFechaApi(rangoFechas.fin),
        }
      : null
  );

  // Create appointment mutation
  const { mutate: crearCita, isPending: creandoCita } = useCrearCita();

  // Set business ID on mount
  useEffect(() => {
    if (negocioId) {
      setNegocio(negocioId);
    }
    return () => {
      reiniciarFlujo();
    };
  }, [negocioId, setNegocio, reiniciarFlujo]);

  // Pre-select service if provided in URL
  useEffect(() => {
    if (servicioPreseleccionado && !servicioSeleccionado) {
      setServicio(servicioPreseleccionado);
    }
  }, [servicioPreseleccionado, servicioSeleccionado, setServicio]);

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

  // Current step
  const pasoActual = obtenerPasoActual();

  // Handle back navigation
  const handleVolver = () => {
    const pasoIndex = PASOS.findIndex((p) => p.id === pasoActual);
    if (pasoIndex > 0) {
      volverAPaso(PASOS[pasoIndex].id);
    }
  };

  // Handle booking confirmation
  const handleConfirmar = (datos: InfoContactoFormulario, claveIdempotencia: string) => {
    if (!negocioId || !servicioSeleccionado || !fechaSeleccionada || !horarioSeleccionado) {
      return;
    }

    // Si el usuario seleccionó "Cualquier profesional" (personalSeleccionado === null),
    // debemos asignar el primer profesional disponible del slot seleccionado
    const personalIdParaCita = personalSeleccionado?.id || horarioSeleccionado.personalDisponible[0]?.id || null;

    crearCita({
      datos: {
        negocioId,
        servicioId: servicioSeleccionado.id,
        personalId: personalIdParaCita,
        fechaHoraCita: construirDatetimeISO(fechaSeleccionada, horarioSeleccionado.horaInicio),
        clienteNombre: datos.nombre,
        clienteEmail: datos.email,
        clienteTelefono: datos.telefono,
      },
      claveIdempotencia,
    });
  };

  if (!negocioId) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="max-w-4xl mx-auto px-6 py-12">
          <p className="text-gray-500">Negocio no encontrado</p>
        </main>
      </div>
    );
  }

  const pasoIndex = PASOS.findIndex((p) => p.id === pasoActual);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-8 lg:py-12">
        {/* Step indicator */}
        <div className="mb-10 lg:mb-12">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {PASOS.map((paso, index) => {
              const completado = index < pasoIndex;
              const activo = paso.id === pasoActual;

              return (
                <div key={paso.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300',
                        completado && 'bg-black text-white',
                        activo && 'bg-black text-white ring-4 ring-gray-100',
                        !completado && !activo && 'bg-gray-100 text-gray-400'
                      )}
                    >
                      {completado ? <Check className="w-5 h-5" /> : index + 1}
                    </div>
                    <span
                      className={cn(
                        'text-xs mt-2 font-medium hidden sm:block',
                        activo ? 'text-black' : 'text-gray-400'
                      )}
                    >
                      {paso.nombre}
                    </span>
                  </div>
                  {index < PASOS.length - 1 && (
                    <div
                      className={cn(
                        'w-8 sm:w-16 lg:w-24 h-0.5 mx-2',
                        index < pasoIndex ? 'bg-black' : 'bg-gray-200'
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Back button */}
        {pasoActual !== 'servicio' && (
          <button
            onClick={handleVolver}
            className="flex items-center gap-2 text-gray-500 hover:text-black mb-8 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Volver</span>
          </button>
        )}

        {/* Step content */}

        {/* Step 1: Service selection */}
        {pasoActual === 'servicio' && (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-black mb-3 tracking-tight">
              Selecciona un servicio
            </h1>
            <p className="text-gray-500 mb-8">
              Elige el servicio que deseas reservar
            </p>

            {cargandoServicios ? (
              <SpinnerCarga />
            ) : (
              <ListaServicios negocioId={negocioId} />
            )}
          </div>
        )}

        {/* Step 2: Date selection */}
        {pasoActual === 'fecha' && servicioSeleccionado && (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-black mb-3 tracking-tight">
              Selecciona una fecha
            </h1>
            <p className="text-gray-500 mb-8">
              Servicio: <span className="font-medium text-black">{servicioSeleccionado.nombre}</span>
            </p>

            <Calendario
              negocioId={negocioId}
              servicioId={servicioSeleccionado.id}
              fechaSeleccionada={fechaSeleccionada}
              onSeleccionarFecha={setFecha}
              periodoVista={periodoVista}
              onCambiarPeriodo={setPeriodoVista}
            />
          </div>
        )}

        {/* Step 3: Staff selection */}
        {pasoActual === 'personal' && servicioSeleccionado && fechaSeleccionada && (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-black mb-3 tracking-tight">
              Selecciona un profesional
            </h1>
            <p className="text-gray-500 mb-8">
              {servicioSeleccionado.nombre} - {formatearFechaMostrar(fechaSeleccionada)}
            </p>

            <SelectorPersonal
              personalDisponible={personalDisponible}
              personalSeleccionado={personalSeleccionado}
              onSeleccionar={setPersonal}
              isLoading={cargandoDisponibilidad}
            />
          </div>
        )}

        {/* Step 4: Time slot selection */}
        {pasoActual === 'horario' && servicioSeleccionado && fechaSeleccionada && personalSeleccionado !== undefined && (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-black mb-3 tracking-tight">
              Selecciona un horario
            </h1>
            <p className="text-gray-500 mb-8">
              {servicioSeleccionado.nombre} - {formatearFechaMostrar(fechaSeleccionada)}
              {personalSeleccionado && ` - ${personalSeleccionado.nombre}`}
            </p>

            <GrillaHorarios
              slots={slotsDelDia}
              personalSeleccionado={personalSeleccionado}
              slotSeleccionado={horarioSeleccionado}
              onSeleccionar={setHorario}
              isLoading={cargandoDisponibilidad}
              ultimaActualizacion={dataUpdatedAt ? new Date(dataUpdatedAt) : undefined}
            />
          </div>
        )}

        {/* Step 5: Confirmation */}
        {pasoActual === 'confirmacion' && (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-black mb-3 tracking-tight">
              Confirma tu reserva
            </h1>
            <p className="text-gray-500 mb-8">
              Revisa los detalles y completa tus datos de contacto
            </p>

            <ConfirmacionReserva
              onConfirmar={handleConfirmar}
              onVolver={handleVolver}
              isLoading={creandoCita}
            />
          </div>
        )}
      </main>
    </div>
  );
}
