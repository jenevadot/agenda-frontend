import { useState } from 'react';
import { CalendarX, Plus, Trash2 } from 'lucide-react';
import {
  useExcepcionesNegocio,
  useCrearExcepcion,
  useEliminarExcepcion,
} from '../../hooks/useNegocio';
import { SpinnerCarga } from '../comunes/SpinnerCarga';
import { Button } from '../comunes/Button';
import { Input } from '../comunes/Input';
import { formatearFechaMostrar } from '../../utils/fecha';

interface Props {
  negocioId: string;
}

/**
 * Component for managing exception dates (holidays, vacations)
 * Implements RF-FE-043
 */
export function GestorExcepciones({ negocioId }: Props) {
  const { data: excepciones, isLoading } = useExcepcionesNegocio(negocioId);
  const { mutate: crear, isPending: isCreando } = useCrearExcepcion(negocioId);
  const { mutate: eliminar, isPending: isEliminando } = useEliminarExcepcion(negocioId);

  const [nuevaFecha, setNuevaFecha] = useState('');
  const [nuevoMotivo, setNuevoMotivo] = useState('');
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);

  const handleAgregar = () => {
    if (!nuevaFecha || !nuevoMotivo.trim()) return;
    crear(
      { fecha: nuevaFecha, motivo: nuevoMotivo.trim() },
      {
        onSuccess: () => {
          setNuevaFecha('');
          setNuevoMotivo('');
        },
      }
    );
  };

  const handleEliminar = (excepcionId: string) => {
    setEliminandoId(excepcionId);
    eliminar(excepcionId, {
      onSettled: () => setEliminandoId(null),
    });
  };

  // Get today's date in YYYY-MM-DD format for min date
  const hoy = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-warning-light rounded-lg flex items-center justify-center">
          <CalendarX className="w-5 h-5 text-warning" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Fechas de Excepcion
          </h2>
          <p className="text-sm text-gray-500">
            Dias en que el negocio estara cerrado
          </p>
        </div>
      </div>

      {/* Form to add new exception */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex-1">
          <Input
            type="date"
            value={nuevaFecha}
            onChange={(e) => setNuevaFecha(e.target.value)}
            min={hoy}
            className="w-full"
          />
        </div>
        <div className="flex-[2]">
          <Input
            type="text"
            value={nuevoMotivo}
            onChange={(e) => setNuevoMotivo(e.target.value)}
            placeholder="Motivo (ej: Feriado, Vacaciones)"
            className="w-full"
          />
        </div>
        <Button
          onClick={handleAgregar}
          disabled={isCreando || !nuevaFecha || !nuevoMotivo.trim()}
          size="sm"
        >
          <Plus className="w-4 h-4 mr-1" />
          Agregar
        </Button>
      </div>

      {/* List of exceptions */}
      {isLoading ? (
        <SpinnerCarga />
      ) : !excepciones || excepciones.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <CalendarX className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No hay fechas de excepcion configuradas</p>
          <p className="text-sm mt-1">
            Las fechas agregadas apareceran aqui
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {excepciones
            .sort((a, b) => a.fechaExcepcion.localeCompare(b.fechaExcepcion))
            .map((exc) => (
              <li
                key={exc.id}
                className="flex justify-between items-center py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-sm font-medium text-gray-600">
                    {new Date(exc.fechaExcepcion + 'T00:00:00').getDate()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {formatearFechaMostrar(new Date(exc.fechaExcepcion + 'T00:00:00'))}
                    </p>
                    <p className="text-sm text-gray-500">{exc.motivo}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEliminar(exc.id)}
                  disabled={isEliminando && eliminandoId === exc.id}
                  className="text-danger hover:text-danger hover:bg-danger-light"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
