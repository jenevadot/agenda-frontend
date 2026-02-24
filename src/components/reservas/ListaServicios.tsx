import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { useServicios } from '../../hooks/useServicios';
import { EnvolvedorQuery } from '../comunes';
import { TarjetaServicio } from './TarjetaServicio';

interface ListaServiciosProps {
  negocioId: string;
}

/**
 * Service list component
 * Displays grid of service cards
 * Implements RF-FE-009, RF-FE-010
 */
export function ListaServicios({ negocioId }: ListaServiciosProps) {
  const navigate = useNavigate();
  const query = useServicios(negocioId);

  const handleReservar = (servicioId: string) => {
    navigate(`/reservar/${negocioId}?servicio=${servicioId}`);
  };

  return (
    <EnvolvedorQuery
      query={query}
      mensajeError="Error al cargar los servicios"
    >
      {(servicios) => {
        if (servicios.length === 0) {
          return (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No hay servicios disponibles</p>
              <p className="text-sm text-gray-400 mt-2">
                Los servicios aparecerán aquí cuando estén configurados
              </p>
            </div>
          );
        }

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicios.map((servicio) => (
              <TarjetaServicio
                key={servicio.id}
                servicio={servicio}
                onReservar={handleReservar}
              />
            ))}
          </div>
        );
      }}
    </EnvolvedorQuery>
  );
}
