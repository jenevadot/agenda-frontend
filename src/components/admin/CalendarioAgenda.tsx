import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useCitasNegocio } from '../../hooks/useNegocio';
import type { CitaNegocio } from '../../api/negocios';
import { SpinnerCarga } from '../comunes/SpinnerCarga';
import { Button } from '../comunes/Button';
import {
  formatearFechaApi,
  calcularRangoVista,
  formatearRangoFechas,
  addDays,
  subDays,
  type TipoVista,
} from '../../utils/fecha';
import { VistaDiaria } from './VistaDiaria';
import { VistaSemanal } from './VistaSemanal';
import { ModalDetalleCitaAdmin } from './ModalDetalleCitaAdmin';

type FiltroRapido = 'hoy' | 'manana' | 'semana' | 'dos_semanas';

interface Props {
  negocioId: string;
}

/**
 * Admin calendar component for viewing all business appointments
 * Implements RF-FE-044, RF-FE-045
 */
export function CalendarioAgenda({ negocioId }: Props) {
  const [tipoVista, setTipoVista] = useState<TipoVista>('semana');
  const [fechaBase, setFechaBase] = useState(new Date());
  const [citaSeleccionada, setCitaSeleccionada] = useState<CitaNegocio | null>(null);

  const { fechaInicio, fechaFin } = useMemo(() => {
    return calcularRangoVista(fechaBase, tipoVista);
  }, [fechaBase, tipoVista]);

  const { data: citas, isLoading } = useCitasNegocio(negocioId, {
    fechaInicio: formatearFechaApi(fechaInicio),
    fechaFin: formatearFechaApi(fechaFin),
  });

  const aplicarFiltroRapido = (filtro: FiltroRapido) => {
    const hoy = new Date();
    switch (filtro) {
      case 'hoy':
        setFechaBase(hoy);
        setTipoVista('dia');
        break;
      case 'manana':
        setFechaBase(addDays(hoy, 1));
        setTipoVista('dia');
        break;
      case 'semana':
        setFechaBase(hoy);
        setTipoVista('semana');
        break;
      case 'dos_semanas':
        setFechaBase(hoy);
        setTipoVista('quincena');
        break;
    }
  };

  const navegarAnterior = () => {
    const dias = tipoVista === 'dia' ? 1 : tipoVista === 'semana' ? 7 : 14;
    setFechaBase(subDays(fechaBase, dias));
  };

  const navegarSiguiente = () => {
    const dias = tipoVista === 'dia' ? 1 : tipoVista === 'semana' ? 7 : 14;
    setFechaBase(addDays(fechaBase, dias));
  };

  const irAHoy = () => {
    setFechaBase(new Date());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-info-light rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-info" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Agenda del Negocio
            </h2>
            <p className="text-sm text-gray-500">
              Visualiza todas las citas programadas
            </p>
          </div>
        </div>
      </div>

      {/* Quick filters - RF-FE-045 */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'hoy', texto: 'Hoy' },
          { id: 'manana', texto: 'Manana' },
          { id: 'semana', texto: 'Esta semana' },
          { id: 'dos_semanas', texto: 'Proximas 2 semanas' },
        ].map((filtro) => (
          <button
            key={filtro.id}
            onClick={() => aplicarFiltroRapido(filtro.id as FiltroRapido)}
            className="px-3 py-1.5 text-sm rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
          >
            {filtro.texto}
          </button>
        ))}
      </div>

      {/* View controls and navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* View type selector */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {([
            { value: 'dia', label: 'Dia' },
            { value: 'semana', label: 'Semana' },
            { value: 'quincena', label: 'Quincena' },
          ] as const).map((vista) => (
            <button
              key={vista.value}
              onClick={() => setTipoVista(vista.value)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                tipoVista === vista.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {vista.label}
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={irAHoy}>
            Hoy
          </Button>
          <Button variant="ghost" size="sm" onClick={navegarAnterior}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="min-w-[200px] text-center font-medium text-gray-900">
            {formatearRangoFechas(fechaInicio, fechaFin)}
          </span>
          <Button variant="ghost" size="sm" onClick={navegarSiguiente}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {isLoading ? (
          <div className="p-8">
            <SpinnerCarga />
          </div>
        ) : tipoVista === 'dia' ? (
          <VistaDiaria
            citas={citas || []}
            fecha={fechaBase}
            onClickCita={setCitaSeleccionada}
          />
        ) : (
          <VistaSemanal
            citas={citas || []}
            fechaInicio={fechaInicio}
            fechaFin={fechaFin}
            onClickCita={setCitaSeleccionada}
          />
        )}
      </div>

      {/* Appointment detail modal */}
      {citaSeleccionada && (
        <ModalDetalleCitaAdmin
          cita={citaSeleccionada}
          onCerrar={() => setCitaSeleccionada(null)}
        />
      )}
    </div>
  );
}
