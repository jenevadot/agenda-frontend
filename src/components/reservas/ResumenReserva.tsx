import { Calendar, Clock, User, Scissors } from 'lucide-react';
import { formatearFechaMostrar, formatearRangoHorario } from '../../utils/fecha';
import type { Servicio } from '../../tipos';
import type { HorarioDisponible, PersonalSimple } from '../../stores/flujoReservaStore';

interface ResumenReservaProps {
  servicio: Servicio;
  fecha: Date;
  horario: HorarioDisponible;
  personal: PersonalSimple | null;
}

/**
 * Premium booking summary with black/white design
 */
export function ResumenReserva({
  servicio,
  fecha,
  horario,
  personal,
}: ResumenReservaProps) {
  return (
    <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
      <h3 className="font-bold text-black mb-6">Resumen de tu reserva</h3>

      <dl className="space-y-4">
        <div className="flex items-start gap-4">
          <dt className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
            <Scissors className="w-4 h-4 text-black" />
          </dt>
          <dd className="flex-1 pt-1">
            <span className="text-sm text-gray-500">Servicio</span>
            <p className="font-medium text-black">{servicio.nombre}</p>
            <span className="text-xs text-gray-400">
              {servicio.duracionMinutos} minutos
            </span>
          </dd>
        </div>

        <div className="flex items-start gap-4">
          <dt className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-4 h-4 text-black" />
          </dt>
          <dd className="flex-1 pt-1">
            <span className="text-sm text-gray-500">Fecha</span>
            <p className="font-medium text-black">
              {formatearFechaMostrar(fecha)}
            </p>
          </dd>
        </div>

        <div className="flex items-start gap-4">
          <dt className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
            <Clock className="w-4 h-4 text-black" />
          </dt>
          <dd className="flex-1 pt-1">
            <span className="text-sm text-gray-500">Horario</span>
            <p className="font-medium text-black">
              {formatearRangoHorario(horario.horaInicio, horario.horaFin)}
            </p>
          </dd>
        </div>

        <div className="flex items-start gap-4">
          <dt className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-black" />
          </dt>
          <dd className="flex-1 pt-1">
            <span className="text-sm text-gray-500">Profesional</span>
            <p className="font-medium text-black">
              {personal ? personal.nombre : 'Se asignara automaticamente'}
            </p>
          </dd>
        </div>

        <div className="pt-4 mt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Precio total</span>
            <span className="font-bold text-2xl text-black">
              S/ {servicio.precioPen.toFixed(2)}
            </span>
          </div>
        </div>
      </dl>
    </div>
  );
}
