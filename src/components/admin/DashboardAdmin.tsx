import { Link } from 'react-router-dom';
import { Calendar, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { useCitasNegocio } from '../../hooks/useNegocio';
import { SpinnerCarga } from '../comunes/SpinnerCarga';
import {
  formatearFechaApi,
  formatearHoraDesdeISO,
  addDays,
} from '../../utils/fecha';

interface Props {
  negocioId: string;
}

/**
 * Admin dashboard with summary statistics and quick actions
 */
export function DashboardAdmin({ negocioId }: Props) {
  const hoy = new Date();

  // Fetch today's appointments
  const { data: citasHoy, isLoading: cargandoHoy } = useCitasNegocio(negocioId, {
    fechaInicio: formatearFechaApi(hoy),
    fechaFin: formatearFechaApi(hoy),
  });

  // Fetch this week's appointments
  const { data: citasSemana, isLoading: cargandoSemana } = useCitasNegocio(negocioId, {
    fechaInicio: formatearFechaApi(hoy),
    fechaFin: formatearFechaApi(addDays(hoy, 7)),
  });

  const citasPendientes = citasHoy?.filter((c) =>
    ['pendiente', 'confirmada'].includes(c.estado)
  );

  const citasCompletadasHoy = citasHoy?.filter(
    (c) => c.estado === 'completada'
  );

  // Sort pending by time to get next appointment
  const proximaCita = citasPendientes
    ?.sort((a, b) => a.fechaHoraInicio.localeCompare(b.fechaHoraInicio))
    ?.find((c) => new Date(c.fechaHoraInicio) > hoy);

  if (cargandoHoy || cargandoSemana) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8">
        <SpinnerCarga />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
        <p className="text-gray-600">
          Resumen de actividad de tu negocio
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's appointments */}
        <div className="bg-white rounded-xl shadow-md p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-info-light rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-info" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">
                {citasPendientes?.length || 0}
              </p>
              <p className="text-sm text-gray-500">Citas hoy</p>
            </div>
          </div>
        </div>

        {/* This week */}
        <div className="bg-white rounded-xl shadow-md p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-success-light rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">
                {citasSemana?.length || 0}
              </p>
              <p className="text-sm text-gray-500">Esta semana</p>
            </div>
          </div>
        </div>

        {/* Completed today */}
        <div className="bg-white rounded-xl shadow-md p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">
                {citasCompletadasHoy?.length || 0}
              </p>
              <p className="text-sm text-gray-500">Completadas hoy</p>
            </div>
          </div>
        </div>

        {/* Next appointment */}
        <div className="bg-white rounded-xl shadow-md p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-warning-light rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">
                {proximaCita
                  ? formatearHoraDesdeISO(proximaCita.fechaHoraInicio)
                  : '--:--'}
              </p>
              <p className="text-sm text-gray-500">Proxima cita</p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's appointments list */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-900">Proximas citas de hoy</h3>
          <Link
            to={`/admin/${negocioId}/agenda`}
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Ver agenda completa →
          </Link>
        </div>

        {!citasPendientes?.length ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No hay citas pendientes para hoy</p>
          </div>
        ) : (
          <div className="space-y-3">
            {citasPendientes
              .sort((a, b) => a.fechaHoraInicio.localeCompare(b.fechaHoraInicio))
              .slice(0, 5)
              .map((cita) => (
                <div
                  key={cita.id}
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center font-semibold text-gray-700 shadow-sm">
                      {formatearHoraDesdeISO(cita.fechaHoraInicio).split(':')[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {cita.servicioNombre}
                      </p>
                      <p className="text-sm text-gray-500">
                        {cita.clienteNombre} • {cita.personalNombre}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {formatearHoraDesdeISO(cita.fechaHoraInicio)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {cita.servicioDuracionMinutos} min
                    </p>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Acciones rapidas</h3>
        <div className="flex flex-wrap gap-3">
          <Link
            to={`/admin/${negocioId}/servicios`}
            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-700 font-medium transition-colors"
          >
            Gestionar servicios
          </Link>
          <Link
            to={`/admin/${negocioId}/horarios`}
            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-700 font-medium transition-colors"
          >
            Configurar horarios
          </Link>
          <Link
            to={`/admin/${negocioId}/agenda`}
            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-700 font-medium transition-colors"
          >
            Ver agenda completa
          </Link>
          <Link
            to={`/admin/${negocioId}/personal`}
            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-700 font-medium transition-colors"
          >
            Gestionar personal
          </Link>
        </div>
      </div>
    </div>
  );
}
