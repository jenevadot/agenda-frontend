import { useState } from 'react';
import { X, User, Phone, Mail, Scissors, Calendar, UserX } from 'lucide-react';
import { isPast, parseISO } from 'date-fns';
import type { CitaNegocio } from '../../api/negocios';
import { formatearFechaMostrar, formatearHoraDesdeISO } from '../../utils/fecha';
import { Button } from '../comunes/Button';
import { DialogoConfirmacion } from '../comunes/DialogoConfirmacion';
import { useMarcarNoShow } from '../../hooks/useNegocio';

interface Props {
  cita: CitaNegocio;
  negocioId: string;
  onCerrar: () => void;
}

/**
 * Get status label and color
 */
function getEstadoInfo(estado: string): { label: string; className: string } {
  switch (estado) {
    case 'confirmada':
      return { label: 'Confirmada', className: 'bg-success-light text-success' };
    case 'pendiente':
      return { label: 'Pendiente', className: 'bg-warning-light text-warning' };
    case 'pendiente_actualizacion':
      return { label: 'Pendiente de actualizacion', className: 'bg-info-light text-info' };
    case 'completada':
      return { label: 'Completada', className: 'bg-gray-100 text-gray-600' };
    case 'cancelada':
      return { label: 'Cancelada', className: 'bg-danger-light text-danger' };
    case 'no_show':
      return { label: 'No asistio', className: 'bg-purple-100 text-purple-700' };
    default:
      return { label: estado, className: 'bg-gray-100 text-gray-600' };
  }
}

/**
 * Modal for displaying appointment details in admin view
 */
export function ModalDetalleCitaAdmin({ cita, negocioId, onCerrar }: Props) {
  const [mostrarConfirmNoShow, setMostrarConfirmNoShow] = useState(false);
  const estadoInfo = getEstadoInfo(cita.estado);
  const fechaCita = new Date(cita.fechaHoraInicio);

  const { mutate: marcarNoShow, isPending: marcandoNoShow } = useMarcarNoShow();

  const esPasada = isPast(parseISO(cita.fechaHoraFin));
  const puedeMarcarNoShow =
    esPasada && (cita.estado === 'confirmada' || cita.estado === 'completada');

  const handleConfirmarNoShow = () => {
    marcarNoShow(
      { negocioId, citaId: cita.id },
      {
        onSuccess: () => {
          setMostrarConfirmNoShow(false);
          onCerrar();
        },
        onSettled: () => {
          setMostrarConfirmNoShow(false);
        },
      }
    );
  };

  return (
    <>
      <div className="fixed inset-0 z-[300] overflow-y-auto">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onCerrar}
        />

        {/* Modal */}
        <div className="relative min-h-screen flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                Detalle de Cita
              </h3>
              <button
                onClick={onCerrar}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Status badge */}
              <div className="flex justify-between items-start">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${estadoInfo.className}`}>
                  {estadoInfo.label}
                </span>
                <span className="text-sm text-gray-500">
                  #{cita.numeroConfirmacion}
                </span>
              </div>

              {/* Service info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-info-light rounded-lg flex items-center justify-center">
                    <Scissors className="w-5 h-5 text-info" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{cita.servicioNombre}</p>
                    <p className="text-sm text-gray-500">
                      {cita.servicioDuracionMinutos} minutos
                    </p>
                  </div>
                </div>
              </div>

              {/* Date and time */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-success-light rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {formatearFechaMostrar(fechaCita)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatearHoraDesdeISO(cita.fechaHoraInicio)} - {formatearHoraDesdeISO(cita.fechaHoraFin)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Staff */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-warning-light rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Atendido por</p>
                  <p className="font-medium text-gray-900">{cita.personalNombre}</p>
                </div>
              </div>

              {/* Divider */}
              <hr className="border-gray-100" />

              {/* Client info */}
              <div>
                <p className="text-sm font-medium text-gray-500 mb-3">
                  Informacion del cliente
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-700">
                    <User className="w-4 h-4 text-gray-400" />
                    <span>{cita.clienteNombre}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <a
                      href={`mailto:${cita.clienteEmail}`}
                      className="hover:text-gray-900 transition-colors"
                    >
                      {cita.clienteEmail}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <a
                      href={`tel:${cita.clienteTelefono}`}
                      className="hover:text-gray-900 transition-colors"
                    >
                      {cita.clienteTelefono}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 flex gap-2">
              {puedeMarcarNoShow && (
                <Button
                  variant="ghost"
                  onClick={() => setMostrarConfirmNoShow(true)}
                  disabled={marcandoNoShow}
                  className="flex-1 text-purple-700 hover:bg-purple-50 gap-2"
                >
                  <UserX className="w-4 h-4" />
                  No Asistio
                </Button>
              )}
              <Button
                variant="secondary"
                onClick={onCerrar}
                className={puedeMarcarNoShow ? 'flex-1' : 'w-full'}
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation dialog for no-show */}
      <DialogoConfirmacion
        abierto={mostrarConfirmNoShow}
        titulo="Marcar como No Asistio"
        mensaje={`Confirmas que ${cita.clienteNombre} no se presento a la cita? Esta accion no se puede revertir.`}
        onConfirmar={handleConfirmarNoShow}
        onCancelar={() => setMostrarConfirmNoShow(false)}
        variante="peligro"
        textoConfirmar="Confirmar"
        textoCancelar="Cancelar"
      />
    </>
  );
}
