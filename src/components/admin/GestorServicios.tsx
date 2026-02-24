import { useState } from 'react';
import { Plus, Edit, Trash2, Scissors, Clock, DollarSign } from 'lucide-react';
import { useServicios } from '../../hooks/useServicios';
import { SpinnerCarga } from '../comunes/SpinnerCarga';
import { Button } from '../comunes/Button';
import { Input } from '../comunes/Input';
import type { Servicio } from '../../tipos';

interface Props {
  negocioId: string;
}

/**
 * Component for managing business services
 * Implements RF-FE-041
 */
export function GestorServicios({ negocioId }: Props) {
  const { data: servicios, isLoading } = useServicios(negocioId);
  const [modoEdicion, setModoEdicion] = useState<'lista' | 'crear' | 'editar'>('lista');
  const [servicioEnEdicion, setServicioEditando] = useState<Servicio | null>(null);

  // Form state for create/edit
  const [nombre, setNombre] = useState('');
  const [duracionMinutos, setDuracionMinutos] = useState(30);
  const [precioPen, setPrecioPen] = useState(0);

  const handleCrear = () => {
    setNombre('');
    setDuracionMinutos(30);
    setPrecioPen(0);
    setModoEdicion('crear');
  };

  const handleEditar = (servicio: Servicio) => {
    setServicioEditando(servicio);
    setNombre(servicio.nombre);
    setDuracionMinutos(servicio.duracionMinutos);
    setPrecioPen(servicio.precioPen);
    setModoEdicion('editar');
  };

  const handleCancelar = () => {
    setModoEdicion('lista');
    setServicioEditando(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement API call to create/update service
    console.log('Submit service:', { nombre, duracionMinutos, precioPen, servicioEnEdicion });
    handleCancelar();
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8">
        <SpinnerCarga />
      </div>
    );
  }

  // Form view for create/edit
  if (modoEdicion === 'crear' || modoEdicion === 'editar') {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          {modoEdicion === 'crear' ? 'Crear nuevo servicio' : 'Editar servicio'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del servicio
            </label>
            <Input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Corte de cabello"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duracion (minutos)
              </label>
              <Input
                type="number"
                value={duracionMinutos}
                onChange={(e) => setDuracionMinutos(Number(e.target.value))}
                min={15}
                max={480}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio (S/)
              </label>
              <Input
                type="number"
                value={precioPen}
                onChange={(e) => setPrecioPen(Number(e.target.value))}
                min={0}
                step={0.01}
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancelar}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              {modoEdicion === 'crear' ? 'Crear servicio' : 'Guardar cambios'}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-info-light rounded-lg flex items-center justify-center">
              <Scissors className="w-5 h-5 text-info" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Gestion de Servicios
              </h2>
              <p className="text-sm text-gray-500">
                Administra los servicios de tu negocio
              </p>
            </div>
          </div>
          <Button onClick={handleCrear}>
            <Plus className="w-4 h-4 mr-1" />
            Nuevo servicio
          </Button>
        </div>
      </div>

      {/* Services list */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {!servicios || servicios.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Scissors className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No hay servicios configurados</p>
            <p className="text-sm mt-1">
              Crea tu primer servicio para empezar
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {servicios.map((servicio) => (
              <div
                key={servicio.id}
                className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Scissors className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{servicio.nombre}</p>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {servicio.duracionMinutos} min
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        S/ {servicio.precioPen.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditar(servicio)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-danger hover:text-danger hover:bg-danger-light"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
